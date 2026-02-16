import { extensions } from '@wix/astro/builders';

export default extensions.customElement({
  id: '09d1306a-31ca-43ba-bb40-28cd8c67f6fd',
  name: 'LegalLayer',
  width: {
    defaultWidth: 450,
    allowStretch: true
  },
  height: {
    defaultHeight: 250
  },
  installation: {
    autoAdd: true
  },
  presets: [
    {
        name: 'Legal Layer',
      id: '97dbaaeb-69a3-4671-a4a0-c869e6d723f4',
      thumbnailUrl: '{{BASE_URL}}/legal-layer-thumbnail.png',
    },
  ],
  
  tagName: 'legal-layer',
  element: './extensions/site/widgets/legal-layer/legal-layer.tsx',
  settings: './extensions/site/widgets/legal-layer/legal-layer.panel.tsx',
});
