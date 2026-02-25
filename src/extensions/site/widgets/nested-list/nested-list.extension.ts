import { extensions } from '@wix/astro/builders';

export default extensions.customElement({
  id: 'c4f2e8a1-7b3d-4e9f-8c2a-1d5f6e0b3a7c',
  name: 'NestedList',
  tagName: 'nested-list',
  element: './extensions/site/widgets/nested-list/nested-list.tsx',
  settings: './extensions/site/widgets/nested-list/nested-list.panel.tsx',
  installation: {
    autoAdd: true,
  },
  presets: [
    {
      name: 'Nested List',
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      thumbnailUrl: '{{BASE_URL}}/nested-list-thumbnail.png',
    },
  ],
  width: {
    defaultWidth: 600,
    allowStretch: true,
  },
  height: {
    defaultHeight: 400,
  },
});
