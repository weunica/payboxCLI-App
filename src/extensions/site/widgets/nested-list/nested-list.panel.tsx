import React, { type FC, useState, useEffect, useCallback } from 'react';
import { widget } from '@wix/editor';
import {
  SidePanel,
  WixDesignSystemProvider,
  Input,
  FormField,
  Text,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';

const Panel: FC = () => {
  const [pageName, setPageName] = useState<string>('');

  useEffect(() => {
    widget
      .getProp('page-name')
      .then((val) => setPageName(val || ''))
      .catch((err) => console.error('Failed to fetch page-name:', err));
  }, []);

  const handlePageNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setPageName(newValue);
      widget.setProp('page-name', newValue);
    },
    []
  );

  return (
    <WixDesignSystemProvider>
      <SidePanel width="300" height="100vh">
        <SidePanel.Content noPadding stretchVertically>
          <SidePanel.Field>
            <FormField label="Page Name">
              <Input
                type="text"
                value={pageName}
                onChange={handlePageNameChange}
                placeholder="e.g. privacy-policy"
                aria-label="Page Name"
              />
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field>
            <Text size="small" secondary>
              Enter the page name to load the nested list from the CMS collection &quot;nested-dynamic-lists&quot;.
            </Text>
          </SidePanel.Field>
        </SidePanel.Content>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;
