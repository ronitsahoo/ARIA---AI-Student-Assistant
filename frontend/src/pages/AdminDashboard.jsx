import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge } from '../components/UI';
import { Users, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Download, Search, Filter, MoreVertical, FileText, PieChart, Home, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const { allStudents, fetchHostelApplications, approveRejectHostel } = useData();
    const { user } = useAuth();

    const [hostelApps, setHostelApps] = useState([]);
    const [hostelLoading, setHostelLoading] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const load = async () => {
            setHostelLoading(true);
            const apps = await fetchHostelApplications();
            setHostelApps(apps);
            setHostelLoading(false);
        };
        load();
    }, []);

    const handleHostelAction = async (studentId, status) => {
        setActionLoading(studentId + status);
        await approveRejectHostel(studentId, status, rejectReason);
        const apps = await fetchHostelApplications();
        setHostelApps(apps);
        setRejectingId(null);
        setRejectReason('');
        setActionLoading(null);
    };

    const students = allStudents.filter(s => s.role === 'student');
    const totalStudents = students.length;

    // Calculate Stats
    let totalFeesRemaining = 0;
    let totalDocsPending = 0;
    const deptCounts = {};

    students.forEach(s => {
        const d = s.data || {};

        // Fee Split
        const total = d.fee?.totalAmount || 50000;
        const paid = d.fee?.paidAmount || 0;
        totalFeesRemaining += (total - paid);

        // Docs Pending (Count individual files)
        const files = d.documents?.files || {};
        const pendingFiles = Object.values(files).filter(f => f.status === 'submitted' || f.status === 'pending').length;
        totalDocsPending += pendingFiles;

        // Dept Count
        const branch = s.branch || 'Unknown';
        deptCounts[branch] = (deptCounts[branch] || 0) + 1;
    });

    // Sort Depts
    const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
    const maxDeptCount = sortedDepts.length > 0 ? sortedDepts[0][1] : 1;

    const completed = students.filter(s => {
        const data = s.data || {};
        return data.documents?.status === 'approved' &&
            data.fee?.status === 'paid' &&
            data.hostel?.status === 'approved' &&
            data.lms?.status === 'active';
    }).length;

    const stats = [
        { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Docs to Verify', value: totalDocsPending, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Fees Remaining', value: `₹${(totalFeesRemaining / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-red-500', bg: 'bg-red-500/10' }, // formatted
        { label: 'Onboarding Done', value: completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    ];

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
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Overview of <span className="font-semibold text-blue-600 dark:text-neon-blue">{user?.name}</span>'s administration.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="sm" className="hidden md:flex">
                        <Download size={16} /> Export Data
                    </Button>
                </div>
            </motion.div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div variants={item} key={idx}>
                        <Card className="p-6 border-t-4 border-transparent hover:border-blue-500 transition-all shadow-md hover:shadow-lg bg-white dark:bg-[#151515]">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h2>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Student Table */}
                <motion.div variants={item} className="lg:col-span-2 bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users size={20} className="text-blue-500 dark:text-neon-blue" />
                            All Students
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue w-32 md:w-48 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Debts</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Docs Pending</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => {
                                        const d = student.data || {};
                                        const feesUnpaid = (d.fee?.totalAmount || 50000) - (d.fee?.paidAmount || 0);
                                        const pendingDocs = Object.values(d.documents?.files || {}).filter(f => f.status !== 'approved').length;

                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{student.branch}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {feesUnpaid <= 0 ? (
                                                        <span className="text-green-600 dark:text-green-400 font-bold text-xs">Paid</span>
                                                    ) : (
                                                        <span className="text-red-500 dark:text-red-400 font-bold text-xs">₹{feesUnpaid.toLocaleString()}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {pendingDocs === 0 ? (
                                                        <Badge variant="success">0</Badge>
                                                    ) : (
                                                        <Badge variant="warning">{pendingDocs}</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Department Distribution Graph */}
                <motion.div variants={item} className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl p-6 h-fit">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-purple-500" />
                        Department Distribution
                    </h3>

                    <div className="space-y-6">
                        {sortedDepts.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No data available</p>
                        ) : (
                            sortedDepts.map(([dept, count], idx) => {
                                const percentage = (count / totalStudents) * 100;
                                const maxPercent = (count / maxDeptCount) * 100; // Relative to max for visual scaling? No, relative to total is better for pie, but relative to max is better for bar comparison

                                return (
                                    <div key={dept}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{dept}</span>
                                            <span className="text-gray-500 dark:text-gray-400">{count} Students</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-3 overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'][idx % 4]}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, delay: idx * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                        <h4 className="text-blue-700 dark:text-blue-300 font-bold mb-1 text-sm">Insight</h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            {sortedDepts.length > 0 ? `${sortedDepts[0][0]} has the highest enrollment (${sortedDepts[0][1]} students).` : "No student data to analyze."}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Hostel Applications */}
            <motion.div variants={item} className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Home size={20} className="text-orange-500" />
                        Hostel Applications
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full font-semibold">
                        {hostelApps.filter(a => a.hostel?.status === 'pending').length} Pending
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {hostelLoading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                            <Clock size={24} className="animate-spin mr-2" /> Loading applications...
                        </div>
                    ) : hostelApps.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            No hostel applications yet.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Student</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Hostel Type</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Room Type</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {hostelApps.map((app) => (
                                    <tr key={app.studentId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{app.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{app.branch} • {app.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {app.hostel?.gender === 'Male' ? '👨 Boys' : '👩 Girls'} Hostel
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize text-gray-700 dark:text-gray-300">
                                                {app.hostel?.roomType === 'single' ? '🛏️ Single' :
                                                    app.hostel?.roomType === 'double' ? '🛏🛏 Double' :
                                                        app.hostel?.roomType === 'triple' ? '🛏🛏🛏 Triple' : '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {app.hostel?.status === 'pending' && (
                                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20">⏳ PENDING</span>
                                            )}
                                            {app.hostel?.status === 'approved' && (
                                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20">✅ APPROVED</span>
                                            )}
                                            {app.hostel?.status === 'rejected' && (
                                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">❌ REJECTED</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {app.hostel?.status === 'pending' && (
                                                <div className="flex flex-col items-end gap-2">
                                                    {rejectingId === app.studentId ? (
                                                        <div className="flex flex-col items-end gap-2 w-full max-w-xs">
                                                            <input
                                                                type="text"
                                                                placeholder="Reason for rejection..."
                                                                value={rejectReason}
                                                                onChange={e => setRejectReason(e.target.value)}
                                                                className="w-full text-xs px-3 py-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-400"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                                                    className="text-xs px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                                                                >Cancel</button>
                                                                <button
                                                                    onClick={() => handleHostelAction(app.studentId, 'rejected')}
                                                                    disabled={actionLoading === app.studentId + 'rejected'}
                                                                    className="text-xs px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                                                >{actionLoading === app.studentId + 'rejected' ? '...' : 'Confirm Reject'}</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleHostelAction(app.studentId, 'approved')}
                                                                disabled={actionLoading === app.studentId + 'approved'}
                                                                className="text-xs px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 hover:bg-green-200 dark:hover:bg-green-500/30 disabled:opacity-50 font-semibold"
                                                            >{actionLoading === app.studentId + 'approved' ? '...' : '✅ Approve'}</button>
                                                            <button
                                                                onClick={() => setRejectingId(app.studentId)}
                                                                className="text-xs px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-500/30 font-semibold"
                                                            >❌ Reject</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {app.hostel?.status !== 'pending' && (
                                                <span className="text-xs text-gray-400 italic">No action needed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
