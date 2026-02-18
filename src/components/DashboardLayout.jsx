import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    CreditCard, Files, Home, LogOut,
    User, GraduationCap, Building, BookOpen, AlertCircle, Menu, X, Sun, Moon
} from 'lucide-react';
import ChatBot from './ChatBot';

const SidebarLink = ({ to, icon: Icon, label, onClick, end }) => (
    <NavLink
        to={to}
        onClick={onClick}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive
                ? 'bg-blue-50 dark:bg-neon-blue/10 text-blue-600 dark:text-neon-blue border-l-2 border-blue-600 dark:border-neon-blue'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white hover:pl-5'
            }`
        }
    >
        <Icon size={20} className="group-hover:scale-110 transition-transform" />
        <span className="font-medium tracking-wide">{label}</span>
    </NavLink>
);

export default function DashboardLayout() {
    const { user, logout, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeSidebar = () => setSidebarOpen(false);

    // If user is null (though ProtectedRoute should prevent this), render nothing or redirect
    if (!user) return null;

    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-[#030305] text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-300">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 p-4 flex items-center justify-between shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2">
                    <GraduationCap className="text-blue-600 dark:text-neon-blue" />
                    <span className="font-bold text-lg tracking-wider text-gray-900 dark:text-white">ARIA</span>
                </div>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 dark:text-white">
                    {isSidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
        fixed md:relative z-50 h-full w-72 bg-white/90 dark:bg-[#0C0C0C]/90 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 flex flex-col transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-neon-blue dark:to-neon-purple flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-[0_0_15px_rgba(0,112,243,0.3)]">
                        <GraduationCap size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">ARIA</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Student Portal</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase mb-2 mt-2">Menu</p>

                    {user.role === 'student' && (
                        <>
                            <SidebarLink to="/student" icon={Home} label="Dashboard" onClick={closeSidebar} end={true} />
                            <SidebarLink to="/student/documents" icon={Files} label="Documents" onClick={closeSidebar} />
                            <SidebarLink to="/student/payment" icon={CreditCard} label="Fee Payment" onClick={closeSidebar} />
                            <SidebarLink to="/student/hostel" icon={Building} label="Hostel" onClick={closeSidebar} />
                            <SidebarLink to="/student/lms" icon={BookOpen} label="LMS Portal" onClick={closeSidebar} />
                        </>
                    )}

                    {user.role === 'staff' && (
                        <>
                            <SidebarLink to="/staff" icon={Home} label="Dashboard" onClick={closeSidebar} end={true} />
                            <SidebarLink to="/staff/verifications" icon={Files} label="Verifications" onClick={closeSidebar} />
                        </>
                    )}

                    {user.role === 'admin' && (
                        <>
                            <SidebarLink to="/admin" icon={Home} label="Dashboard" onClick={closeSidebar} end={true} />
                            <SidebarLink to="/admin/students" icon={User} label="All Students" onClick={closeSidebar} />
                            <SidebarLink to="/admin/reports" icon={AlertCircle} label="Risk Reports" onClick={closeSidebar} />
                        </>
                    )}
                </nav>

                <div className="p-4 m-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-sm font-bold shadow-sm text-gray-700 dark:text-white">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-blue-600 dark:text-neon-blue capitalize bg-blue-50 dark:bg-neon-blue/10 px-2 py-0.5 rounded-full w-fit mt-0.5 border border-blue-100 dark:border-neon-blue/20">{user.role}</p>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500 hover:text-red-700 dark:hover:text-white transition-all text-sm font-medium border border-red-100 dark:border-transparent"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative h-full w-full overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-[#030305] dark:to-[#0A0A0F]">
                {/* Top decorative gradient - Adjusted for light mode */}
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-neon-blue/5 dark:to-transparent pointer-events-none"></div>

                <div className="absolute inset-0 overflow-y-auto px-4 py-20 md:p-8 custom-scrollbar">
                    <Outlet />
                </div>
            </main>

            {/* Global ChatBot Widget */}
            <ChatBot />
        </div>
    );
}
