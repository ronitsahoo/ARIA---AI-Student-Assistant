import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge } from '../components/UI';
import { Users, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Download, Search, Filter, MoreVertical, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const { allStudents } = useData();
    const { user } = useAuth();

    const students = allStudents.filter(s => s.role === 'student');
    const totalStudents = students.length;
    const completed = students.filter(s => {
        const data = s.data || {};
        return data.documents?.status === 'approved' &&
            data.fee?.status === 'paid' &&
            data.hostel?.status === 'approved' &&
            data.lms?.status === 'active';
    }).length;

    const pendingFees = students.filter(s => s.data?.fee?.status !== 'paid').length;
    const riskHigh = students.filter(s => {
        let c = 0;
        const d = s.data || {};
        if (d.documents?.status === 'approved') c++;
        if (d.fee?.status === 'paid') c++;
        if (d.hostel?.status === 'approved') c++;
        if (d.lms?.status === 'active') c++;
        return (c / 4) < 0.5;
    }).length;

    const stats = [
        { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Onboarding Complete', value: completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'High Risk (Attrition)', value: riskHigh, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Pending Fees', value: pendingFees, icon: DollarSign, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
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
                        Hello, <span className="font-semibold text-blue-600 dark:text-neon-blue">{user?.name}</span>. Here's what's happening today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="sm" className="hidden md:flex">
                        <Download size={16} /> Export Data
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Users size={16} /> Add Student
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
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.color === 'text-green-500' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-500/10 text-gray-500'}`}>
                                    +12%
                                </span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h2>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content: Student Table */}
            <motion.div variants={item} className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500 dark:text-neon-blue" />
                            Real-time Progress Tracking
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monitoring {students.length} active students enrollment status.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue w-40 md:w-64 text-gray-900 dark:text-white"
                            />
                        </div>
                        <button className="p-2 border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Student Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Documents</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Fee Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Overall Progress</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Risk Level</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => {
                                    const d = student.data || {};
                                    let c = 0;
                                    if (d.documents?.status === 'approved') c++;
                                    if (d.fee?.status === 'paid') c++;
                                    if (d.hostel?.status === 'approved') c++;
                                    if (d.lms?.status === 'active') c++;
                                    const progress = (c / 4) * 100;

                                    let risk = 'Low';
                                    let riskVariant = 'success';
                                    if (progress < 50) { risk = 'High'; riskVariant = 'danger'; }
                                    else if (progress < 80) { risk = 'Medium'; riskVariant = 'warning'; }

                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={d.documents?.status === 'approved' ? 'success' : d.documents?.status === 'rejected' ? 'danger' : 'warning'}>
                                                    {d.documents?.status || 'Pending'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {d.fee?.status === 'paid' ? (
                                                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-medium text-xs"><CheckCircle size={14} /> Paid</span>
                                                ) : (
                                                    <span className="text-red-500 dark:text-red-400 font-medium text-xs">Unpaid</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 mb-1 max-w-[100px]">
                                                    <div
                                                        className={`h-1.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{progress}%</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={riskVariant}>{risk}</Badge>
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

                {/* Pagination (Mock) */}
                <div className="p-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Showing 1 to {students.length} of {students.length} students</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
