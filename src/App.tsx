import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { InventoryGroup, ShippedGroup, Item, ShippedItem, Tab } from './types';
import { InventoryIcon, ShippedIcon, PlusIcon, TagIcon } from './components/Icons';
import InventoryView from './components/InventoryView';
import ShippedView from './components/ShippedView';
import DefaultRemarkModal from './components/DefaultRemarkModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [inventoryGroups, setInventoryGroups] = useLocalStorage<InventoryGroup[]>('inventoryGroups', []);
  const [shippedGroups, setShippedGroups] = useLocalStorage<ShippedGroup[]>('shippedGroups', []);
  const [globalDefaultRemark, setGlobalDefaultRemark] = useLocalStorage<string>('globalDefaultRemark', '');
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const handleAddInventoryGroup = useCallback(() => {
    const now = new Date();
    const newGroup: InventoryGroup = {
      id: now.toISOString(),
      date: formatDate(now),
      items: [],
      isExpanded: true,
    };
    setInventoryGroups(prev => [newGroup, ...prev]);
  }, [setInventoryGroups]);

  const handleShipItem = useCallback((item: Item, sourceGroupId: string) => {
    const now = new Date();
    const shippedDate = formatDate(now);

    // Remove from inventory
    let shippedItem: Item | null = null;
    const newInventoryGroups = inventoryGroups.map(group => {
      if (group.id === sourceGroupId) {
        const newItems = group.items.filter(i => {
          if (i.id === item.id) {
            shippedItem = i;
            return false;
          }
          return true;
        });
        return { ...group, items: newItems };
      }
      return group;
    }).filter(group => group.items.length > 0); // Remove group if empty
    setInventoryGroups(newInventoryGroups);

    if (!shippedItem) return;

    // Add to shipped
    const newShippedItem: ShippedItem = {
      ...shippedItem,
      shippedAt: now.toISOString(),
      originalGroupId: sourceGroupId,
    };

    setShippedGroups(prev => {
      const existingGroup = prev.find(g => g.date === shippedDate);
      if (existingGroup) {
        return prev.map(g => 
          g.id === existingGroup.id 
            ? { ...g, items: [newShippedItem, ...g.items] }
            : g
        );
      } else {
        const newGroup: ShippedGroup = {
          id: now.toISOString(),
          date: shippedDate,
          items: [newShippedItem],
          isExpanded: true,
        };
        return [newGroup, ...prev];
      }
    });
  }, [inventoryGroups, setInventoryGroups, setShippedGroups]);
  
  const handleReturnItem = useCallback((itemToReturn: ShippedItem, sourceGroupId: string) => {
      // Remove from shipped
      const newShippedGroups = shippedGroups.map(group => {
        if (group.id === sourceGroupId) {
          return { ...group, items: group.items.filter(i => i.id !== itemToReturn.id) };
        }
        return group;
      }).filter(group => group.items.length > 0);
      setShippedGroups(newShippedGroups);

      // Add back to inventory
      const { shippedAt, originalGroupId, ...originalItem } = itemToReturn;

      setInventoryGroups(prev => {
        let itemAdded = false;
        const updatedGroups = prev.map(group => {
          if (group.id === originalGroupId) {
            itemAdded = true;
            // Add item back and sort by creation time (newest first)
            const newItems = [...group.items, originalItem].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { ...group, items: newItems };
          }
          return group;
        });

        if (itemAdded) {
          return updatedGroups;
        } else {
          // If original group was deleted, recreate it
          const originalGroupDate = formatDate(new Date(originalGroupId));
          const newGroup: InventoryGroup = {
            id: originalGroupId,
            date: originalGroupDate,
            items: [originalItem],
            isExpanded: true,
          };
          return [newGroup, ...prev].sort((a,b) => new Date(b.id).getTime() - new Date(a.id).getTime());
        }
      });
  }, [shippedGroups, setShippedGroups, setInventoryGroups]);


  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-black">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700/50 p-4 sticky top-0 z-20">
        <div className="relative flex justify-center items-center h-10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 text-transparent bg-clip-text tracking-wide">Nexus</h1>
            {activeTab === 'inventory' && (
                <div className="absolute right-0 flex items-center gap-2">
                    <button
                        onClick={() => setIsRemarkModalOpen(true)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-500/10 hover:bg-gray-500/20 dark:bg-white/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 rounded-full active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="设置默认备注"
                    >
                        <TagIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleAddInventoryGroup}
                        className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 active:scale-95 transition-all focus:outline-none focus:ring-2 ring-offset-white dark:ring-offset-gray-900 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label="添加当天组合"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
      </header>

      <main className="flex-grow overflow-y-auto pb-24">
        {activeTab === 'inventory' ? (
          <InventoryView
            groups={inventoryGroups}
            setGroups={setInventoryGroups}
            onShipItem={handleShipItem}
            globalDefaultRemark={globalDefaultRemark}
          />
        ) : (
          <ShippedView
            groups={shippedGroups}
            setGroups={setShippedGroups}
            onReturnItem={handleReturnItem}
          />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 flex justify-around p-2 z-20">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-300 ${activeTab === 'inventory' ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <InventoryIcon className="w-7 h-7" />
          <span className="text-sm mt-1">库存</span>
        </button>
        <button
          onClick={() => setActiveTab('shipped')}
          className={`flex flex-col items-center justify-center w-full py-1 rounded-lg transition-colors duration-300 ${activeTab === 'shipped' ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <ShippedIcon className="w-7 h-7" />
          <span className="text-sm mt-1">已发货</span>
        </button>
      </footer>
      <DefaultRemarkModal
        isOpen={isRemarkModalOpen}
        onClose={() => setIsRemarkModalOpen(false)}
        onSave={setGlobalDefaultRemark}
        initialRemark={globalDefaultRemark}
      />
    </div>
  );
};

export default App;