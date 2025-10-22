
export type Tab = 'inventory' | 'shipped';

export interface Item {
  id: string;
  account: string; // The numeric part
  password: string;
  inviteCode: string;
  usageCount: string;
  remarks: string;
  createdAt: string; // ISO String
}

export interface ShippedItem extends Item {
  shippedAt: string; // ISO String
  originalGroupId: string;
}

interface BaseGroup {
  id: string;
  date: string;
  isExpanded: boolean;
}

export interface InventoryGroup extends BaseGroup {
  items: Item[];
}

export interface ShippedGroup extends BaseGroup {
  items: ShippedItem[];
}
