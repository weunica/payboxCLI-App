import React from 'react';
import { Box, Text, Button } from '@wix/design-system';

interface DeleteConfirmationProps {
  isOpen: boolean;
  item: { _id: string; title?: string } | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  item,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <Box padding={24} style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }} direction="vertical" gap={16}>
        <Text weight="bold">Delete Section</Text>
        <Text>Are you sure you want to delete "{item.title}"? This action cannot be undone.</Text>
        <Box gap={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={onCancel}
            disabled={isDeleting}
            priority="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            priority="primary"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Box>
      </Box>
    </div>
  );
};
