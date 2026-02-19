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
    // Count rejected docs that still need re-upload
    const rejectedCount = Object.values(files).filter(f => f.status === 'rejected').length;
    // Count pending docs
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

                {/* Status banner */}
                {rejectedCount > 0 && !hasUploadedDocs ? (
                    <div className={`${styles.subHeader} text-red-600 dark:text-red-400 mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2`}>
                        <XCircle size={styles.iconHeaderSize * 0.65} />
                        {rejectedCount} document{rejectedCount > 1 ? 's' : ''} rejected — please re-upload and submit again
                    </div>
                ) : pendingCount > 0 ? (
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
                        // Can delete if still in 'uploaded' (pre-submission) state
                        const canDelete = doc.file && doc.status === 'uploaded';
                        // Show upload area for pending OR rejected docs
                        const needsUpload = doc.status === 'pending' || doc.status === 'rejected';

                        return (
                            <div key={docName} className={`p-4 rounded-xl border transition-colors ${fullPage ? 'text-lg' : 'text-sm'} ${doc.status === 'rejected'
                                    ? 'bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
                                    : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'
                                }`}>
                                {/* Doc name + status badge */}
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-medium text-gray-700 dark:text-gray-200">{docName}</span>
                                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded border font-bold ${getStatusColor(doc.status)}`}>
                                        {doc.status === 'uploaded' ? 'ready' : doc.status}
                                    </span>
                                </div>

                                {/* Rejection reason */}
                                {doc.status === 'rejected' && doc.reason && (
                                    <div className="mb-3 px-3 py-2 bg-red-100 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
                                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 mb-0.5">
                                            <XCircle size={11} /> Rejection Reason
                                        </p>
                                        <p className="text-xs text-red-500 dark:text-red-400/80">{doc.reason}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-1">
                                    {/* Rejected: show old filename (crossed-out) and re-upload below */}
                                    {doc.status === 'rejected' && doc.file ? (
                                        <div className="flex-1 flex flex-col gap-2">
                                            {/* Old file — greyed out */}
                                            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 min-w-0 line-through">
                                                <FileText size={13} className="flex-shrink-0" />
                                                <span className="truncate text-xs" title={doc.file}>{doc.file}</span>
                                            </div>
                                            {/* Re-upload button */}
                                            <label className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={(e) => e.target.files[0] && handleFileUpload(docName, e.target.files[0])}
                                                    disabled={isUploading}
                                                />
                                                <div className={`text-center border-2 border-dashed rounded-lg py-2 px-3 transition-colors text-xs font-semibold ${isUploading
                                                        ? 'border-blue-300 dark:border-neon-blue/50 text-blue-500 cursor-wait bg-blue-50 dark:bg-blue-500/5'
                                                        : 'border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                                                    }`}>
                                                    {isUploading ? '⏳ Uploading...' : '↑ Click to Re-upload File'}
                                                </div>
                                            </label>
                                        </div>
                                    ) : !needsUpload && doc.file ? (
                                        /* Uploaded / Submitted / Approved — show filename as link */
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
                                        /* Pending — no file yet, show upload area */
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
                                                {isUploading ? 'Uploading...' : '↑ Click to Upload'}
                                            </div>
                                        </label>
                                    )}

                                    {/* Delete button — only for 'uploaded' (pre-submission) docs */}
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(docName)}
                                            disabled={isDeleting}
                                            title="Remove and re-upload"
                                            className={`p-2 rounded-lg border transition-colors flex-shrink-0 ${isDeleting
                                                    ? 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-300 cursor-wait'
                                                    : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20'
                                                }`}
                                        >
                                            {isDeleting ? <Clock size={14} /> : <XCircle size={14} />}
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
    const { studentData, initiateFeePayment } = useData();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTestInfo, setShowTestInfo] = useState(false);
    const styles = getModuleClasses(fullPage);

    const feeData = studentData?.fee || { totalAmount: 50000, paidAmount: 0, history: [] };
    const remaining = feeData.totalAmount - feeData.paidAmount;
    const isPaid = feeData.status === 'paid';

    const handlePay = async (payAmount) => {
        const numAmount = Number(payAmount);
        if (!numAmount || numAmount <= 0) {
            alert('⚠️ Please enter a valid amount');
            return;
        }
        if (numAmount > remaining) {
            alert('⚠️ Amount exceeds remaining balance of ₹' + remaining.toLocaleString());
            return;
        }
        setLoading(true);
        try {
            await initiateFeePayment(numAmount);
        } catch (e) { 
            console.error(e);
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(false);
            setAmount('');
        }
    };

    return (
        <Card className={styles.card}>
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CreditCard size={styles.iconSize} className="text-purple-500 dark:text-neon-purple" />
            </div>

            <div className={`${styles.padding} flex-1 flex flex-col relative z-10`}>
                {/* Header with Test Mode Badge */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h3 className={`${styles.headerSize} font-bold flex items-center gap-3 text-gray-900 dark:text-white dark:text-glow`}>
                            <CreditCard size={styles.iconHeaderSize} className="text-purple-600 dark:text-neon-purple" /> Tuition Fee
                        </h3>
                        {/* Test Mode Indicator */}
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 animate-pulse">
                            🧪 Test Mode
                        </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isPaid ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20' : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20'}`}>
                        {isPaid ? '✓ PAID' : '⏳ PENDING'}
                    </span>
                </div>

                {/* Test Mode Info Banner */}
                {!isPaid && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-2">
                                    <span className="text-base">💳</span> Safe Test Payment Environment
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400/80">
                                    No real money will be charged. Use test cards for demo purposes.
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowTestInfo(!showTestInfo)}
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline whitespace-nowrap"
                            >
                                {showTestInfo ? 'Hide' : 'Test Cards'}
                            </button>
                        </div>
                        
                        {/* Test Card Details */}
                        {showTestInfo && (
                            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-500/30 space-y-3">
                                <div className="bg-white dark:bg-white/5 rounded-lg p-3 border border-blue-100 dark:border-blue-500/20">
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">💳 Domestic Test Cards</p>
                                    <div className="space-y-2">
                                        <div className="space-y-1 text-xs font-mono">
                                            <p className="text-gray-600 dark:text-gray-400 font-bold">Visa Card:</p>
                                            <p className="text-gray-600 dark:text-gray-400">Card: <span className="text-blue-600 dark:text-blue-400 font-bold">4111 1111 1111 1111</span></p>
                                            <p className="text-gray-600 dark:text-gray-400">Expiry: <span className="text-blue-600 dark:text-blue-400 font-bold">12/26</span> | CVV: <span className="text-blue-600 dark:text-blue-400 font-bold">123</span></p>
                                        </div>
                                        <div className="space-y-1 text-xs font-mono pt-2 border-t border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-600 dark:text-gray-400 font-bold">Mastercard:</p>
                                            <p className="text-gray-600 dark:text-gray-400">Card: <span className="text-blue-600 dark:text-blue-400 font-bold">5555 5555 5555 4444</span></p>
                                            <p className="text-gray-600 dark:text-gray-400">Expiry: <span className="text-blue-600 dark:text-blue-400 font-bold">12/26</span> | CVV: <span className="text-blue-600 dark:text-blue-400 font-bold">123</span></p>
                                        </div>
                                        <div className="space-y-1 text-xs font-mono pt-2 border-t border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-600 dark:text-gray-400 font-bold">Rupay Card:</p>
                                            <p className="text-gray-600 dark:text-gray-400">Card: <span className="text-blue-600 dark:text-blue-400 font-bold">6074 8200 0000 0007</span></p>
                                            <p className="text-gray-600 dark:text-gray-400">Expiry: <span className="text-blue-600 dark:text-blue-400 font-bold">12/26</span> | CVV: <span className="text-blue-600 dark:text-blue-400 font-bold">123</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-white/5 rounded-lg p-3 border border-blue-100 dark:border-blue-500/20">
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">📱 Test UPI (Easiest)</p>
                                    <div className="space-y-1 text-xs font-mono">
                                        <p className="text-gray-600 dark:text-gray-400">UPI ID: <span className="text-green-600 dark:text-green-400 font-bold">success@razorpay</span></p>
                                        <p className="text-gray-500 dark:text-gray-500 text-[10px]">Enter 4-10 digit OTP for success</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Fee Summary Cards */}
                <div className={fullPage ? "grid grid-cols-2 gap-8 mb-8" : "grid grid-cols-2 gap-4 mb-6"}>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-600/10 rounded-2xl p-5 border border-purple-200 dark:border-purple-500/30 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-purple-600 dark:text-purple-400 text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Total Fee
                        </p>
                        <p className={`${fullPage ? 'text-4xl' : 'text-2xl'} font-black text-purple-900 dark:text-white`}>
                            ₹{feeData.totalAmount.toLocaleString()}
                        </p>
                    </div>
                    <div className={`bg-gradient-to-br rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow ${
                        remaining > 0 
                            ? 'from-pink-50 to-pink-100 dark:from-pink-500/10 dark:to-pink-600/10 border-pink-200 dark:border-pink-500/30' 
                            : 'from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-600/10 border-green-200 dark:border-green-500/30'
                    }`}>
                        <p className={`text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2 ${
                            remaining > 0 ? 'text-pink-600 dark:text-pink-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${remaining > 0 ? 'bg-pink-500' : 'bg-green-500'}`}></span> 
                            {remaining > 0 ? 'Remaining' : 'Balance'}
                        </p>
                        <p className={`${fullPage ? 'text-4xl' : 'text-2xl'} font-black ${
                            remaining > 0 ? 'text-pink-900 dark:text-white' : 'text-green-900 dark:text-white'
                        }`}>
                            ₹{remaining.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Payment Section */}
                {!isPaid && (
                    <div className="space-y-5 mb-8">
                        {/* Quick Pay Buttons - Only Full or Half */}
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handlePay(50000)} 
                                disabled={loading || remaining < 25000}
                                className="group relative overflow-hidden py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-500 dark:hover:to-purple-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <div className="relative flex flex-col items-center">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">Pay Full</span>
                                    <span className="text-lg font-black">₹50K</span>
                                </div>
                            </button>
                            <button 
                                onClick={() => handlePay(25000)} 
                                disabled={loading || remaining < 25000}
                                className="group relative overflow-hidden py-3 px-4 bg-gradient-to-r from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 dark:hover:from-pink-500 dark:hover:to-pink-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <div className="relative flex flex-col items-center">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">Pay Half</span>
                                    <span className="text-lg font-black">₹25K</span>
                                </div>
                            </button>
                        </div>

                        {/* Custom Amount Input - Can be any amount */}
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-lg">₹</span>
                                <Input
                                    placeholder="Enter custom amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className={`${fullPage ? "py-4 text-xl" : "py-3 text-base"} pl-8 font-semibold bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 focus:border-purple-400 dark:focus:border-purple-500 rounded-xl`}
                                    containerClassName="flex-1"
                                />
                            </div>
                            <Button
                                onClick={() => handlePay(amount)}
                                isLoading={loading}
                                disabled={!amount || loading}
                                variant="primary"
                                className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-neon-purple dark:via-neon-magenta dark:to-neon-purple hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-8"
                                size={styles.buttonSize}
                            >
                                {loading ? '⏳ Processing...' : '💳 Pay Now'}
                            </Button>
                        </div>
                        
                        {amount && Number(amount) > remaining && (
                            <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 animate-pulse">
                                <AlertCircle size={12} /> Amount exceeds remaining balance of ₹{remaining.toLocaleString()}
                            </p>
                        )}
                        
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            Quick pay ₹50,000 or ₹25,000, or enter any custom amount
                        </p>
                    </div>
                )}

                {/* Payment Success Message */}
                {isPaid && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border-2 border-green-200 dark:border-green-500/30 rounded-2xl text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">Payment Completed! 🎉</h4>
                        <p className="text-sm text-green-600 dark:text-green-400/80">Your tuition fee has been successfully paid.</p>
                    </div>
                )}

                {/* Payment History */}
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase mb-4 flex items-center gap-2">
                        <Clock size={16} /> Payment History
                    </h4>
                    <div className={`space-y-3 overflow-y-auto ${fullPage ? 'max-h-[300px]' : 'max-h-[180px]'} custom-scrollbar pr-2`}>
                        {feeData.history && feeData.history.length > 0 ? (
                            feeData.history.map((tx, idx) => (
                                <div key={idx} className={`flex justify-between items-center ${fullPage ? 'p-4' : 'p-3'} bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors group`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-gray-900 dark:text-gray-100 font-bold">₹{tx.amount.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full border border-green-200 dark:border-green-500/30">
                                        SUCCESS
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard size={24} className="text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">No payments made yet</p>
                                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Your payment history will appear here</p>
                            </div>
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
