export interface TermsOfUseItem {
  _id?: string;
  _createdDate?: string;
  _updatedDate?: string;
  id: string;
  level: number;
  parentId?: string;
  title: string;
  content?: string;
  order: number;
  isOpen?: boolean;
  type?: 'section' | 'list' | 'paragraph';
  metadata?: Record<string, any>;
}

export interface TreeNode extends TermsOfUseItem {
  children: TreeNode[];
  childCount: number;
  isExpanded: boolean;
}

export interface EditingItem {
  _id?: string;
  id: string;
  level: number;
  parentId?: string;
  title: string;
  content: string;
  type: 'section' | 'list' | 'paragraph';
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface SelectionState {
  selectedIds: Set<string>;
}
