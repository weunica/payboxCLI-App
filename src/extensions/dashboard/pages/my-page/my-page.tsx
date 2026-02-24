import type { FC } from 'react';
import { Page, WixDesignSystemProvider } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import LegalAgreementRoot from '../../../shared/components/LegalAgreementRoot';
import { DEFAULT_DOCUMENT } from '../../../shared/constants/defaultDocument';

const DashboardPage: FC = () => {
  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <Page>
        <Page.Header
          title="Paybox General Terms of Use"
          subtitle="Editing the legal agreement and terms of use for the PayBox application"
        />
        <Page.Content>
          <LegalAgreementRoot readOnly={false} defaultDocument={DEFAULT_DOCUMENT} />
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
};

export default DashboardPage;
