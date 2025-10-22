import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // Match animation duration
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirm();
    }, 200);
  };

  if (!isOpen) return null;

  const animationClass = isClosing ? 'animate-fade-out' : 'animate-fade-in';

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={handleClose}>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            @keyframes fade-out {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.95); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            .animate-fade-out { animation: fade-out 0.2s ease-in forwards; }
        `}</style>
        <div 
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-xs text-center overflow-hidden ${animationClass}`}
            onClick={e => e.stopPropagation()}
        >
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{message}</p>
            </div>
            <div className="grid grid-cols-2 border-t border-gray-500/20">
                <button
                    onClick={handleClose}
                    className="p-3 text-blue-500 dark:text-blue-400 text-base font-semibold border-r border-gray-500/20 hover:bg-gray-500/10 transition-colors"
                >
                    取消
                </button>
                <button
                    onClick={handleConfirm}
                    className="p-3 text-red-500 text-base font-semibold hover:bg-gray-500/10 transition-colors"
                >
                    确认删除
                </button>
            </div>
        </div>
    </div>
  );
};

export default ConfirmationModal;