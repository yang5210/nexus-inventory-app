import React, { useState, useCallback } from 'react';
import type { ShippedGroup, ShippedItem, Item } from '../types';
import ItemGroup from './ItemGroup';
import ItemFormModal from './ItemFormModal';

interface ShippedViewProps {
  groups: ShippedGroup[];
  setGroups: React.Dispatch<React.SetStateAction<ShippedGroup[]>>;
  onReturnItem: (item: ShippedItem, sourceGroupId: string) => void;
}

const ShippedView: React.FC<ShippedViewProps> = ({ groups, setGroups, onReturnItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShippedItem | null>(null);

  const handleEditItem = useCallback((item: ShippedItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleSaveItem = useCallback((item: Item) => {
    if (!editingItem) return;
    
    // Merge the edited Item data with the existing ShippedItem to preserve extra fields
    const itemToSave: ShippedItem = {
        ...editingItem,
        ...item,
    };

    setGroups(prevGroups => {
        return prevGroups.map(g => {
            const itemIndex = g.items.findIndex(i => i.id === itemToSave.id);
            if (itemIndex > -1) {
                const newItems = [...g.items];
                newItems[itemIndex] = itemToSave;
                return { ...g, items: newItems };
            }
            return g;
        });
    });
    setIsModalOpen(false);
    setEditingItem(null);
  }, [editingItem, setGroups]);

  return (
    <div className="pt-4">
      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-16">
            <p className="text-lg">还没有已发货的记录</p>
          </div>
        ) : (
          groups.map(group => (
            // FIX: Explicitly provide the generic type to ItemGroup to fix type inference issues with generic components.
            <ItemGroup<ShippedGroup>
              key={group.id}
              group={group}
              setGroups={setGroups}
              isShippedView={true}
              onReturnItem={(item) => onReturnItem(item as ShippedItem, group.id)}
              onEditItem={(item) => handleEditItem(item as ShippedItem)}
            />
          ))
        )}
      </div>
      {isModalOpen && (
        <ItemFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
          itemToEdit={editingItem}
        />
      )}
    </div>
  );
};

export default ShippedView;