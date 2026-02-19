import { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, CreditCard, Home, BookOpen, Clock, XCircle, FileText, Download } from 'lucide-react';
import { Button, Card, Input } from '../components/UI';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

// Helper for conditional classes
const getModuleClasses = (fullPage) => ({
    card: fullPage ? "h-full min-h-[80vh] flex flex-col relative overflow-hidden group hover:neon-shadow-blue transition-all duration-500" : "h-full min-h-[300px] flex flex-col relative overflow-hidden group hover:neon-shadow-blue transition-all duration-500",
    iconSize: fullPage ? 250 : 120,
    padding: fullPage ? "p-10" : "p-6",
    headerSize: fullPage ? "text-4xl" : "text-xl",
    iconHeaderSize: fullPage ? 40 : 22,
    subHeader: fullPage ? "text-xl" : "text-sm",
    grid: fullPage ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "flex flex-col gap-4",
    buttonSize: fullPage ? "lg" : "sm"
});


// --- DOCUMENTS MODULE ---
export function DocumentUpload({ fullPage = false }) {
    const { studentData, uploadDocument, deleteDocument, submitDocuments } = useData();
    const [uploadingDoc, setUploadingDoc] = useState(null);
    const [deletingDoc, setDeletingDoc] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const styles = getModuleClasses(fullPage);
    // Strip '/api' suffix to get server root for file URLs
    const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

    const files = studentData?.documents?.files || {};
    const overallStatus = studentData?.documents?.status || 'pending';

    const handleFileUpload = async (docName, file) => {
        setUploadingDoc(docName);
        try {
            await uploadDocument(docName, file);
        } catch (e) {
            console.error(e);
        } finally {
            setUploadingDoc(null);
        }
    };

    const handleDelete = async (docName) => {
        const doc = files[docName];
        if (!doc?.id) return;
        setDeletingDoc(docName);
        try {
            await deleteDocument(doc.id);
        } catch (e) {
            console.error(e);
        } finally {
            setDeletingDoc(null);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await submitDocuments();
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30';
            case 'rejected': return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30';
            case 'submitted': return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
            case 'uploaded': return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30';
            default: return 'bg-gray-100 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
        }
    };

    const getOverallStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20';
            case 'rejected': return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20';
            case 'submitted': return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-500/20';
            case 'uploaded': return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20';
            default: return 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
        }
    };

    // Has at least one doc that's uploaded (ready to submit) but not yet submitted
    const hasUploadedDocs = Object.values(files).some(f => f.status === 'uploaded');
    // All docs are in a final-ish state (no more uploads pending)
    const pendingCount = Object.values(files).filter(f => f.status === 'pending').length;

    return (
        <Card className={styles.card}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Upload size={styles.iconSize} className="text-blue-500 dark:text-neon-blue" />
            </div>

            <div className={`${styles.padding} flex-1 flex flex-col`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`${styles.headerSize} font-bold flex items-center gap-3 text-gray-900 dark:text-white dark:text-glow`}>
                        <FileText size={styles.iconHeaderSize} className="text-blue-600 dark:text-neon-blue" /> Documents
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getOverallStatusColor(overallStatus)}`}>
                        {overallStatus}
                    </span>
                </div>

                {pendingCount > 0 ? (
                    <p className={`${styles.subHeader} text-orange-500 dark:text-orange-400 mb-4 flex items-center gap-2`}>
                        <AlertCircle size={styles.iconHeaderSize * 0.6} /> {pendingCount} document{pendingCount > 1 ? 's' : ''} not yet uploaded
                    </p>
                ) : hasUploadedDocs ? (
                    <p className={`${styles.subHeader} text-yellow-600 dark:text-yellow-400 mb-4 flex items-center gap-2`}>
                        <AlertCircle size={styles.iconHeaderSize * 0.6} /> Files ready — click Submit to send for review
                    </p>
                ) : (
                    <p className={`${styles.subHeader} text-green-600 dark:text-green-400 mb-4 flex items-center gap-2`}>
                        <CheckCircle size={styles.iconHeaderSize * 0.6} /> All documents submitted
                    </p>
                )}

                <div className={`space-y-4 overflow-y-auto ${fullPage ? 'max-h-[55vh]' : 'max-h-[360px]'} custom-scrollbar pr-2 flex-1`}>
                    {Object.keys(files).map((docName) => {
                        const doc = files[docName];
                        const isUploading = uploadingDoc === docName;
                        const isDeleting = deletingDoc === docName;
                        const canDelete = doc.file && (doc.status === 'uploaded');
                        const canUpload = doc.status === 'pending' || doc.status === 'rejected';

                        return (
                            <div key={docName} className={`p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors ${fullPage ? 'text-lg' : 'text-sm'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-medium text-gray-700 dark:text-gray-200">{docName}</span>
                                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded border font-bold ${getStatusColor(doc.status)}`}>
                                        {doc.status === 'uploaded' ? 'ready' : doc.status}
                                    </span>
                                </div>

                                {doc.status === 'rejected' && doc.reason && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mb-2 flex items-center gap-1">
                                        <XCircle size={12} /> Rejected: {doc.reason}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 mt-1">
                                    {doc.file && !canUpload ? (
                                        /* Uploaded / Submitted / Approved — show filename */
                                        <div className="flex-1 flex items-center gap-2 text-blue-600 dark:text-neon-blue bg-blue-50 dark:bg-neon-blue/5 px-3 py-2 rounded-lg border border-blue-100 dark:border-neon-blue/10 min-w-0">
                                            <FileText size={14} className="flex-shrink-0" />
                                            <a
                                                href={`${SERVER_URL}${doc.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="truncate text-xs hover:underline"
                                                title={doc.file}
                                            >
                                                {doc.file}
                                            </a>
                                        </div>
                                    ) : (
                                        /* Not yet uploaded or rejected — show upload area */
                                        <label className={`flex-1 cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={(e) => e.target.files[0] && handleFileUpload(docName, e.target.files[0])}
                                                disabled={isUploading}
                                            />
                                            <div className={`text-center border border-dashed rounded-lg py-2 px-3 transition-colors text-xs ${isUploading
                                                ? 'border-blue-300 dark:border-neon-blue/50 text-blue-500 dark:text-neon-blue cursor-wait'
                                                : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-500 dark:hover:border-neon-blue hover:text-blue-600 dark:hover:text-neon-blue'
                                                }`}>
                                                {isUploading ? 'Uploading...' : (doc.status === 'rejected' ? '↑ Re-upload File' : '↑ Click to Upload')}
                                            </div>
                                        </label>
                                    )}

                                    {/* Delete button — only for uploaded (not yet submitted) docs */}
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(docName)}
                                            disabled={isDeleting}
                                            title="Delete and re-upload"
                                            className={`p-2 rounded-lg border transition-colors flex-shrink-0 ${isDeleting
                                                ? 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-300 cursor-wait'
                                                : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20'
                                                }`}
                                        >
                                            {isDeleting ? (
                                                <Clock size={14} />
                                            ) : (
                                                <XCircle size={14} />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Submit All button — shown only when at least one doc is in 'uploaded' state */}
                {hasUploadedDocs && (
                    <div className={`mt-5 pt-4 border-t border-gray-100 dark:border-white/5`}>
                        <Button
                            onClick={handleSubmit}
                            isLoading={submitting}
                            disabled={submitting}
                            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-neon-blue dark:to-indigo-500 hover:from-blue-700 hover:to-indigo-700 text-white border-none shadow-lg shadow-blue-500/20 font-semibold`}
                            size={styles.buttonSize}
                        >
                            {submitting ? 'Submitting...' : '✓ Submit All Documents for Review'}
                        </Button>
                        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">Once submitted, you cannot delete the files</p>
                    </div>
                )}
            </div>
        </Card>
    );
}


