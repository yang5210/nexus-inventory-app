import React, { useState, useEffect } from 'react';

interface DefaultRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (remark: string) => void;
  initialRemark: string;
}

const DefaultRemarkModal: React.FC<DefaultRemarkModalProps> = ({ isOpen, onClose, onSave, initialRemark }) => {
  const [remark, setRemark] = useState(initialRemark);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRemark(initialRemark);
    }
  }, [isOpen, initialRemark]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const handleSave = () => {
    onSave(remark);
    handleClose();
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
        className={`bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md m-4 ${animationClass}`} 
        onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">设置默认备注</h2>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            设置后，新建项目时将自动填充此备注。
          </p>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={4}
            className="block w-full rounded-lg text-base p-3 border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-inset focus:ring-blue-500"
            placeholder="输入默认备注内容"
          ></textarea>
        </div>
        <div className="px-6 pb-6 pt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-3 bg-gray-200 dark:bg-gray-700 text-base font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            onClick={handleClose}
          >
            取消
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-3 bg-blue-500 text-base font-semibold text-white hover:bg-blue-600 transition-all"
            onClick={handleSave}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefaultRemarkModal;