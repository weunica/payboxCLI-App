import React, { type FC, useState, useEffect } from 'react';
import { widget, inputs } from '@wix/editor';
import {
  SidePanel,
  WixDesignSystemProvider,
  Input,
  FormField,
  Box,
  Layout,
  Cell,
  Text,
  Divider,
  ToggleSwitch,
  FillPreview
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';

const Panel: FC = () => {
  const [values, setValues] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      const props = [
        'display-name', 'modal-title', 'modal-subtitle', 
        'step-1', 'step-2', 'step-3', 
        'btn-bg-color', 'btn-border-color', 'btn-text-color', 
        'show-arrow', 'deeplink-value'
      ];
      const data: any = {};
      for (const prop of props) {
        data[prop] = await widget.getProp(prop);
      }
      setValues(data);
    };
    loadData();
  }, []);

  const updateProp = (key: string, val: any) => {
    setValues((prev: any) => ({ ...prev, [key]: val }));
    widget.setProp(key, val);
  };

  const openColorPicker = (key: string) => {
    inputs.selectColor(values[key] || 'transparent', {
      onChange: (value) => updateProp(key, value ?? 'transparent'),
    });
  };
return (
    <WixDesignSystemProvider>
      <SidePanel width="300">
        <SidePanel.Content>
          <Box padding="medium">
            <Layout gap="18px">
              <Cell><Text weight="bold">עיצוב כפתור</Text></Cell>
              
              <Cell>
                <FormField label="טקסט כפתור">
                  <Input value={values['display-name']} onChange={e => updateProp('display-name', e.target.value)} />
                </FormField>
              </Cell>

              {/* סידור הצבעים בשתי עמודות צמודות כדי לשמור על פרופורציה */}
              <Cell>
                <Layout cols={2} gap="10px">
                  <FormField label="רקע" labelPlacement="top">
                    <Box width="34px" height="34px" border="1px solid #DFE5EB" borderRadius="4px" overflow="hidden">
                      <FillPreview fill={values['btn-bg-color']} onClick={() => openColorPicker('btn-bg-color')} />
                    </Box>
                  </FormField>

                  <FormField label="טקסט" labelPlacement="top">
                    <Box width="34px" height="34px" border="1px solid #DFE5EB" borderRadius="4px" overflow="hidden">
                      <FillPreview fill={values['btn-text-color']} onClick={() => openColorPicker('btn-text-color')} />
                    </Box>
                  </FormField>

                  <FormField label="מסגרת" labelPlacement="top">
                    <Box width="34px" height="34px" border="1px solid #DFE5EB" borderRadius="4px" overflow="hidden">
                      <FillPreview fill={values['btn-border-color']} onClick={() => openColorPicker('btn-border-color')} />
                    </Box>
                  </FormField>
                </Layout>
              </Cell>

              <Cell>
                <Box align="space-between" verticalAlign="middle">
                  <Text size="small">הצג חץ (&gt;)</Text>
                  <ToggleSwitch 
                    checked={values['show-arrow'] === 'true' || values['show-arrow'] === true} 
                    onChange={e => updateProp('show-arrow', e.target.checked.toString())} 
                  />
                </Box>
              </Cell>

              <Divider />
              {/* החזרת שדות הטקסט של המודאל */}
              <Cell><Text weight="bold">טקסטים במודאל</Text></Cell>
              <Cell><FormField label="כותרת"><Input value={values['modal-title']} onChange={e => updateProp('modal-title', e.target.value)} /></FormField></Cell>
              <Cell><FormField label="תת כותרת"><Input value={values['modal-subtitle']} onChange={e => updateProp('modal-subtitle', e.target.value)} /></FormField></Cell>
              <Cell><FormField label="שלב 1"><Input value={values['step-1']} onChange={e => updateProp('step-1', e.target.value)} /></FormField></Cell>
              <Cell><FormField label="שלב 2"><Input value={values['step-2']} onChange={e => updateProp('step-2', e.target.value)} /></FormField></Cell>
              <Cell><FormField label="שלב 3"><Input value={values['step-3']} onChange={e => updateProp('step-3', e.target.value)} /></FormField></Cell>
              
              <Divider />
              <Cell><FormField label="Deep Link Value"><Input value={values['deeplink-value']} onChange={e => updateProp('deeplink-value', e.target.value)} /></FormField></Cell>
            </Layout>
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};
export default Panel;