import React, { useState, useEffect, useCallback } from 'react';
import { WixDesignSystemProvider, Page, Box, Button, Text, Card, Loader } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { dataOperations } from './dataOperations';
import type { TermsOfUseItem } from './types';

export default function TermsOfUseManagementPage() {
  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <TermsOfUseManagement />
    </WixDesignSystemProvider>
  );
}

function TermsOfUseManagement() {
  const [items, setItems] = useState<TermsOfUseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedItems = await dataOperations.fetchAllItems();
      setItems(fetchedItems);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load items';
      setError(message);
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Page>
      <Page.Header
        title="Terms of Use Management"
        subtitle="Create, manage, and organize your Terms of Use sections"
      />

      <Page.Content>
        <Card>
          <Box padding={24} gap={16} direction="vertical">
            {error && (
              <Box padding={16} style={{ backgroundColor: '#fff3f0', borderLeft: '3px solid #d4252e' }}>
                <Text>{error}</Text>
              </Box>
            )}

            {isLoading ? (
              <Box style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <Loader />
              </Box>
            ) : (
              <>
                <Box gap={8} direction="vertical">
                  <Text size="small">Total sections: {items.length}</Text>
                  <Text size="small" color="secondary">
                    Phase 2 management UI. Currently showing data loading state.
                  </Text>
                </Box>

                {items.length === 0 ? (
                  <Text color="secondary">No terms of use items found. Use the accordion widget on your site first.</Text>
                ) : (
                  <Box direction="vertical" gap={8}>
                    {items.map((item) => (
                      <Box key={item._id} padding={12} style={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <Text weight="bold">{item.title}</Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Card>
      </Page.Content>
    </Page>
  );
}
