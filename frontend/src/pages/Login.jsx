import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/UI';
import { CheckCircle, AlertCircle, Bot, GraduationCap, ArrowRight, Sun, Moon, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(async () => {
            const success = await login(role, email, password);
            if (success) {
                // We need to check the ACTUAL role from the user object if possible, 
                // but since login doesn't return the user, we rely on the state update or the role param?
                // Actually authContext.login sets the user. 
                // But here we rely on the 'role' state which might mismatch if the user logs in as one role but is actually another?
                // For now, let's assume the user selects the correct role or we handle redirection based on the response if we modified login to return data.
                // However, preserving existing logic:
                navigate(role === 'student' ? '/student' : role === 'staff' ? '/staff' : '/admin');
            } else {
                setError('Invalid credentials.');
                setLoading(false);
            }
        }, 1500);
    };

    const handleDemoLogin = (demoRole) => {
        const demoEmail = `${demoRole}@aria.edu`;
        const demoPass = 'password';
        setRole(demoRole);
        setEmail(demoEmail);
        setPassword(demoPass);

        // Auto Login
        setLoading(true);
        setTimeout(async () => {
            const success = await login(demoRole, demoEmail, demoPass);
            if (success) {
                navigate(demoRole === 'student' ? '/student' : demoRole === 'staff' ? '/staff' : '/admin');
            } else {
                setError('Demo login failed. Please try again.');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-gray-50 dark:bg-[#07070F] overflow-hidden transition-colors duration-500">

            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-full bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 text-gray-600 dark:text-yellow-400 shadow-md"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} className="text-gray-800" />}
                </button>
            </div>

            {/* Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-400/20 to-purple-600/20 dark:from-neon-blue/30 dark:to-purple-600/30 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70 animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tr from-pink-400/20 to-purple-500/20 dark:from-neon-magenta/20 dark:to-neon-purple/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-gradient-to-b from-blue-300/10 to-transparent dark:from-blue-500/10 dark:to-transparent blur-[100px] rounded-full"></div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden shadow-2xl bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 m-4 transition-all duration-500 hover:shadow-neon-purple/20">

                {/* Left Side: Brand/Visual */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 to-gray-900 dark:from-[#0c142c] dark:to-[#050508] p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/50 to-[#050508]/80"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur shadow-xl border border-white/20">
                                <GraduationCap size={28} className="text-blue-300 dark:text-neon-blue" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white/90 font-sans">ARIA</span>
                        </div>
                        <h1 className="text-5xl font-extrabold leading-tight text-white mb-6">
                            Smart Onboarding <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 dark:from-neon-blue dark:via-purple-400 dark:to-neon-magenta animate-text-gradient">Simplified.</span>
                        </h1>
                        <p className="text-gray-300 dark:text-gray-400 text-lg leading-relaxed max-w-md">
                            Seamlessly manage your academic registration, documents, and payments in one futuristic dashboard.
                        </p>

                        <div className="mt-8 flex gap-3">
                            <div className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-xs text-gray-200 dark:text-gray-300 backdrop-blur flex items-center gap-2">
                                <Bot size={14} className="text-blue-300 dark:text-neon-blue" /> AI Assistant Ready
                            </div>
                            <div className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-xs text-gray-200 dark:text-gray-300 backdrop-blur flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-300 dark:text-green-400" /> Instant Verification
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-xs text-gray-400 dark:text-gray-600 font-mono">
                        System Status: <span className="text-green-400 dark:text-green-500">Operational</span> <br />
                        Version: 2.4.0 (Beta)
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 bg-white/40 dark:bg-white/5 backdrop-blur-2xl flex flex-col justify-center transition-colors">

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>Choose your role to continue</span>
                            <div className="h-[1px] bg-gray-300 dark:bg-white/10 flex-1"></div>
                        </div>
                    </div>

                    {/* Role Switcher */}
                    <div className="grid grid-cols-3 gap-2 mb-8 bg-gray-100 dark:bg-black/20 p-1 rounded-xl border border-gray-200 dark:border-transparent">
                        {['student', 'staff', 'admin'].map((r) => (
                            <button
                                key={r}
                                onClick={() => { setRole(r); setError(''); }}
                                className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-300 ${role === r
                                    ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-md dark:shadow-white/5 border border-gray-100 dark:border-white/20'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400 text-sm animate-fade-in relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    className="w-full bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white px-5 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-neon-blue focus:ring-1 focus:ring-blue-500 dark:focus:ring-neon-blue focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    placeholder="name@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <div className="absolute inset-0 rounded-xl bg-blue-500/5 dark:bg-neon-blue/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white px-5 py-3.5 pr-12 rounded-xl border border-gray-200 dark:border-white/10 focus:border-purple-500 dark:focus:border-neon-purple focus:ring-1 focus:ring-purple-500 dark:focus:ring-neon-purple focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                <input type="checkbox" className="rounded border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-blue-600 dark:text-neon-blue focus:ring-0" />
                                Remember me
                            </label>
                            <a href="#" className="hover:text-blue-600 dark:hover:text-neon-blue transition-colors">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-neon-blue dark:via-blue-600 dark:to-indigo-600 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-neon-blue/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Login to Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5 text-center">
                        <p className="text-gray-500 text-sm mb-4">Don't have an account?</p>
                        <a href="/signup" className="inline-block px-6 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-sm font-medium">
                            Create Student Account
                        </a>
                    </div>


                </div>
            </div>
        </div>
    );
}
