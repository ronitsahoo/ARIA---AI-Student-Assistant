import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [studentData, setStudentData] = useState(null);
    const [allStudents, setAllStudents] = useState([]);
    const [progress, setProgress] = useState(0);

    const formatStudentData = (backendData) => {
        if (!backendData) return null;

        // Documents
        const defaultDocs = ["10th Marksheet", "12th Marksheet", "ID Proof", "Transfer Certificate"];
        const files = {};
        let approvedCount = 0;

        defaultDocs.forEach(key => {
            // Find the latest document of this type (prefer submitted/approved/rejected over uploaded)
            const docsOfType = backendData.documents.filter(d => d.type === key);
            // Priority: approved > rejected > submitted > uploaded > none
            const priority = ['approved', 'rejected', 'submitted', 'uploaded'];
            let found = null;
            for (const status of priority) {
                found = docsOfType.find(d => d.status === status);
                if (found) break;
            }

            if (found) {
                files[key] = {
                    id: found._id,
                    status: found.status,
                    file: found.originalName || found.fileUrl.split('/').pop(),
                    url: found.fileUrl,
                    reason: found.rejectionReason,
                    uploadedAt: found.createdAt || found.updatedAt || new Date().toISOString()
                };
                if (found.status === 'approved') approvedCount++;
            } else {
                files[key] = { status: 'pending', file: null };
            }
        });

        // Overall doc status
        const allStatuses = Object.values(files).map(f => f.status);
        let overallDocStatus = 'pending';
        if (approvedCount === defaultDocs.length) overallDocStatus = 'approved';
        else if (allStatuses.some(s => s === 'rejected')) overallDocStatus = 'rejected';
        else if (allStatuses.some(s => s === 'submitted')) overallDocStatus = 'submitted';
        else if (allStatuses.some(s => s === 'uploaded')) overallDocStatus = 'uploaded';

        // Fee
        const feeStatus = backendData.fee.status;
        const fee = {
            status: feeStatus,
            totalAmount: 50000,
            paidAmount: feeStatus === 'paid' ? 50000 : 0,
            history: feeStatus === 'paid' ? [{
                amount: 50000,
                date: backendData.fee.updatedAt || new Date().toISOString(),
                id: backendData.fee.transactionId
            }] : []
        };

        // Hostel
        const hostel = {
            status: backendData.hostel.status || 'not_applied',
            gender: backendData.hostel.gender || null,
            roomType: backendData.hostel.roomType || null,
            rejectionReason: backendData.hostel.rejectionReason || null
        };

        // LMS
        const lms = {
            status: backendData.lmsActivated ? 'active' : 'inactive',
            registeredCourses: []
        };

        return {
            ...backendData,
            documents: { status: overallDocStatus, files },
            fee,
            hostel,
            lms
        };
    };

    const fetchStudentData = useCallback(async () => {
        try {
            const { data } = await api.get('/student/profile');
            if (data) {
                const formatted = formatStudentData(data);
                setStudentData(formatted);
                setProgress(data.progressPercentage || 0);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    }, []);

    const fetchAllStudents = useCallback(async () => {
        try {
            let endpoint = '/admin/students';
            if (user?.role === 'staff') endpoint = '/staff/pending-documents';

            const { data } = await api.get(endpoint);

            const transformed = data.map(profile => {
                if (!profile.userId) return null;

                // Build verification history from notifications
                const verificationHistory = (profile.notifications || [])
                    .filter(n => n.message && (n.message.includes('approved') || n.message.includes('rejected')))
                    .map(n => {
                        const isApproved = n.message.includes('approved');
                        // Extract doc type from notification message
                        const match = n.message.match(/\((.+?)\)/);
                        return {
                            file: match ? match[1] : 'Document',
                            status: isApproved ? 'approved' : 'rejected',
                            reason: isApproved ? null : n.message.split(': ')[1] || '',
                            date: n.date
                        };
                    });

                return {
                    id: profile.userId._id,
                    name: profile.userId.name,
                    email: profile.userId.email,
                    role: profile.userId.role || 'student',
                    branch: profile.userId.branch,
                    year: profile.userId.year,
                    verificationHistory,
                    data: formatStudentData(profile)
                };
            }).filter(Boolean);

            setAllStudents(transformed);
        } catch (error) {
            console.error("Failed to fetch students", error);
        }
    }, [user?.role]);

    useEffect(() => {
        if (!user) {
            setStudentData(null);
            setAllStudents([]);
            setProgress(0);
            return;
        }
        if (user.role === 'student') fetchStudentData();
        else fetchAllStudents();
    }, [user, fetchStudentData, fetchAllStudents]);

    // ACTIONS

    const uploadDocument = async (type, file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        try {
            await api.post('/student/upload-document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchStudentData();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const deleteDocument = async (docId) => {
        try {
            await api.delete(`/student/document/${docId}`);
            await fetchStudentData();
            return true;
        } catch (error) {
            console.error("Delete failed:", error);
            return false;
        }
    };

    const submitDocuments = async () => {
        try {
            await api.post('/student/submit-documents');
            await fetchStudentData();
            return true;
        } catch (error) {
            console.error("Submit failed:", error);
            return false;
        }
    };

    const initiateFeePayment = async (amount) => {
        try {
            const { data: order } = await api.post('/payment/create-order', { amount });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
                amount: order.amount,
                currency: "INR",
                name: "ARIA University",
                description: "Tuition Fee Payment",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        alert("Payment Successful!");
                        await fetchStudentData();
                    } catch (error) {
                        alert("Payment Verification Failed");
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error("Payment init failed", error);
            alert("Could not initiate payment");
        }
    };

    const applyHostel = async (gender, roomType) => {
        try {
            await api.post('/student/apply-hostel', { gender, roomType });
            await fetchStudentData();
            return { success: true };
        } catch (error) {
            console.error(error);
            const msg = error?.response?.data?.message || 'Failed to apply';
            return { success: false, message: msg };
        }
    };

    const fetchHostelApplications = async () => {
        try {
            const { data } = await api.get('/admin/hostel-applications');
            return data;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const approveRejectHostel = async (studentId, status, rejectionReason = '') => {
        try {
            await api.put(`/admin/hostel-applications/${studentId}`, { status, rejectionReason });
            await fetchAllStudents();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const activateLMS = async () => {
        try {
            await api.post('/student/activate-lms');
            await fetchStudentData();
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const { data } = await api.get('/student/subjects');
            return data;
        } catch (error) {
            console.error("Failed to fetch subjects", error);
            return [];
        }
    };

    const registerSubject = async (subjectId) => {
        try {
            await api.post('/student/register-subject', { subjectId });
            await fetchStudentData();
            return true;
        } catch (error) {
            console.error("Failed to register subject", error);
            throw error;
        }
    };

    const fetchRegisteredSubjects = async () => {
        try {
            const { data } = await api.get('/student/registered-subjects');
            return data;
        } catch (error) {
            console.error("Failed to fetch registered subjects", error);
            return [];
        }
    };

    const updateModuleStatus = (moduleName, newData) => {
        console.warn("updateModuleStatus is deprecated. Use specific actions.");
    };

    const updateStudentStatus = async (studentId, moduleName, status, reason = null, fileKey = null) => {
        if (moduleName === 'documents' && fileKey) {
            const student = allStudents.find(s => s.id === studentId);
            const docId = student?.data?.documents?.files?.[fileKey]?.id;

            if (docId) {
                try {
                    await api.put('/staff/verify-document', {
                        studentId,
                        documentId: docId,
                        status,
                        rejectionReason: reason
                    });
                    await fetchAllStudents();
                } catch (error) {
                    console.error("Verification failed", error);
                }
            } else {
                console.error("Document ID not found for verification");
            }
        }
    };

    return (
        <DataContext.Provider value={{
            studentData,
            allStudents,
            progress,
            fetchStudentData,
            fetchAllStudents,
            uploadDocument,
            deleteDocument,
            submitDocuments,
            initiateFeePayment,
            applyHostel,
            activateLMS,
            fetchSubjects,
            registerSubject,
            fetchRegisteredSubjects,
            updateModuleStatus,
            updateStudentStatus,
            fetchHostelApplications,
            approveRejectHostel
        }}>
            {children}
        </DataContext.Provider>
    );
};
