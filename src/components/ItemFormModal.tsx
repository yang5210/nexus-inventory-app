import React, { useState, useEffect } from 'react';
import type { Item } from '../types';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
  itemToEdit?: Item;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [usageCount, setUsageCount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setAccount(itemToEdit.account);
      setPassword(itemToEdit.password || itemToEdit.account); // Fallback for old data
      setInviteCode(itemToEdit.inviteCode);
      setUsageCount(itemToEdit.usageCount);
      setRemarks(itemToEdit.remarks);
    } else {
      setAccount('');
      setPassword('');
      setInviteCode('');
      setUsageCount('');
      setRemarks('');
    }
  }, [itemToEdit, isOpen]);

  // For new items, default password to account number
  useEffect(() => {
    if (!itemToEdit) {
      setPassword(account);
    }
  }, [account, itemToEdit]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 12) {
      setAccount(value);
    }
  };

  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setInviteCode(value);
    }
  };

  const handleSave = () => {
    if (!account) {
        alert("账号不能为空");
        return;
    }
    const newItem: Item = {
      id: itemToEdit?.id || new Date().toISOString(),
      account,
      password: password || account, // Default password to account if empty
      inviteCode,
      usageCount,
      remarks,
      createdAt: itemToEdit?.createdAt || new Date().toISOString(),
    };
    onSave(newItem);
    handleClose();
  };

  if (!isOpen) return null;

  const animationClass = isClosing ? 'animate-slide-down' : 'animate-slide-up';

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-end sm:items-center z-50" onClick={handleClose}>
       <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slide-down {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.3s ease-in forwards; }
        @media (min-width: 640px) {
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
           @keyframes fade-out {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
          }
          .animate-slide-up { animation: fade-in 0.2s ease-out forwards; }
          .animate-slide-down { animation: fade-out 0.2s ease-in forwards; }
        }
      `}</style>
      <div 
        className={`bg-gray-100 dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md m-0 sm:m-4 ${animationClass}`} 
        onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">{itemToEdit ? '编辑项目' : '添加新项目'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">账号 (4-12位数字)</label>
              <div className="flex rounded-lg shadow-sm">
                <input
                  type="text"
                  value={account}
                  onChange={handleAccountChange}
                  className="flex-1 block w-full rounded-none rounded-l-lg text-base p-3 border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  placeholder="例如: 12345678"
                />
                <span className="inline-flex items-center px-3 rounded-r-lg border-0 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-base">
                  @qq.com
                </span>
              </div>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg text-base p-3 border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-inset focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">邀请码 (6位)</label>
              <input
                type="text"
                value={inviteCode}
                onChange={handleInviteCodeChange}
                className="block w-full rounded-lg text-base p-3 border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-inset focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">次数</label>
              <input
                type="number"
                value={usageCount}
                onChange={(e) => setUsageCount(e.target.value)}
                className="block w-full rounded-lg text-base p-3 border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-inset focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">备注</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="block w-full rounded-lg text-base p-3 border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-inset focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-3 bg-gray-200 dark:bg-gray-700 text-base font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-gray-400 transition-all"
            onClick={handleClose}
          >
            取消
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-3 bg-blue-500 text-base font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-all"
            onClick={handleSave}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemFormModal;