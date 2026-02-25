export type ListItemType = 'item' | 'text-block' | 'heading-block';

export interface ListItem {
  id: string;
  type?: ListItemType;
  title: string;
  description?: string;
  children?: ListItem[];
}

export interface NestedListRecord {
  _id?: string;
  page_name: string;
  list_data: { items: ListItem[] };
}
