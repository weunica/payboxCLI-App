import type { FC } from 'react';
import { Page, WixDesignSystemProvider, Card } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import LegalAgreementRoot from '../../../shared/components/LegalAgreementRoot';
import { DEFAULT_DOCUMENT } from '../../../shared/constants/defaultDocument';

const DashboardPage: FC = () => {
  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <div dir="rtl">
        <Page>
          <Page.Header
            title="תנאי שימוש"
            subtitle="עריכת ההסכם המשפטי ותנאי השימוש של אפליקציית PayBox"
          />
          <Page.Content>
            <Card>
              <Card.Content>
                <LegalAgreementRoot readOnly={false} defaultDocument={DEFAULT_DOCUMENT} />
              </Card.Content>
            </Card>
          </Page.Content>
        </Page>
      </div>
    </WixDesignSystemProvider>
  );
};

export default DashboardPage;
