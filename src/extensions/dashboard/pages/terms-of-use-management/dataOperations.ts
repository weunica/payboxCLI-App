import type { TermsOfUseItem, TreeNode } from './types';

declare const wixData: any; // Will be available at runtime in Wix dashboard

const COLLECTION_NAME = 'TermsOfUse';

export const dataOperations = {
  async fetchAllItems(): Promise<TermsOfUseItem[]> {
    try {
      const result = await wixData.query(COLLECTION_NAME)
        .ascending('order')
        .ascending('level')
        .find();
      return result.items as TermsOfUseItem[];
    } catch (error) {
      console.error('Failed to fetch items:', error);
      throw new Error('Failed to load terms of use');
    }
  },

  async createItem(item: Omit<TermsOfUseItem, '_id'>): Promise<TermsOfUseItem> {
    try {
      const result = await wixData.insert(COLLECTION_NAME, item);
      return result as TermsOfUseItem;
    } catch (error) {
      console.error('Failed to create item:', error);
      throw new Error('Failed to create section');
    }
  },

  async updateItem(itemId: string, updates: Partial<TermsOfUseItem>): Promise<TermsOfUseItem> {
    try {
      const result = await wixData.update(COLLECTION_NAME, { ...updates, _id: itemId });
      return result as TermsOfUseItem;
    } catch (error) {
      console.error('Failed to update item:', error);
      throw new Error('Failed to update section');
    }
  },

  async deleteItem(itemId: string): Promise<void> {
    try {
      await wixData.remove(COLLECTION_NAME, itemId);
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw new Error('Failed to delete section');
    }
  },

  async deleteItemAndChildren(parentId: string): Promise<void> {
    try {
      const children = await wixData.query(COLLECTION_NAME)
        .eq('parentId', parentId)
        .find();
      
      for (const child of children.items) {
        await this.deleteItemAndChildren(child._id);
      }
      await this.deleteItem(parentId);
    } catch (error) {
      console.error('Failed to delete item and children:', error);
      throw new Error('Failed to delete section and its subsections');
    }
  },

  async updateOrder(itemId: string, newOrder: number, parentId?: string): Promise<void> {
    try {
      const updates: Partial<TermsOfUseItem> = { order: newOrder };
      if (parentId !== undefined) {
        updates.parentId = parentId;
      }
      await wixData.update(COLLECTION_NAME, { ...updates, _id: itemId });
    } catch (error) {
      console.error('Failed to update order:', error);
      throw new Error('Failed to reorder items');
    }
  },

  buildTree(items: TermsOfUseItem[], parentId?: string): TreeNode[] {
    return items
      .filter(item => (item.parentId || undefined) === (parentId || undefined))
      .sort((a, b) => a.order - b.order)
      .map(item => {
        const children = this.buildTree(items, item.id);
        return {
          ...item,
          children,
          childCount: children.length,
          isExpanded: item.isOpen || false,
        };
      });
  },

  async searchItems(query: string): Promise<TermsOfUseItem[]> {
    try {
      if (!query.trim()) {
        return this.fetchAllItems();
      }
      const result = await wixData.query(COLLECTION_NAME)
        .contains('title', query)
        .ascending('order')
        .find();
      return result.items as TermsOfUseItem[];
    } catch (error) {
      console.error('Failed to search items:', error);
      throw new Error('Failed to search sections');
    }
  },
};
