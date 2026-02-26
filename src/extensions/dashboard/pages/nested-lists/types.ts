export type ListItemType = 'item' | 'text-block' | 'heading-block';

export interface ListItem {
  id: string;
  type?: ListItemType;
  title: string;
  description?: string;
  children?: ListItem[];
  /** For text-block: 'small' (16px) or 'normal' (19.2px) */
  textSize?: 'small' | 'normal';
}

export interface NestedListRecord {
  _id?: string;
  page_name: string;
  list_data: { items: ListItem[] };
}
