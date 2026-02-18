import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input } from '../components/UI';
import { CheckCircle, XCircle, FileText, Clock, UserCheck, Search, Filter, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StaffDashboard() {
    const { allStudents, updateStudentStatus } = useData();
    const { user } = useAuth();
    const [rejectReason, setRejectReason] = useState('');
    const [rejectId, setRejectId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const pendingDocs = allStudents.filter(s => s.role === 'student' && s.data?.documents?.status === 'pending');

    // Simulate some stats
    const stats = [
        { label: 'Pending Verification', value: pendingDocs.length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Verified Today', value: 12, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Total Students', value: allStudents.filter(s => s.role === 'student').length, icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ];

    const handleApprove = (id) => {
        if (confirm('Are you sure you want to approve this document?')) {
            updateStudentStatus(id, 'documents', 'approved');
        }
    };

    const handleReject = (id) => {
        if (!rejectReason) return alert('Please provide a reason');
        updateStudentStatus(id, 'documents', 'rejected', rejectReason);
        setRejectId(null);
        setRejectReason('');
    };

    const filteredQueue = pendingDocs.filter(student =>
        (filterStatus === 'all' || filterStatus === 'pending') &&
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Header */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/70 dark:bg-black/20 p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-md">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                        Staff Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Welcome back, <span className="font-semibold text-blue-600 dark:text-neon-blue">{user?.name}</span>. managing verifications.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="sm" className="hidden md:flex">
                        <FileText size={16} /> Generate Report
                    </Button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div variants={item} key={idx}>
                        <Card className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content: Verification Queue */}
            <motion.div variants={item} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="text-blue-500" />
                        Verification Queue
                        <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">{filteredQueue.length}</span>
                    </h2>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search student..."
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {filteredQueue.length === 0 ? (
                    <Card className="text-center py-16 flex flex-col items-center justify-center border-dashed border-2 border-gray-200 dark:border-white/10 bg-transparent shadow-none">
                        <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-500/5 flex items-center justify-center mb-4">
                            <CheckCircle size={40} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                            There are no pending documents verification requests at the moment.
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredQueue.map((student) => (
                            <motion.div key={student.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Card className="p-0 overflow-hidden border-none shadow-md hover:shadow-lg transition-all dark:bg-[#151515]">
                                    <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{student.email}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">ID: {student.id.slice(0, 8)}</span>
                                                    <span className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <FileText size={10} /> {student.data?.documents?.file}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
                                            {rejectId === student.id ? (
                                                <div className="flex flex-col sm:flex-row items-center gap-2 w-full animate-in fade-in zoom-in duration-200">
                                                    <Input
                                                        placeholder="Reason for rejection..."
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        className="w-full sm:w-64"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <Button variant="danger" onClick={() => handleReject(student.id)} size="sm" className="flex-1">Confirm</Button>
                                                        <Button variant="secondary" onClick={() => setRejectId(null)} size="sm" className="flex-1">Cancel</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Button variant="secondary" size="sm" className="w-full sm:w-auto text-gray-600 dark:text-gray-300">
                                                        <Eye size={16} /> View
                                                    </Button>
                                                    <Button
                                                        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-none shadow-green-500/20"
                                                        onClick={() => handleApprove(student.id)}
                                                        size="sm"
                                                    >
                                                        <CheckCircle size={16} /> Approve
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        onClick={() => setRejectId(student.id)}
                                                        size="sm"
                                                        className="w-full sm:w-auto"
                                                    >
                                                        <XCircle size={16} /> Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
