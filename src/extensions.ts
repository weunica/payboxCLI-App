import { app } from '@wix/astro/builders';
import myPage from './extensions/dashboard/pages/my-page/my-page.extension.ts';

import qrPopup from './extensions/site/widgets/qr-popup/qr-popup.extension.ts';

import legalLayer from './extensions/site/widgets/legal-layer/legal-layer.extension.ts';

export default app()
  .use(myPage).use(qrPopup).use(legalLayer);
