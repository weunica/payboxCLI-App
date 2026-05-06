import React, { useState, useEffect } from 'react';
import { Box, Text, Button, Input } from '@wix/design-system';
import type { EditingItem } from './types';

interface EditModalProps {
  isOpen: boolean;
  item: EditingItem | null;
  parentItem: any;
  onSave: (item: EditingItem) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  item,
  parentItem,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [formData, setFormData] = useState<EditingItem | null>(null);

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  if (!isOpen || !formData) return null;

  const handleSave = async () => {
    if (formData) {
      await onSave(formData);
    }
  };

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
        maxWidth: '500px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }} direction="vertical" gap={16}>
        <Text weight="bold">
          {formData._id ? 'Edit Section' : 'Add New Section'}
        </Text>

        <Box direction="vertical" gap={12}>
          <Text size="small" weight="bold">Title</Text>
          <Input
            placeholder="Section title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </Box>

        <Box direction="vertical" gap={12}>
          <Text size="small" weight="bold">Content</Text>
          <textarea
            placeholder="Section content (supports HTML)"
            value={formData.content || ''}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '8px',
              fontFamily: 'monospace',
              fontSize: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </Box>

        <Box gap={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={onCancel}
            priority="secondary"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            priority="primary"
            disabled={isSaving || !formData.title}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>
    </div>
  );
};
