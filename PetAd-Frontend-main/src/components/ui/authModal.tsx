interface AuthModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    buttonText: string;
    onAction: () => void;
}

export function AuthModal({ isOpen, title, description, buttonText, onAction }: AuthModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-[400px] bg-white rounded-2xl p-8 pt-10 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300"
                role="dialog"
                aria-modal="true"
            >
                <h3 className="text-[28px] font-bold text-[#0D162B] mb-4">
                    {title}
                </h3>
                <p className="text-gray-500 mb-8 max-w-[280px] text-[15px] leading-relaxed">
                    {description}
                </p>
                <button
                    onClick={onAction}
                    className="w-full bg-[#0D1B2A] text-white font-medium text-[15px] py-4 rounded-xl hover:bg-gray-900 transition-colors focus:ring-4 focus:ring-gray-900/20 active:scale-[0.98]"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
