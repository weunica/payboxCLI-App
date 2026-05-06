import { app } from '@wix/astro/builders';
import tosPage from './extensions/dashboard/pages/tos/tos.extension.ts';
import nestedListsPage from './extensions/dashboard/pages/nested-lists/nested-lists.extension.ts';
import qrPopup from './extensions/site/widgets/qr-popup/qr-popup.extension.ts';
import legalLayer from './extensions/site/widgets/legal-layer/legal-layer.extension.ts';
import nestedList from './extensions/site/widgets/nested-list/nested-list.extension.ts';


export default app()
  .use(tosPage)
  .use(nestedListsPage)
  .use(qrPopup)
  .use(legalLayer)
  .use(nestedList);
