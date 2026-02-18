import { useState, useEffect, useRef } from 'react';
import { Send, Bot, MessageSquare, X, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hi! I am ARIA, your smart assistant. Ask me about your documents, fees, hostel application, or timetable!' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const { studentData } = useData();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Enhanced AI Logic
        setTimeout(() => {
            let botResponse = "I'm not sure about that. Try asking about 'fee', 'documents', 'hostel', 'timetable', or 'subjects'.";
            const lowerInput = input.toLowerCase();

            // Same logic as before
            if (lowerInput.includes('fee') || lowerInput.includes('payment') || lowerInput.includes('balance')) {
                const total = studentData?.fee?.totalAmount || 50000;
                const paid = studentData?.fee?.paidAmount || 0;
                const remaining = total - paid;
                if (remaining <= 0) {
                    botResponse = `Great news! Your tuition fees are fully paid. (Total: ₹${total.toLocaleString()})`;
                } else {
                    botResponse = `You have paid ₹${paid.toLocaleString()}. The remaining balance is **₹${remaining.toLocaleString()}**. You can pay part of it now using the presets in the Fees module.`;
                }
            } else if (lowerInput.includes('document') || lowerInput.includes('upload') || lowerInput.includes('pending')) {
                const files = studentData?.documents?.files || {};
                const pendingDocs = Object.entries(files)
                    .filter(([_, data]) => data.status !== 'approved' && data.status !== 'submitted')
                    .map(([name]) => name);

                if (pendingDocs.length > 0) {
                    botResponse = `You still need to upload/submit: **${pendingDocs.join(', ')}**. Please check the Documents module to upload them.`;
                } else {
                    botResponse = `All your documents are submitted or approved! You're good to go.`;
                }
            } else if (lowerInput.includes('hostel') || lowerInput.includes('room')) {
                const status = studentData?.hostel?.status || 'not_applied';
                if (status === 'allocated' || status === 'approved') {
                    botResponse = `Your hostel room is allocated! Check your room number in the Hostel module.`;
                } else {
                    botResponse = `You haven't been allocated a room yet. Apply now in the Hostel module.`;
                }
            } else if (lowerInput.includes('subject') || lowerInput.includes('course') || lowerInput.includes('study')) {
                botResponse = "For 1st Year Engineering, your subjects include Mathematics I, Physics, Basic Electrical Engg, Programming (CS101), and Engineering Graphics.";
            } else if (lowerInput.includes('timetable') || lowerInput.includes('schedule')) {
                botResponse = "Your timetable is available in the LMS module under the 'Timetable' tab.";
            } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                botResponse = "Hello! How can I help you complete your registration today?";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);
        }, 800);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Chat Window */}
            <div
                className={`w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto
                ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-neon-blue/20 dark:to-neon-purple/20 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <Bot size={20} className="text-white dark:text-neon-blue" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">ARIA Assistant</h3>
                            <p className="text-xs text-blue-100 dark:text-neon-blue flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                        <ChevronDown size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-bg/50 custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.sender === 'user'
                                ? 'bg-blue-600 dark:bg-neon-blue text-white font-medium rounded-tr-none'
                                : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 rounded-tl-none'
                                }`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-dark-bg/30">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-100 dark:bg-dark-input border border-transparent dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-neon-blue transition-all placeholder:text-gray-500"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="p-2.5 bg-blue-600 dark:bg-neon-blue rounded-xl text-white hover:bg-blue-700 dark:hover:bg-white dark:hover:text-black transition-all shadow-md active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Toggle Button (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center
                ${isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90 text-white' : 'bg-blue-600 dark:bg-neon-blue hover:bg-blue-700 dark:hover:bg-white text-white dark:text-black animate-bounce-slow'}`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={28} />}
            </button>
        </div>
    );
}