// --- FEE PAYMENT MODULE ---
export function FeePayment({ fullPage = false }) {
    const { studentData, initiateFeePayment } = useData(); // NEW ACTION
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const styles = getModuleClasses(fullPage);

    const feeData = studentData?.fee || { totalAmount: 50000, paidAmount: 0, history: [] };
    const remaining = feeData.totalAmount - feeData.paidAmount;
    const isPaid = feeData.status === 'paid';

    const handlePay = async (payAmount) => {
        if (!payAmount || payAmount <= 0) return;
        setLoading(true);
        try {
            await initiateFeePayment(payAmount);
        } catch (e) { console.error(e) } finally {
            setLoading(false);
            setAmount('');
        }
    };

    return (
        <Card className={styles.card}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CreditCard size={styles.iconSize} className="text-purple-500 dark:text-neon-purple" />
            </div>

            <div className={`${styles.padding} flex-1 flex flex-col`}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className={`${styles.headerSize} font-bold flex items-center gap-3 text-gray-900 dark:text-white dark:text-glow`}>
                        <CreditCard size={styles.iconHeaderSize} className="text-purple-600 dark:text-neon-purple" /> Tuition Fee
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isPaid ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20' : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20'}`}>
                        {isPaid ? 'PAID' : 'PENDING'}
                    </span>
                </div>

                <div className={fullPage ? "grid grid-cols-2 gap-8 mb-10" : "grid grid-cols-2 gap-4 mb-6"}>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                        <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Total Fee</p>
                        <p className={`${fullPage ? 'text-4xl' : 'text-xl'} font-bold text-gray-900 dark:text-white`}>₹{feeData.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                        <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Remaining</p>
                        <p className={`${fullPage ? 'text-4xl' : 'text-xl'} font-bold ${remaining > 0 ? 'text-pink-600 dark:text-neon-pink' : 'text-green-600 dark:text-green-400'}`}>₹{remaining.toLocaleString()}</p>
                    </div>
                </div>

                {!isPaid && (
                    <div className="space-y-6 mb-8">
                        <div className="flex gap-4">
                            <button onClick={() => setAmount(remaining)} className="flex-1 py-2 text-sm bg-purple-50 dark:bg-neon-purple/10 border border-purple-200 dark:border-neon-purple/30 text-purple-700 dark:text-neon-purple rounded-lg hover:bg-purple-100 dark:hover:bg-neon-purple/20 transition-colors">
                                Pay Full (₹{remaining / 1000}k)
                            </button>
                            <button onClick={() => setAmount(Math.ceil(remaining / 2))} className="flex-1 py-2 text-sm bg-purple-50 dark:bg-neon-purple/10 border border-purple-200 dark:border-neon-purple/30 text-purple-700 dark:text-neon-purple rounded-lg hover:bg-purple-100 dark:hover:bg-neon-purple/20 transition-colors">
                                Pay Half (₹{Math.ceil(remaining / 2000)}k)
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Enter Amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={fullPage ? "py-4 text-xl" : "py-2 text-sm"}
                                containerClassName="flex-1"
                            />
                            <Button
                                onClick={() => handlePay(amount)}
                                isLoading={loading}
                                disabled={!amount || amount > remaining}
                                variant="primary"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-neon-purple dark:to-neon-magenta hover:from-purple-700 hover:to-pink-700 text-white"
                                size={styles.buttonSize}
                            >
                                Pay
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2"><Clock size={16} /> Payment History</h4>
                    <div className={`space-y-3 overflow-y-auto ${fullPage ? 'max-h-[300px]' : 'max-h-[200px]'} custom-scrollbar pr-2`}>
                        {feeData.history && feeData.history.length > 0 ? (
                            feeData.history.map((tx, idx) => (
                                <div key={idx} className={`flex justify-between items-center ${fullPage ? 'p-4' : 'p-2'} bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5`}>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Paid ₹{tx.amount.toLocaleString()}</span>
                                    <span className="text-gray-500 text-sm">{new Date(tx.date).toLocaleDateString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-600 italic">No payments made yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

// --- HOSTEL MODULE ---
export function HostelApp({ fullPage = false }) {
    const { studentData, applyHostel } = useData();
    const [gender, setGender] = useState(null);
    const [roomType, setRoomType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const styles = getModuleClasses(fullPage);

    const hostelData = studentData?.hostel || { status: 'not_applied' };
    const status = hostelData.status;
    const isAllocated = status === 'approved';
    const isPending = status === 'pending';
    const isRejected = status === 'rejected';
    const notApplied = status === 'not_applied';

    const roomTypeLabels = {
        single: { label: 'Single Room', icon: '🛏️', desc: 'Private room for one' },
        double: { label: 'Double Sharing', icon: '🛏🛏', desc: 'Shared with one roommate' },
        triple: { label: 'Triple Sharing', icon: '🛏🛏🛏', desc: 'Shared with two roommates' },
    };

    const handleApply = async () => {
        if (!gender || !roomType) return;
        setLoading(true);
        setErrorMsg('');
        try {
            const result = await applyHostel(gender, roomType);
            if (result && !result.success) {
                setErrorMsg(result.message || 'Failed to submit application');
            }
        } catch (e) {
            setErrorMsg('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReApply = () => {
        setGender(null);
        setRoomType(null);
        setErrorMsg('');
    };

    return (
        <Card className={styles.card}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Home size={styles.iconSize} className="text-orange-400" />
            </div>

            <div className={`${styles.padding} flex-1 flex flex-col`}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className={`${styles.headerSize} font-bold flex items-center gap-3 text-gray-900 dark:text-white dark:text-glow`}>
                        <Home size={styles.iconHeaderSize} className="text-orange-500 dark:text-orange-400" /> Hostel
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isAllocated ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20' :
                            isPending ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20' :
                                isRejected ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20' :
                                    'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20'
                        }`}>
                        {isAllocated ? 'APPROVED' : isPending ? 'PENDING' : isRejected ? 'REJECTED' : 'NOT APPLIED'}
                    </span>
                </div>

                {/* === NOT APPLIED: Application Form === */}
                {(notApplied || isRejected) && (
                    <div className="flex-1 flex flex-col">
                        {isRejected && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                                <p className="text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-2 mb-1">
                                    <XCircle size={16} /> Application Rejected
                                </p>
                                <p className="text-red-500 dark:text-red-400/80 text-sm">
                                    {hostelData.rejectionReason || 'Your hostel application was rejected.'}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">You can submit a new application below.</p>
                            </div>
                        )}

                        {/* Step 1: Gender */}
                        <p className={`${styles.subHeader} text-gray-600 dark:text-gray-400 mb-3 font-semibold uppercase tracking-wider text-xs`}>
                            Step 1 — Select Hostel Type
                        </p>
                        <div className="flex gap-4 mb-6">
                            <div onClick={() => setGender('Male')} className={`flex-1 p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${gender === 'Male' ? 'bg-orange-50 dark:bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-400' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'}`}>
                                <span className="text-3xl">👨</span>
                                <span className="text-sm font-bold uppercase">Boys Hostel</span>
                            </div>
                            <div onClick={() => setGender('Female')} className={`flex-1 p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${gender === 'Female' ? 'bg-pink-50 dark:bg-pink-500/20 border-pink-500 text-pink-600 dark:text-pink-400' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'}`}>
                                <span className="text-3xl">👩</span>
                                <span className="text-sm font-bold uppercase">Girls Hostel</span>
                            </div>
                        </div>

                        {/* Step 2: Room Type */}
                        <p className={`${styles.subHeader} text-gray-600 dark:text-gray-400 mb-3 font-semibold uppercase tracking-wider text-xs`}>
                            Step 2 — Select Room Type
                        </p>
                        <div className="flex flex-col gap-3 mb-6">
                            {Object.entries(roomTypeLabels).map(([key, rt]) => (
                                <div key={key} onClick={() => setRoomType(key)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${roomType === key ? 'bg-orange-50 dark:bg-orange-500/15 border-orange-400 dark:border-orange-500' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'}`}>
                                    <span className="text-2xl">{rt.icon}</span>
                                    <div className="flex-1">
                                        <p className={`font-bold text-sm ${roomType === key ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'}`}>{rt.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{rt.desc}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${roomType === key ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {roomType === key && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {errorMsg && (
                            <p className="text-red-500 text-sm mb-4 flex items-center gap-2"><AlertCircle size={14} /> {errorMsg}</p>
                        )}

                        <Button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20"
                            onClick={handleApply}
                            disabled={!gender || !roomType}
                            isLoading={loading}
                            size={styles.buttonSize}
                        >
                            Submit Application
                        </Button>
                    </div>
                )}

                {/* === PENDING: Waiting for Approval === */}
                {isPending && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                        <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center mb-5 border border-yellow-200 dark:border-yellow-500/20 animate-pulse">
                            <Clock size={40} className="text-yellow-500" />
                        </div>
                        <h4 className={`${styles.subHeader} font-bold text-gray-900 dark:text-white mb-2`}>Application Submitted!</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your application is under review. You'll be notified once approved.</p>
                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-white/10 w-full max-w-sm mx-auto text-left space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Hostel</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{hostelData.gender === 'Male' ? '👨 Boys' : '👩 Girls'} Hostel</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-white/5 pt-3">
                                <span className="text-gray-500 dark:text-gray-400">Room Type</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                                    {hostelData.roomType ? roomTypeLabels[hostelData.roomType]?.label : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-white/5 pt-3">
                                <span className="text-gray-500 dark:text-gray-400">Status</span>
                                <span className="font-bold text-yellow-500 uppercase text-xs">⏳ Awaiting Approval</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* === APPROVED: Room Allocated === */}
                {isAllocated && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-5 border border-green-200 dark:border-green-500/20">
                            <CheckCircle size={40} className="text-green-600 dark:text-green-500" />
                        </div>
                        <h4 className={`${styles.subHeader} font-bold text-gray-900 dark:text-white mb-2`}>Application Approved!</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your hostel accommodation has been confirmed.</p>
                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-white/10 w-full max-w-sm mx-auto text-left space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Hostel</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{hostelData.gender === 'Male' ? '👨 Boys' : '👩 Girls'} Hostel</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-white/5 pt-3">
                                <span className="text-gray-500 dark:text-gray-400">Room Type</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                                    {hostelData.roomType ? roomTypeLabels[hostelData.roomType]?.label : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-white/5 pt-3">
                                <span className="text-gray-500 dark:text-gray-400">Status</span>
                                <span className="font-bold text-green-600 dark:text-green-400 uppercase text-xs">✅ Approved</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

// --- LMS MODULE ---
export function LMSActivation({ fullPage = false }) {
    const { studentData, activateLMS, fetchSubjects, registerSubject, fetchRegisteredSubjects } = useData();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('courses');
    const [registering, setRegistering] = useState(null);
    const [courses, setCourses] = useState([]);
    const [registeredCourses, setRegisteredCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const styles = getModuleClasses(fullPage);

    const lmsData = studentData?.lms || { status: 'inactive', registeredCourses: [] };
    const isActive = lmsData.status === 'active';

    // Fetch subjects when LMS is activated
    useEffect(() => {
        if (isActive) {
            loadSubjects();
            loadRegisteredSubjects();
        }
    }, [isActive]);

    const loadSubjects = async () => {
        setLoading(true);
        try {
            const subjects = await fetchSubjects();
            setCourses(subjects);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadRegisteredSubjects = async () => {
        try {
            const registered = await fetchRegisteredSubjects();
            setRegisteredCourses(registered.map(s => s._id));
        } catch (error) {
            console.error(error);
        }
    };

    const timetable = [
        { time: '09:00 - 10:00', mon: 'Lecture 1', tue: 'Lecture 2', wed: 'Lecture 3', thu: 'Lecture 4', fri: 'Lecture 5' },
        { time: '10:00 - 11:00', mon: 'Lecture 2', tue: 'Lecture 3', wed: 'Lecture 4', thu: 'Lecture 5', fri: 'Lecture 1' },
        { time: '11:00 - 12:00', mon: 'Lecture 3', tue: 'Lecture 4', wed: 'Lecture 5', thu: 'Lecture 1', fri: 'Lecture 2' },
        { time: '02:00 - 05:00', mon: 'Lab A', tue: 'Lab B', wed: 'Library', thu: 'Sports', fri: 'Club' },
    ];

    const handleActivate = async () => {
        try {
            await activateLMS();
        } catch (e) { console.error(e) }
    };

    const handleRegister = async (subjectId) => {
        setRegistering(subjectId);
        try {
            await registerSubject(subjectId);
            setRegisteredCourses([...registeredCourses, subjectId]);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to register for subject");
        } finally {
            setRegistering(null);
        }
    };

    return (
        <Card className={styles.card}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BookOpen size={styles.iconSize} className="text-pink-500 dark:text-pink-400" />
            </div>

            <div className={`${styles.padding} flex-1 flex flex-col`}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className={`${styles.headerSize} font-bold flex items-center gap-3 text-gray-900 dark:text-white dark:text-glow`}>
                        <BookOpen size={styles.iconHeaderSize} className="text-pink-600 dark:text-pink-400" /> Learning Portal
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isActive ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20' : 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20'}`}>
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </div>

                {!isActive ? (
                    <div className="flex-1 flex flex-col justify-center text-center max-w-lg mx-auto">
                        <p className="text-gray-500 dark:text-gray-400 text-base mb-6">Activate your LMS account to access course content, timetables, and registration.</p>
                        <Button className="w-full bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/30 border-none" onClick={handleActivate} size={styles.buttonSize}>
                            Activate Access
                        </Button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col h-full">
                        {user && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    <span className="font-bold">Year {user.year}</span> - <span className="font-bold">{user.branch}</span> Stream
                                </p>
                            </div>
                        )}
                        
                        <div className="flex gap-4 mb-6 bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('courses')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'courses' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Courses</button>
                            <button onClick={() => setActiveTab('timetable')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'timetable' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Timetable</button>
                        </div>

                        {activeTab === 'courses' ? (
                            <div className={`space-y-4 overflow-y-auto ${fullPage ? 'max-h-[60vh]' : 'max-h-[400px]'} custom-scrollbar pr-2 h-full`}>
                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">Loading subjects...</div>
                                ) : courses.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No subjects available for your year and branch.</div>
                                ) : (
                                    courses.map(c => {
                                        const isReg = registeredCourses.includes(c._id);
                                        return (
                                            <div key={c._id} className={`p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl flex justify-between items-center group/item hover:border-pink-200 dark:hover:border-pink-500/30 transition-colors ${fullPage ? 'h-24' : ''}`}>
                                                <div>
                                                    <p className={`${fullPage ? 'text-lg' : 'text-sm'} font-bold text-gray-900 dark:text-white`}>{c.code} - {c.name}</p>
                                                    <p className="text-xs text-gray-500">{c.credits} Credits</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className={`px-4 py-2 ${isReg ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30' : 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-500/30'}`}
                                                    disabled={isReg || registering === c._id}
                                                    onClick={() => handleRegister(c._id)}
                                                    isLoading={registering === c._id}
                                                >
                                                    {isReg ? 'Registered' : 'Register'}
                                                </Button>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[80vh] border border-gray-200 dark:border-white/5 rounded-lg h-full">
                                <table className="w-full text-center h-full">
                                    <thead className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                        <tr>
                                            <th className="p-4">Time</th>
                                            <th>Mon</th>
                                            <th>Tue</th>
                                            <th>Wed</th>
                                            <th>Thu</th>
                                            <th>Fri</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-white/5 bg-gray-50 dark:bg-white/5">
                                        {timetable.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-100 dark:hover:bg-white/5">
                                                <td className="p-4 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.time}</td>
                                                <td className="text-blue-600 dark:text-neon-blue font-bold">{row.mon}</td>
                                                <td className="text-purple-600 dark:text-neon-purple font-bold">{row.tue}</td>
                                                <td className="text-pink-600 dark:text-pink-400 font-bold">{row.wed}</td>
                                                <td className="text-orange-500 dark:text-orange-400 font-bold">{row.thu}</td>
                                                <td className="text-green-600 dark:text-green-400 font-bold">{row.fri}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
