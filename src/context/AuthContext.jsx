import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Theme Logic
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
        } else {
            localStorage.setItem('theme', 'dark');
        }
    }, []);

    useEffect(() => {
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('dark');
            html.classList.remove('light');
        } else {
            html.classList.add('light');
            html.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const login = (role, email, pass) => {
        // Admin Login
        if (role === 'admin' && email.includes('admin')) {
            const adminUser = { role: 'admin', name: 'System Admin', email: 'admin@aria.edu', id: 'admin_01' };
            setUser(adminUser);
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            return true;
        }

        // Staff Login
        if (role === 'staff' && email.includes('staff')) {
            const staffUser = { role: 'staff', name: 'Faculty Staff', email: 'staff@aria.edu', id: 'staff_01' };
            setUser(staffUser);
            localStorage.setItem('currentUser', JSON.stringify(staffUser));
            return true;
        }

        // Student Login
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existing = users.find(u => u.email === email);
        if (existing) {
            setUser(existing);
            localStorage.setItem('currentUser', JSON.stringify(existing));
            initializeStudentDataIfNeeded(existing.id);
            return true;
        }

        // DEMO STUDENT FALLBACK
        if (role === 'student' && email === 'student@aria.edu') {
            const demoUser = { role: 'student', name: 'Demo Student', email: 'student@aria.edu', id: 'student_demo' };
            if (!users.find(u => u.id === 'student_demo')) {
                users.push(demoUser);
                localStorage.setItem('users', JSON.stringify(users));
            }
            setUser(demoUser);
            localStorage.setItem('currentUser', JSON.stringify(demoUser));
            initializeStudentDataIfNeeded(demoUser.id);
            return true;
        }

        return false;
    };

    const signup = (data) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === data.email)) return false;

        const newUser = { ...data, role: 'student', id: Date.now().toString() };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        initializeStudentDataIfNeeded(newUser.id);

        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        return true;
    };

    const initializeStudentDataIfNeeded = (userId) => {
        const allData = JSON.parse(localStorage.getItem('studentsData') || '{}');
        if (!allData[userId]) {
            // Comprehensive Student Data Initialization
            allData[userId] = {
                documents: {
                    status: 'pending',
                    files: {
                        "10th Marksheet": { status: 'pending', file: null },
                        "12th Marksheet": { status: 'pending', file: null },
                        "ID Proof": { status: 'pending', file: null },
                        "Transfer Certificate": { status: 'pending', file: null },
                    }
                },
                fee: {
                    status: 'unpaid',
                    totalAmount: 50000,
                    paidAmount: 0,
                    history: [] // { amount, date, id }
                },
                hostel: {
                    status: 'not_applied',
                    room: null,
                    type: null
                },
                lms: {
                    status: 'inactive',
                    timetable: {},
                    registeredCourses: []
                },
                notifications: [
                    { id: 1, message: "Welcome to ARIA! Complete your profile.", read: false, date: new Date().toISOString() }
                ],
                chatHistory: []
            };
            localStorage.setItem('studentsData', JSON.stringify(allData));
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, theme, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
};
