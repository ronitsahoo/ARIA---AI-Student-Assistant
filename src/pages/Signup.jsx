import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/UI';
import { CheckCircle, AlertCircle, Rocket, GraduationCap, ArrowRight, Sun, Moon } from 'lucide-react';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [year, setYear] = useState('1');
    const [branch, setBranch] = useState('CSE');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!name || !email || !password) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            setTimeout(async () => {
                const success = await signup({ name, email, password, year, branch });
                if (success) {
                    navigate('/student'); // Correct path
                } else {
                    setError('Account with this email already exists.');
                }
                setLoading(false);
            }, 1500);
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
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
            <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-gradient-to-br from-purple-400/20 to-pink-500/20 dark:from-purple-600/20 dark:to-neon-magenta/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50 animate-float"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-[50%] h-[50%] bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 dark:from-neon-blue/20 dark:to-cyan-500/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50 animate-float" style={{ animationDelay: '1.5s' }}></div>

            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-stretch rounded-3xl overflow-hidden shadow-2xl bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 m-4 transition-all duration-500 hover:shadow-neon-blue/10">

                {/* Right Side: Visual */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-bl from-gray-900 to-gray-800 dark:from-[#0c142c] dark:to-[#050508] p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur shadow-xl border border-white/20">
                                <Rocket size={28} className="text-purple-300 dark:text-neon-purple" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white/90 font-sans">ARIA</span>
                        </div>
                        <h1 className="text-4xl font-extrabold leading-tight text-white mb-6">
                            Start Your Academic <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 dark:from-neon-purple dark:to-neon-magenta">Journey Today.</span>
                        </h1>
                        <p className="text-gray-300 dark:text-gray-400 text-lg leading-relaxed max-w-md">
                            Join thousands of engineering students managing their campus life effortlessly.
                        </p>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-4">
                        <div className="bg-white/10 dark:bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10">
                            <h4 className="text-blue-300 dark:text-neon-blue font-bold text-xl">100%</h4>
                            <p className="text-xs text-gray-300 dark:text-gray-400 uppercase tracking-widest mt-1">Paperless</p>
                        </div>
                        <div className="bg-white/10 dark:bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10">
                            <h4 className="text-purple-300 dark:text-neon-purple font-bold text-xl">24/7</h4>
                            <p className="text-xs text-gray-300 dark:text-gray-400 uppercase tracking-widest mt-1">AI Support</p>
                        </div>
                    </div>
                </div>

                {/* Left Side: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 bg-white/40 dark:bg-white/5 backdrop-blur-2xl flex flex-col justify-center transition-colors">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Fill in your details to get started.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400 text-sm animate-fade-in relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Year</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:border-purple-500 dark:focus:border-neon-purple focus:ring-1 focus:ring-purple-500 dark:focus:ring-neon-purple focus:outline-none transition-all shadow-sm dark:shadow-inner appearance-none cursor-pointer"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    >
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Branch</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:border-purple-500 dark:focus:border-neon-purple focus:ring-1 focus:ring-purple-500 dark:focus:ring-neon-purple focus:outline-none transition-all shadow-sm dark:shadow-inner appearance-none cursor-pointer"
                                        value={branch}
                                        onChange={(e) => setBranch(e.target.value)}
                                    >
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">CIVIL</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 dark:from-neon-purple dark:to-fuchsia-600 text-white font-bold text-lg shadow-lg hover:shadow-purple-500/30 dark:hover:shadow-neon-purple/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5 text-center">
                        <p className="text-gray-500 text-sm mb-4">Already have an account?</p>
                        <Link to="/login" className="text-blue-600 dark:text-neon-blue hover:text-blue-700 dark:hover:text-white transition-colors text-sm font-medium underline decoration-blue-600/30 dark:decoration-neon-blue/30 hover:decoration-blue-700 dark:hover:decoration-white">
                            Log in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
