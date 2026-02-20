import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Card, Badge } from '../components/UI';
import { DollarSign, Clock, Download, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPayments() {
    const { fetchAllPayments } = useData();
    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const load = async () => {
            setPaymentsLoading(true);
            const paymentData = await fetchAllPayments();
            setPayments(paymentData);
            setPaymentsLoading(false);
        };
        load();
    }, []);

    // Filter payments based on search
    const filteredPayments = payments.filter(payment => 
        payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.branch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

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
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <DollarSign size={32} className="text-green-500" />
                        Payment Transactions
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        View and manage all student fee payments
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors font-semibold text-sm border border-green-200 dark:border-green-500/30">
                        <Download size={16} /> Export
                    </button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={item}>
                    <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-600/10 border-green-200 dark:border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-green-900 dark:text-white mb-1">
                            ₹{(totalRevenue / 1000).toFixed(1)}k
                        </h2>
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">Total Revenue</p>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/10 border-blue-200 dark:border-blue-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-1">
                            {payments.length}
                        </h2>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Transactions</p>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-600/10 border-purple-200 dark:border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-purple-900 dark:text-white mb-1">
                            ₹{payments.length > 0 ? (totalRevenue / payments.length).toLocaleString() : 0}
                        </h2>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Average Payment</p>
                    </Card>
                </motion.div>
            </div>

            {/* Payment Transactions Table */}
            <motion.div variants={item} className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign size={20} className="text-green-500" />
                        All Transactions
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search by name, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 w-48 md:w-64 text-gray-900 dark:text-white"
                            />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-2 rounded-full font-semibold">
                            {filteredPayments.length} Results
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[600px]">
                    {paymentsLoading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                            <Clock size={24} className="animate-spin mr-2" /> Loading transactions...
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No transactions match your search.' : 'No payment transactions yet.'}
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Date & Time</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Student Details</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Transaction ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Order ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredPayments.map((payment, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-gray-700 dark:text-gray-300">
                                                <p className="font-medium">{new Date(payment.date).toLocaleDateString('en-IN', { 
                                                    day: '2-digit', 
                                                    month: 'short', 
                                                    year: 'numeric' 
                                                })}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(payment.date).toLocaleTimeString('en-IN', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{payment.studentName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {payment.branch} • Year {payment.year}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                                ₹{payment.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-gray-700 dark:text-gray-300 font-mono">
                                                {payment.transactionId}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-gray-700 dark:text-gray-300 font-mono">
                                                {payment.orderId}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.status === 'paid' && (
                                                <Badge variant="success">PAID</Badge>
                                            )}
                                            {payment.status === 'partial' && (
                                                <Badge variant="warning">PARTIAL</Badge>
                                            )}
                                            {payment.status === 'pending' && (
                                                <Badge variant="default">PENDING</Badge>
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
