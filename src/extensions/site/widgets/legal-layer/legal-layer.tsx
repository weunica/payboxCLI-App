import React from 'react';
import { createRoot } from 'react-dom/client';
import LegalAgreementRoot from '../../../shared/components/LegalAgreementRoot';
import { DEFAULT_DOCUMENT } from '../../../shared/constants/defaultDocument';
import legalStyles from '../../../shared/styles/legal-scope.css?inline';

export default class LegalLayer extends HTMLElement {
  private root: any;

  connectedCallback() {
    const styleId = 'legal-scope-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = legalStyles;

    this.root = createRoot(this);
    this.root.render(
      <LegalAgreementRoot readOnly={true} defaultDocument={DEFAULT_DOCUMENT} />
    );
  }

  disconnectedCallback() {
    this.root?.unmount();
  }
}


