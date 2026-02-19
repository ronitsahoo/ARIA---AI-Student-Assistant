import { useState, useEffect, useRef } from 'react';
import { Send, Bot, MessageSquare, X, ChevronDown, Paperclip, Loader } from 'lucide-react';
import { useData } from '../context/DataContext';
import api from '../services/api';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]); // { id, sender, message, attachment }
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { fetchStudentData } = useData();
    // Strip /api suffix
    const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            fetchChatHistory();
            scrollToBottom();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChatHistory = async () => {
        try {
            const { data } = await api.get('/chat/history');
            setMessages(data);
        } catch (error) {
            console.error("Failed to load chat history", error);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const text = input;
        setInput('');

        // Optimistic UI update
        const tempId = Date.now();
        setMessages(prev => [...prev, { _id: tempId, sender: 'student', message: text }]);

        try {
            const { data } = await api.post('/chat/text', { message: text });
            // Add real response
            setMessages(prev => [...prev, data]);
        } catch (error) {
            console.error("Failed to send message", error);
            // Revert optimistic update
            setMessages(prev => prev.filter(m => m._id !== tempId));
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert("Only PDF, JPG, and PNG files are allowed.");
            return;
        }

        setIsProcessing(true);

        // Upload
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Optimistic user message with attachment
            const tempId = Date.now();
            setMessages(prev => [...prev, {
                _id: tempId,
                sender: 'student',
                message: file.name,
                attachment: URL.createObjectURL(file) // temporary preview
            }]);

            const { data } = await api.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await fetchChatHistory();

            if (data.mapped) {
                // If document was mapped, update dashboard data
                await fetchStudentData();
            }

        } catch (error) {
            console.error("Upload failed", error);
            // Append error message from bot
            setMessages(prev => [...prev, {
                _id: Date.now(),
                sender: 'aria',
                message: "Sorry, I encountered an error uploading your document. Please try again."
            }]);
        } finally {
            setIsProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Chat Window */}
            <div
                className={`w-[350px] sm:w-[400px] h-[550px] bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto
                ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-90 translate-y-10 invisible pointer-events-none'}`}
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
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 text-sm mt-10">
                            <p>👋 Hi! Upload a document to auto-classify it, or ask about your fees.</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg._id || msg.id} className={`flex ${msg.sender === 'student' || msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.sender === 'student' || msg.sender === 'user'
                                    ? 'bg-blue-600 dark:bg-neon-blue text-white font-medium rounded-tr-none'
                                    : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 rounded-tl-none'
                                }`}>

                                {msg.attachment && (
                                    <div className="mb-2">
                                        {msg.attachment.match(/\.(jpg|jpeg|png)$/i) || msg.attachment.startsWith('blob:') ? (
                                            <img
                                                src={msg.attachment.startsWith('blob:') ? msg.attachment : `${SERVER_URL}${msg.attachment}`}
                                                alt="Attachment"
                                                className="rounded-lg max-h-40 object-cover border border-white/20"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 bg-black/10 p-2 rounded">
                                                <Paperclip size={16} />
                                                <span className="truncate max-w-[150px]">Document</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <p className="whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </div>
                    ))}

                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-white/10 p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-white/5 flex items-center gap-2">
                                <Loader className="animate-spin text-blue-600 dark:text-neon-blue" size={16} />
                                <span className="text-sm text-gray-500 dark:text-gray-400">Analyzing document...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-dark-bg/30">
                    <div className="flex gap-2 items-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            title="Attach Document"
                            disabled={isProcessing}
                        >
                            <Paperclip size={20} />
                        </button>

                        <input
                            type="text"
                            className="flex-1 bg-gray-100 dark:bg-dark-input border border-transparent dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-neon-blue transition-all placeholder:text-gray-500"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isProcessing}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isProcessing}
                            className="p-2.5 bg-blue-600 dark:bg-neon-blue rounded-xl text-white hover:bg-blue-700 dark:hover:bg-white dark:hover:text-black transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
