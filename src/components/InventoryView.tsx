import React, { useState, useCallback } from 'react';
import type { InventoryGroup, Item } from '../types';
import ItemGroup from './ItemGroup';
import ItemFormModal from './ItemFormModal';
import { PlusIcon } from './Icons';

interface InventoryViewProps {
  groups: InventoryGroup[];
  setGroups: React.Dispatch<React.SetStateAction<InventoryGroup[]>>;
  onShipItem: (item: Item, sourceGroupId: string) => void;
  globalDefaultRemark: string;
}

const InventoryView: React.FC<InventoryViewProps> = ({ groups, setGroups, onShipItem, globalDefaultRemark }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ item: Item, groupId: string } | null>(null);
  const [addingToGroupId, setAddingToGroupId] = useState<string | null>(null);

  const handleAddItem = useCallback((groupId: string) => {
    setAddingToGroupId(groupId);
    setEditingItem(null);
    setIsModalOpen(true);
  }, []);

  const handleEditItem = useCallback((item: Item, groupId: string) => {
    setEditingItem({ item, groupId });
    setAddingToGroupId(null);
    setIsModalOpen(true);
  }, []);

  const handleSaveItem = useCallback((item: Item) => {
    const groupId = editingItem?.groupId || addingToGroupId;
    if (!groupId) return;

    setGroups(prevGroups => {
      return prevGroups.map(g => {
        if (g.id === groupId) {
          // Check if it's an edit or a new item by looking for the item's ID
          const isEditing = editingItem && g.items.some(i => i.id === editingItem.item.id);

          if (isEditing) {
            // Edit existing item: update with new data from the form
            const newItems = g.items.map(i => i.id === item.id ? item : i);
            return { ...g, items: newItems };
          } else {
            // Add new item: apply global default remark if the item's remark is empty
            const newRemark = item.remarks === '' ? globalDefaultRemark : item.remarks;
            const itemToSave = { ...item, remarks: newRemark };
            return { ...g, items: [itemToSave, ...g.items] };
          }
        }
        return g;
      });
    });
    setIsModalOpen(false);
    setEditingItem(null);
    setAddingToGroupId(null);
  }, [editingItem, addingToGroupId, setGroups, globalDefaultRemark]);

  return (
    <div className="pt-4">
      <div className="space-y-4">
        {groups.map(group => (
          // FIX: Explicitly provide the generic type to ItemGroup to fix type inference issues with generic components.
          <ItemGroup<InventoryGroup>
            key={group.id}
            group={group}
            setGroups={setGroups}
            onAddItem={() => handleAddItem(group.id)}
            onEditItem={(item) => handleEditItem(item, group.id)}
            onShipItem={(item) => onShipItem(item, group.id)}
            isShippedView={false}
          />
        ))}
      </div>

      {isModalOpen && (
        <ItemFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
          itemToEdit={editingItem?.item}
        />
      )}
    </div>
  );
};

export default InventoryView;