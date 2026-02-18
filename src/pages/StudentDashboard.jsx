import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DocumentUpload, FeePayment, HostelApp, LMSActivation } from '../components/StudentModules';
import { Card } from '../components/UI';
import { Bell, CheckCircle, Loader2, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
    const { user, toggleTheme, theme } = useAuth();
    const { studentData, progress } = useData();
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (studentData) setLoading(false);
    }, [studentData]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <Loader2 className="animate-spin text-blue-600 dark:text-neon-blue w-12 h-12" />
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
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
            {/* Header & Welcome - Added z-index relative for dropdown */}
            <motion.div variants={item} className="relative z-50 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/70 dark:bg-black/20 p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-md dark:shadow-none">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-neon-blue dark:to-neon-purple">{user?.name}</span> 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">Your academic journey starts here. Complete these tasks to proceed.</p>
                </div>

                <div className="flex items-center gap-4 relative">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 text-gray-600 dark:text-yellow-400 shadow-sm"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} className="text-gray-800" />}
                    </button>

                    {/* Notifications */}
                    <div className="relative group cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
                        <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 group-hover:border-blue-300 dark:group-hover:border-neon-blue/50 group-hover:shadow-[0_0_15px_rgba(0,112,243,0.2)] dark:group-hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                            <Bell size={24} className={studentData?.notifications?.some(n => !n.read) ? 'text-blue-600 dark:text-neon-blue' : 'text-gray-400'} />
                            {studentData?.notifications?.some(n => !n.read) && (
                                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 dark:bg-neon-pink rounded-full border-2 border-white dark:border-[#0A0A0F] animate-pulse"></span>
                            )}
                        </div>

                        {showNotifications && (
                            <div className="absolute top-16 right-0 w-80 sm:w-96 bg-white dark:bg-[#111] rounded-2xl p-0 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 overflow-hidden border border-gray-200 dark:border-white/10">
                                <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center justify-between">
                                        Notifications
                                        <span className="text-xs bg-blue-100 dark:bg-neon-blue/20 text-blue-600 dark:text-neon-blue px-2 py-0.5 rounded-full font-bold">{studentData?.notifications?.length || 0}</span>
                                    </h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar bg-white dark:bg-transparent">
                                    {studentData?.notifications?.length > 0 ? (
                                        studentData.notifications.map((n, i) => (
                                            <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-l-blue-500 dark:hover:border-l-neon-blue border-b border-gray-100 dark:border-white/5 last:border-0">
                                                <p className="text-gray-700 dark:text-gray-200 text-sm mb-1">{n.message}</p>
                                                <span className="text-gray-400 dark:text-gray-500 text-xs block text-right">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                            <Bell size={32} className="mb-2 opacity-20" />
                                            <p>No new notifications</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Progress Bar Section - Lower z-index */}
            <motion.div variants={item} className="relative z-0">
                <Card className="relative overflow-hidden border-blue-100 dark:border-neon-blue/20 bg-white dark:bg-[#111111] p-8 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Onboarding Progress</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Complete all 4 modules to unlock full access.</p>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                            <span className="text-5xl font-black text-blue-600 dark:text-white">{Math.round(progress)}<span className="text-2xl text-gray-400">%</span></span>
                        </div>
                    </div>

                    <div className="h-4 w-full bg-gray-100 dark:bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-gray-200 dark:border-white/5 relative z-10">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-neon-blue dark:via-neon-purple dark:to-neon-magenta shadow-lg dark:shadow-[0_0_20px_rgba(0,243,255,0.4)] relative"
                            style={{ width: `${progress}%`, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Decorative BG for Light Mode */}
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-50 dark:hidden rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                    {progress === 100 && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-6 flex items-center justify-center p-4 bg-green-50 border border-green-200 dark:bg-green-500/10 dark:border-green-500/20 rounded-xl text-green-600 dark:text-green-400 font-bold gap-2 relative z-10"
                        >
                            <CheckCircle size={24} />
                            <span>Congratulations! You have completed all onboarding tasks.</span>
                        </motion.div>
                    )}
                </Card>
            </motion.div>

            {/* Modules Grid - 2x2 Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-fr relative z-0">
                <motion.div variants={item} className="h-full min-h-[320px]"><DocumentUpload /></motion.div>
                <motion.div variants={item} className="h-full min-h-[320px]"><FeePayment /></motion.div>
                <motion.div variants={item} className="h-full min-h-[320px]"><HostelApp /></motion.div>
                <motion.div variants={item} className="h-full min-h-[320px]"><LMSActivation /></motion.div>
            </div>

            {/* Announcements - Full Width */}
            <div className="pb-10 relative z-0">
                <motion.div variants={item} className="flex flex-col h-full">
                    <div className="h-full min-h-[200px] rounded-3xl border border-dashed border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/5 flex flex-col items-center justify-center p-8 text-center group hover:bg-white dark:hover:bg-white/10 transition-colors cursor-default shadow-sm hover:shadow-md dark:shadow-none">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Bell size={24} className="text-gray-400 group-hover:text-blue-500 dark:group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">College Announcements</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">No critical announcements at this time. Check back later for updates on orientation and classes.</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
