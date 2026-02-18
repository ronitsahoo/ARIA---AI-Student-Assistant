import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({
    children,
    variant = 'primary',
    className,
    isLoading,
    size = 'md',
    ...props
}) {
    const baseStyles = "font-sans font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#030305] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3.5 text-base",
    };

    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-neon-blue dark:to-neon-darkBlue text-white shadow-lg shadow-blue-500/20 dark:shadow-neon-blue/20 hover:shadow-blue-500/40 dark:hover:shadow-neon-blue/40 border border-transparent hover:border-white/20",
        secondary: "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-lg",
        danger: "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 hover:bg-red-500/20 hover:border-red-500/40",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
    };

    return (
        <button
            className={twMerge(baseStyles, sizes[size], variants[variant], className)}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
                children
            )}
        </button>
    );
}

export function Card({ children, className, ...props }) {
    return (
        <div
            className={twMerge(
                "bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 shadow-xl rounded-2xl overflow-hidden backdrop-blur-xl transition-colors duration-300",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function Input({ label, error, className, containerClassName, ...props }) {
    return (
        <div className={twMerge("flex flex-col gap-1.5 w-full", containerClassName)}>
            {label && <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">{label}</label>}
            <div className="relative group">
                <input
                    className={twMerge(
                        "w-full bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white px-5 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-neon-blue focus:ring-1 focus:ring-blue-500 dark:focus:ring-neon-blue focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-inner",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                        className
                    )}
                    {...props}
                />
                <div className="absolute inset-0 rounded-xl bg-blue-500/5 dark:bg-neon-blue/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
            {error && <span className="text-xs text-red-500 dark:text-red-400 ml-1">{error}</span>}
        </div>
    );
}

export function Badge({ children, variant = 'default', className }) {
    const variants = {
        default: "bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20",
        success: "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20",
        warning: "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20",
        danger: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
        info: "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
        neon: "bg-blue-100 dark:bg-neon-blue/10 text-blue-600 dark:text-neon-blue border-blue-200 dark:border-neon-blue/20 shadow-none dark:shadow-[0_0_10px_rgba(0,243,255,0.1)]"
    };

    return (
        <span className={twMerge("px-2.5 py-0.5 rounded-full text-xs font-bold border", variants[variant], className)}>
            {children}
        </span>
    );
}
