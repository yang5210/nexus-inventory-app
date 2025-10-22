import React, { useState, useEffect } from 'react';
import type { InventoryGroup, ShippedGroup, Item, ShippedItem } from '../types';
import ItemCard from './ItemCard';
import { PlusIcon, ChevronDownIcon, EditIcon, DeleteIcon, CheckIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';

type Group = InventoryGroup | ShippedGroup;

interface ItemGroupProps<T extends Group> {
  group: T;
  setGroups: React.Dispatch<React.SetStateAction<T[]>>;
  onAddItem?: () => void;
  onEditItem?: (item: Item) => void;
  onShipItem?: (item: Item) => void;
  onReturnItem?: (item: ShippedItem) => void;
  isShippedView: boolean;
}

const ItemGroup = <T extends Group>({ group, setGroups, onAddItem, onEditItem, onShipItem, onReturnItem, isShippedView }: ItemGroupProps<T>): React.ReactElement => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState(group.date);
  
  useEffect(() => {
    if (!isEditingName) {
      setGroupNameInput(group.date);
    }
  }, [group.date, isEditingName])

  const toggleExpand = () => {
    if (isEditingName) return;
    setGroups(prev => prev.map(g => g.id === group.id ? { ...g, isExpanded: !g.isExpanded } : g));
  };
  
  const confirmDeleteGroup = () => {
    setGroups(prev => prev.filter(g => g.id !== group.id));
    setIsDeleteModalOpen(false);
  };
  
  const handleDeleteItem = (itemId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === group.id) {
        // The type of `g.items.filter(...)` is widened to `(Item | ShippedItem)[]`.
        // We cast it back to the correct specific item array type.
        const newItems = g.items.filter(i => i.id !== itemId) as T['items'];
        return { ...g, items: newItems };
      }
      return g;
    }));
  };

  const handleSaveGroupName = () => {
    const trimmedName = groupNameInput.trim();
    if (group.date !== trimmedName && trimmedName !== '') {
        setGroups(prev => prev.map(g => g.id === group.id ? { ...g, date: trimmedName } : g));
    }
    setIsEditingName(false);
  };

  const handleNameInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveGroupName();
      } else if (e.key === 'Escape') {
          e.preventDefault();
          setGroupNameInput(group.date); // Revert changes
          setIsEditingName(false);
      }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mx-2 md:mx-4">
      <header
        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3 flex-grow min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                <input 
                    type="text"
                    value={groupNameInput}
                    onChange={e => setGroupNameInput(e.target.value)}
                    className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={handleNameInputKeyDown}
                    onBlur={handleSaveGroupName}
                />
                <button onClick={(e) => { e.stopPropagation(); handleSaveGroupName(); }} className="p-2 text-green-500 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 active:scale-95 transition-all">
                    <CheckIcon className="w-6 h-6"/>
                </button>
            </div>
          ) : (
            <>
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100 truncate">{group.date}</h2>
                 <button onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0 transition-colors">
                    <EditIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
                </button>
                <span className="text-base bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium px-2.5 py-1 rounded-full flex-shrink-0">
                    {group.items.length}
                </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 pl-2">
          {!isShippedView && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddItem?.(); }}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-colors"
              aria-label="添加项目"
            >
              <PlusIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }}
            className="p-2 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-colors"
            aria-label="删除组合"
          >
             <DeleteIcon className="w-6 h-6" />
          </button>
          <ChevronDownIcon className={`w-7 h-7 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${group.isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </header>

      {group.isExpanded && (
        <div className="pb-2">
          {group.items.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {group.items.map(item => (
                    <ItemCard
                        key={item.id}
                        item={item}
                        onEdit={onEditItem}
                        onDelete={() => handleDeleteItem(item.id)}
                        onShip={onShipItem}
                        onReturn={onReturnItem}
                        isShippedView={isShippedView}
                    />
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 text-base py-8">该分组内暂无内容</p>
          )}
        </div>
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteGroup}
        title="确认删除"
        message={`确定要删除 ${group.date} 这个组合以及其中的所有内容吗？此操作无法撤销。`}
      />
    </div>
  );
};

export default ItemGroup;