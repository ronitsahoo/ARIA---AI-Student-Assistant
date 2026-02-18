import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, CreditCard, Home, BookOpen, Clock, XCircle, FileText, Download } from 'lucide-react';
import { Button, Card, Input } from '../components/UI';
import { useData } from '../context/DataContext';

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
    const { studentData, updateModuleStatus } = useData();
    const [loading, setLoading] = useState(false);
    const styles = getModuleClasses(fullPage);

    const files = studentData?.documents?.files || {};
    const overallStatus = studentData?.documents?.status || 'pending';

    const handleFileUpload = (docName, file) => {
        setLoading(true);
        setTimeout(() => {
            const updatedFiles = { ...files };
            updatedFiles[docName] = {
                status: 'submitted',
                file: file.name,
                uploadedAt: new Date().toISOString()
            };
            updateModuleStatus('documents', { files: updatedFiles });
            setLoading(false);
        }, 1000);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20';
            case 'rejected': return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20';
            case 'submitted': return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-500/20';
            default: return 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
        }
    };

    const pendingCount = Object.values(files).filter(f => f.status === 'pending' || f.status === 'rejected').length;

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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(overallStatus)}`}>
                        {overallStatus}
                    </span>
                </div>

                {pendingCount > 0 ? (
                    <p className={`${styles.subHeader} text-red-500 dark:text-red-400 mb-6 flex items-center gap-2`}>
                        <AlertCircle size={styles.iconHeaderSize * 0.6} /> {pendingCount} documents pending upload
                    </p>
                ) : (
                    <p className={`${styles.subHeader} text-green-600 dark:text-green-400 mb-6 flex items-center gap-2`}>
                        <CheckCircle size={styles.iconHeaderSize * 0.6} /> All documents submitted
                    </p>
                )}

                <div className={`space-y-4 overflow-y-auto ${fullPage ? 'max-h-[60vh]' : 'max-h-[200px]'} custom-scrollbar pr-2 flex-1`}>
                    {Object.keys(files).map((docName) => {
                        const doc = files[docName];
                        return (
                            <div key={docName} className={`p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors ${fullPage ? 'text-lg' : 'text-sm'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-200">{docName}</span>
                                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${getStatusColor(doc.status)}`}>{doc.status}</span>
                                </div>

                                {doc.status === 'rejected' && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mb-2">Reason: Re-upload clear copy</p>
                                )}

                                <div className="flex items-center gap-3 mt-2">
                                    {doc.file ? (
                                        <div className="flex-1 flex items-center gap-2 text-blue-600 dark:text-neon-blue bg-blue-50 dark:bg-neon-blue/5 p-2 rounded border border-blue-100 dark:border-neon-blue/10 truncate">
                                            <FileText size={16} /> {doc.file}
                                        </div>
                                    ) : (
                                        <label className="flex-1 cursor-pointer">
                                            <input type="file" className="hidden" onChange={(e) => e.target.files[0] && handleFileUpload(docName, e.target.files[0])} />
                                            <div className="text-center border border-dashed border-gray-300 dark:border-gray-600 rounded p-2 hover:border-blue-500 dark:hover:border-neon-blue hover:text-blue-600 dark:hover:text-neon-blue transition-colors text-gray-500">
                                                Click to Upload
                                            </div>
                                        </label>
                                    )}
                                    {doc.file && doc.status !== 'approved' && (
                                        <button onClick={() => handleFileUpload(docName, { name: null })} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
                                            <XCircle size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}

// --- FEE PAYMENT MODULE ---
export function FeePayment({ fullPage = false }) {
    const { studentData, updateModuleStatus } = useData();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const styles = getModuleClasses(fullPage);

    const feeData = studentData?.fee || { totalAmount: 50000, paidAmount: 0, history: [] };
    const remaining = feeData.totalAmount - feeData.paidAmount;
    const isPaid = remaining <= 0;

    const handlePay = (payAmount) => {
        if (!payAmount || payAmount <= 0) return;
        setLoading(true);
        setTimeout(() => {
            const newHistory = [...feeData.history, {
                amount: parseInt(payAmount),
                date: new Date().toISOString(),
                id: Math.random().toString(36).substr(2, 9)
            }];
            updateModuleStatus('fee', {
                paidAmount: feeData.paidAmount + parseInt(payAmount),
                history: newHistory
            });
            setAmount('');
            setLoading(false);
        }, 1500);
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
                    <div className={`space-y-3 overflow-y-auto ${fullPage ? 'max-h-[300px]' : 'max-h-[100px]'} custom-scrollbar pr-2`}>
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
    const { studentData, updateModuleStatus } = useData();
    const [gender, setGender] = useState(null);
    const [loading, setLoading] = useState(false);
    const styles = getModuleClasses(fullPage);

    const hostelData = studentData?.hostel || { status: 'not_applied', room: null, type: null };
    const isAllocated = hostelData.status === 'allocated' || hostelData.status === 'approved';

    const handleApply = () => {
        if (!gender) return;
        setLoading(true);
        setTimeout(() => {
            const block = gender === 'Male' ? 'B' : 'G';
            const floor = Math.floor(Math.random() * 4) + 1;
            const roomNo = Math.floor(Math.random() * 20) + 1;
            const room = `${block}-${floor}0${roomNo}`;
            updateModuleStatus('hostel', { status: 'allocated', type: gender, room: room });
            setLoading(false);
        }, 2000);
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isAllocated ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20' : 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20'}`}>
                        {isAllocated ? 'ALLOCATED' : 'NOT APPLIED'}
                    </span>
                </div>

                {!isAllocated ? (
                    <div className="flex-1 flex flex-col justify-center">
                        <p className={`${styles.subHeader} text-gray-500 dark:text-gray-400 mb-8`}>Select your preference to apply for hostel accommodation.</p>
                        <div className="flex gap-6 mb-8">
                            <div onClick={() => setGender('Male')} className={`flex-1 p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${gender === 'Male' ? 'bg-orange-50 dark:bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-400' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                <span className="text-4xl">👨</span>
                                <span className={styles.subHeader + " font-bold uppercase"}>Boys Hostel</span>
                            </div>
                            <div onClick={() => setGender('Female')} className={`flex-1 p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${gender === 'Female' ? 'bg-pink-50 dark:bg-pink-500/20 border-pink-500 text-pink-600 dark:text-pink-400' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                <span className="text-4xl">👩</span>
                                <span className={styles.subHeader + " font-bold uppercase"}>Girls Hostel</span>
                            </div>
                        </div>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20" onClick={handleApply} disabled={!gender} isLoading={loading} size={styles.buttonSize}>
                            Submit Application
                        </Button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-6 border border-green-200 dark:border-green-500/20">
                            <Home size={48} className="text-green-600 dark:text-green-500" />
                        </div>
                        <h4 className={`${styles.subHeader} font-bold text-gray-900 dark:text-white mb-2`}>Room Allocated!</h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Your application has been approved.</p>
                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 border border-gray-100 dark:border-white/10 w-full max-w-md mx-auto">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-white/5 pb-4">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Hostel Type</span>
                                <span className="text-gray-900 dark:text-white font-bold">{hostelData.type} Wing</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Room No.</span>
                                <span className="text-blue-600 dark:text-neon-blue text-2xl font-bold font-mono">{hostelData.room}</span>
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
    const { studentData, updateModuleStatus } = useData();
    const [activeTab, setActiveTab] = useState('courses');
    const [registering, setRegistering] = useState(null);
    const styles = getModuleClasses(fullPage);

    const lmsData = studentData?.lms || { status: 'inactive', registeredCourses: [] };
    const isActive = lmsData.status === 'active';

    const courses = [
        { code: 'MA101', name: 'Engineering Mathematics I', credits: 4 },
        { code: 'PH101', name: 'Engineering Physics', credits: 4 },
        { code: 'EE101', name: 'Basic Electrical Engg', credits: 3 },
        { code: 'CS101', name: 'Intro to Programming', credits: 3 },
        { code: 'EG101', name: 'Engineering Graphics', credits: 2 },
    ];

    const timetable = [
        { time: '09:00 - 10:00', mon: 'MA101', tue: 'PH101', wed: 'EE101', thu: 'CS101', fri: 'EG101' },
        { time: '10:00 - 11:00', mon: 'PH101', tue: 'EE101', wed: 'CS101', thu: 'EG101', fri: 'MA101' },
        { time: '11:00 - 12:00', mon: 'EE101', tue: 'CS101', wed: 'EG101', thu: 'MA101', fri: 'PH101' },
        { time: '02:00 - 05:00', mon: 'Lab A', tue: 'Lab B', wed: 'Library', thu: 'Sports', fri: 'Club' },
    ];

    const handleActivate = () => {
        updateModuleStatus('lms', { status: 'active' });
    };

    const handleRegister = (courseCode) => {
        setRegistering(courseCode);
        setTimeout(() => {
            const current = lmsData.registeredCourses || [];
            updateModuleStatus('lms', { registeredCourses: [...current, courseCode] });
            setRegistering(null);
        }, 800);
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
                        <div className="flex gap-4 mb-6 bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('courses')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'courses' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Courses</button>
                            <button onClick={() => setActiveTab('timetable')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'timetable' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Timetable</button>
                        </div>

                        {activeTab === 'courses' ? (
                            <div className={`space-y-4 overflow-y-auto ${fullPage ? 'max-h-[60vh]' : 'max-h-[220px]'} custom-scrollbar pr-2 h-full`}>
                                {courses.map(c => {
                                    const isReg = lmsData.registeredCourses?.includes(c.code);
                                    return (
                                        <div key={c.code} className={`p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl flex justify-between items-center group/item hover:border-pink-200 dark:hover:border-pink-500/30 transition-colors ${fullPage ? 'h-24' : ''}`}>
                                            <div>
                                                <p className={`${fullPage ? 'text-lg' : 'text-sm'} font-bold text-gray-900 dark:text-white`}>{c.code} - {c.name}</p>
                                                <p className="text-xs text-gray-500">{c.credits} Credits</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className={`px-4 py-2 ${isReg ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30' : 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-500/30'}`}
                                                disabled={isReg || registering === c.code}
                                                onClick={() => handleRegister(c.code)}
                                                isLoading={registering === c.code}
                                            >
                                                {isReg ? 'Registered' : 'Register'}
                                            </Button>
                                        </div>
                                    )
                                })}
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
