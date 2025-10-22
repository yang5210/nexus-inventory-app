import React, { useState } from 'react';
import type { Item, ShippedItem } from '../types';
import { CopyIcon, ShipIcon, ReturnIcon, EditIcon, DeleteIcon, CheckIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';

interface ItemCardProps {
  item: Item | ShippedItem;
  onEdit?: (item: Item) => void;
  onDelete: () => void;
  onShip?: (item: Item) => void;
  onReturn?: (item: ShippedItem) => void;
  isShippedView: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete, onShip, onReturn, isShippedView }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const shippedItem = item as ShippedItem;
  const time = isShippedView ? shippedItem.shippedAt : item.createdAt;
  const displayTime = new Date(time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleCopy = () => {
    const textToCopy = `账号：${item.account}@qq.com\n密码：${item.password || item.account}\n备注：${item.remarks}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteModalOpen(false);
  };
  
  return (
    <div className="p-4 relative">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
        <div className="flex items-center">
            <span className="font-semibold w-16 text-gray-500 dark:text-gray-400">账号:</span>
            <span className="text-gray-800 dark:text-gray-100 break-all">{item.account}@qq.com</span>
        </div>
         <div className="flex items-center">
            <span className="font-semibold w-16 text-gray-500 dark:text-gray-400">密码:</span>
            <span className="text-gray-800 dark:text-gray-100">{item.password || item.account}</span>
        </div>
        <div className="flex items-center">
            <span className="font-semibold w-16 text-gray-500 dark:text-gray-400">邀请码:</span>
            <span className="text-gray-800 dark:text-gray-100">{item.inviteCode}</span>
        </div>
        <div className="flex items-center">
            <span className="font-semibold w-16 text-gray-500 dark:text-gray-400">次数:</span>
            <span className="text-gray-800 dark:text-gray-100">{item.usageCount}</span>
        </div>
        <div className="col-span-2 flex items-start">
            <span className="font-semibold w-16 text-gray-500 dark:text-gray-400 shrink-0">备注:</span>
            <span className="text-gray-800 dark:text-gray-100 break-words">{item.remarks}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-400 dark:text-gray-500">{displayTime}</span>
        <div className="flex items-center space-x-2">
            {onEdit && (
                <button onClick={() => onEdit(item)} className="p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all">
                    <EditIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            )}
            <button onClick={() => setIsDeleteModalOpen(true)} className="p-2.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-all">
                <DeleteIcon className="w-5 h-5 text-red-500" />
            </button>
            <button onClick={handleCopy} className={`p-2.5 rounded-full transition-all active:scale-95 ${isCopied ? 'bg-green-100 dark:bg-green-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {isCopied ? <CheckIcon className="w-5 h-5 text-green-600" /> : <CopyIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
            </button>
            {isShippedView ? (
                <button onClick={() => onReturn?.(item as ShippedItem)} className="p-2.5 rounded-full bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 active:scale-95 transition-all">
                    <ReturnIcon className="w-5 h-5 text-yellow-600" />
                </button>
            ) : (
                <button onClick={() => onShip?.(item)} className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 active:scale-95 transition-all">
                    <ShipIcon className="w-5 h-5 text-blue-600" />
                </button>
            )}
        </div>
      </div>
       <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="确认删除"
        message="确定要删除这个项目吗？"
      />
    </div>
  );
};

export default ItemCard;
