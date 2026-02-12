import { extensions } from '@wix/astro/builders';

export default extensions.customElement({
  id: '40ace13c-b77e-4527-a74e-6c9e60ca5047',
  name: 'QR_popup',
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
      
      name: 'QR Code Popup',
      id: 'b9b1ba79-abdc-46e7-9116-2440aa8f71ed',
      thumbnailUrl: '{{BASE_URL}}/qr-popup-thumbnail.png',
    },
  ],
  
  tagName: 'qr-popup',
  element: './extensions/site/widgets/qr-popup/qr-popup.tsx',
  settings: './extensions/site/widgets/qr-popup/qr-popup.panel.tsx',
});
