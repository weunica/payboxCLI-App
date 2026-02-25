import React, { useEffect, useState, useCallback } from 'react';
import {
  WixDesignSystemProvider,
  Page,
  Card,
  Button,
  Input,
  FormField,
  Table,
  TableToolbar,
  TableActionCell,
  Text,
  EmptyState,
  TextButton,
  Box,
  Loader,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { items } from '@wix/data';
import { dashboard } from '@wix/dashboard';
import { Add, Delete } from '@wix/wix-ui-icons-common';
import NestedListEditor from './NestedListEditor';
import type { ListItem, NestedListRecord } from './types';

const COLLECTION = '@payboxapp/qr-script/nested-dynamic-lists';

type ViewMode = 'list' | 'editor';

const NestedListsPage: React.FC = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<NestedListRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageName, setPageName] = useState('');
  const [editorItems, setEditorItems] = useState<ListItem[]>([]);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await items.query(COLLECTION).find();
      setRecords(result.items as NestedListRecord[]);
    } catch (err) {
      console.error('Failed to load records', err);
      dashboard.showToast({ message: 'Failed to load lists', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const openNew = () => {
    setEditingId(null);
    setPageName('');
    setEditorItems([]);
    setView('editor');
  };

  const openEdit = (record: NestedListRecord) => {
    setEditingId(record._id ?? null);
    setPageName(record.page_name);
    setEditorItems(record.list_data?.items ?? []);
    setView('editor');
  };

  const handleDelete = async (id: string) => {
    try {
      await items.remove(COLLECTION, id);
      await loadRecords();
      dashboard.showToast({ message: 'List deleted', type: 'success' });
    } catch (err) {
      console.error('Failed to delete', err);
      dashboard.showToast({ message: 'Failed to delete list', type: 'error' });
    }
  };

  const handleSave = async () => {
    if (!pageName.trim()) return;
    setSaving(true);
    const list_data = { items: editorItems };
    try {
      if (editingId) {
        await items.update(COLLECTION, {
          _id: editingId,
          page_name: pageName.trim(),
          list_data,
        });
      } else {
        await items.insert(COLLECTION, {
          page_name: pageName.trim(),
          list_data,
        });
      }
      await loadRecords();
      setView('list');
      dashboard.showToast({ message: 'List saved successfully', type: 'success' });
    } catch (err) {
      console.error('Failed to save', err);
      dashboard.showToast({ message: 'Failed to save list', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'שם עמוד (Page Name)',
      render: (row: NestedListRecord) => <Text>{row.page_name}</Text>,
    },
    {
      title: '',
      render: (row: NestedListRecord) => (
        <TableActionCell
          primaryAction={{
            text: 'עריכה',
            onClick: () => openEdit(row),
          }}
          secondaryActions={[
            {
              text: 'מחיקה',
              icon: <Delete />,
              onClick: () => {
                if (row._id) {
                  void handleDelete(row._id);
                }
              },
            },
          ]}
        />
      ),
    },
  ];

  if (view === 'editor') {
    return (
      <WixDesignSystemProvider features={{ newColorsBranding: true }}>
        <div dir="rtl">
        <Page>
          <Page.Header
            title={editingId ? 'עריכת רשימה מקוננת' : 'רשימה מקוננת חדשה'}
            actionsBar={
              <Box gap="SP2">
                <Button skin="inverted" onClick={() => setView('list')}>
                  ביטול
                </Button>
                <Button
                  onClick={() => void handleSave()}
                  disabled={saving || !pageName.trim()}
                >
                  {saving ? 'שומר...' : 'שמור'}
                </Button>
              </Box>
            }
          />
          <Page.Content>
            <Card>
              <Card.Header title="פרטי הרשימה" />
              <Card.Content>
                <Box direction="vertical" gap="SP4">
                  <FormField label="שם עמוד (Page Name)" required>
                    <Input
                      value={pageName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageName(e.target.value)}
                      placeholder="לדוגמה: privacy-policy"
                    />
                  </FormField>
                  <Text size="small" secondary>
                    שם העמוד ישמש לזיהוי הרשימה בווידג׳ט — חייב להיות זהה לערך שמוזן בפאנל הווידג׳ט.
                  </Text>
                  <Box direction="vertical" gap="SP2">
                    <Text weight="bold">פריטי הרשימה</Text>
                    <NestedListEditor
                      items={editorItems}
                      onChange={setEditorItems}
                    />
                  </Box>
                </Box>
              </Card.Content>
            </Card>
          </Page.Content>
        </Page>
        </div>
      </WixDesignSystemProvider>
    );
  }

  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <div dir="rtl">
      <Page>
        <Page.Header
          title="רשימות מקוננות דינמיות"
          subtitle="נהל תוכן רשימות מקוננות לעמודי האתר שלך"
        />
        <Page.Content>
          {loading ? (
            <Box align="center" padding="SP8">
              <Loader size="medium" />
            </Box>
          ) : records.length === 0 ? (
            <EmptyState
              title="אין רשימות עדיין"
              subtitle="צור את הרשימה המקוננת הראשונה שלך"
              theme="page"
            >
              <TextButton prefixIcon={<Add />} onClick={openNew}>
                צור רשימה
              </TextButton>
            </EmptyState>
          ) : (
            <Card>
              <Table data={records} columns={columns}>
                <TableToolbar>
                  <TableToolbar.ItemGroup position="start">
                    <TableToolbar.Title>כל הרשימות</TableToolbar.Title>
                  </TableToolbar.ItemGroup>
                  <TableToolbar.ItemGroup position="end">
                    <TableToolbar.Item>
                      <Button size="small" prefixIcon={<Add />} onClick={openNew}>
                        רשימה חדשה
                      </Button>
                    </TableToolbar.Item>
                  </TableToolbar.ItemGroup>
                </TableToolbar>
                <Table.Content />
              </Table>
            </Card>
          )}
        </Page.Content>
      </Page>
      </div>
      </WixDesignSystemProvider>
    );
};

export default NestedListsPage;
