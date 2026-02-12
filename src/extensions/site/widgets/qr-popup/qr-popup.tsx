// @ts-nocheck

const initAppsFlyerEngine = () => {
  window.AF_SMART_SCRIPT = {
    generateOneLinkURL: function (config) {
      let url = "https://app.payboxapp.com/Wsya?af_js_web=true&af_ss_ver=2_4_0";
      const urlParams = new URLSearchParams(window.location.search);
      const params = config.afParameters || {};

      const pid = urlParams.get('utm_source') || params.mediaSource?.defaultValue || "Web";
      const campaign = urlParams.get('utm_campaign') || params.campaign?.defaultValue || "";

      url += `&pid=${encodeURIComponent(pid)}`;
      if (campaign) url += `&c=${encodeURIComponent(campaign)}`;

      let deepLinkVal = params.deepLinkValue?.defaultValue || "";
      if (deepLinkVal) {
        let cleanedValue = deepLinkVal.includes('%25') ? decodeURIComponent(deepLinkVal) : deepLinkVal;
        const finalDeepLink = cleanedValue.includes('%') ? cleanedValue : encodeURIComponent(cleanedValue);
        url += "&deep_link_value=" + finalDeepLink;
      }

      url += "&is_retargeting=False&af_ss_ui=true&af_ss_gtm_ui=true&af_ss_qr=true";
      return { clickURL: url };
    },
   displayQrCode: function (container, options) {
  if (container) {
    // הוספת margin=1 עוזרת לסורקים לקרוא את הקוד טוב יותר
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${options.width}x${options.height}&data=${encodeURIComponent(options.text)}&margin=1`;
    container.innerHTML = `<img src="${qrUrl}" alt="QR Code" />`;
  }
}
  };
}

class MyElement extends HTMLElement {
  static get observedAttributes() {
    return ['display-name', 'modal-title', 'modal-subtitle', 'step-1', 'step-2', 'step-3', 'deeplink-value', 'btn-bg-color', 'btn-border-color', 'btn-text-color', 'show-arrow'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    initAppsFlyerEngine();
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }

  isMobileOrTablet() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

 handleButtonClick(e) {
    if (e) e.preventDefault(); // מניעת התנהגות דיפולטיבית

    const result = window.AF_SMART_SCRIPT.generateOneLinkURL({
      afParameters: { deepLinkValue: { defaultValue: this.getAttribute('deeplink-value') || '' } }
    });

    if (this.isMobileOrTablet()) {
      if (result?.clickURL) {
        // שימוש ב-top.location אם אנחנו בתוך iframe של Wix, או location רגיל
        (window.top || window).location.href = result.clickURL;
      }
    } else {
      this.openModal(result?.clickURL);
    }
  }

  openModal(clickURL) {
    const modal = this.shadowRoot?.querySelector('.modal-overlay');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('active'), 10);
      this.generateQRCode(clickURL);
    }
  }

  closeModal() {
    const modal = this.shadowRoot?.querySelector('.modal-overlay');
    modal?.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
  }

  generateQRCode(clickURL) {
    const qrContainer = this.shadowRoot?.getElementById('qr-container');
    if (window.AF_SMART_SCRIPT && qrContainer && clickURL) {
      window.AF_SMART_SCRIPT.displayQrCode(qrContainer, { text: clickURL, width: 220, height: 220 });
    }
  }

  render() {
    const displayName = this.getAttribute('display-name') || 'להצטרפות בחינם';
    const bgColor = this.getAttribute('btn-bg-color') || 'transparent';
    const borderColor = this.getAttribute('btn-border-color') || '#ffffff';
    const textColor = this.getAttribute('btn-text-color') || '#ffffff';
    const showArrow = this.getAttribute('show-arrow') !== 'false';

    this.shadowRoot.innerHTML = `
    <style>
      :host { display: flex; justify-content: flex-start; width: 100%; direction: rtl; box-sizing: border-box; }
      @media (max-width: 1000px) { :host { justify-content: center; } }

      .cta-button {
        background-color: ${bgColor}; 
        color: ${textColor}; 
        border: 1.5px solid ${borderColor};
        padding: 8px 30px; border-radius: 50px;
         cursor: pointer;
        font-family: Assistant, sans-serif; 
        font-size: 18px; font-weight: 600;
        display: inline-flex; align-items: center; justify-content: center;
        gap: 10px; transition: all 0.2s; direction: rtl;
      }
      .arrow { display: ${showArrow ? 'inline-block' : 'none'}; font-weight: bold; }
      
      .modal-overlay { 
        display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 30, 60, 0.7); z-index: 10000; justify-content: center; align-items: center;
        opacity: 0; transition: opacity 0.3s;
      }
      .modal-overlay.active { display: flex; opacity: 1; }
      .modal-content { 
        background: white; padding: 60px; border-radius: 24px; position: relative; width: 665px; 
        max-width: 90%; direction: rtl; font-family: Assistant, sans-serif; 
      }
      .close-btn { position: absolute; top: 20px; left: 20px; cursor: pointer; border: none; background: none; font-size: 24px; }
      .flex-container { display: flex; align-items: center; gap: 40px; }
      #qr-container { 
        width: 243px; 
        height: 243px; 
        min-width: 243px;
        display: flex; 
        align-items: center; 
        justify-content: center;
        background: white; /* רקע לבן מבטיח קריאות לסורק */
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      #qr-container img { 
        width: 100%; 
        height: 100%; 
        object-fit: contain; 
        image-rendering: pixelated;
      }
      h2 { margin: 0 0 10px 0; font-size: 32px; color: #272726; font-weight: bold; }
      .sub-text { color: #272726; font-size: 24px; margin-bottom: 20px; font-weight: 600; }
      .steps { list-style: none; padding: 0; margin: 0; }
      .steps li { font-size: 24px;font-weight: 400; margin-bottom: 12px; display: flex; gap: 12px; align-items: center; color: #272726; }
      .step-num { color: #009FF3; font-weight: 700; font-size: 36px; min-width: 30px; }
    </style>

    <button class="cta-button">
      <span>${displayName}</span>
      <span class="arrow">></span>
    </button>

    <div class="modal-overlay">
        <div class="modal-content">
          <button class="close-btn" id="close-modal">✕</button>
          <div class="flex-container">
            <div class="text-side">
              <h2>${this.getAttribute('modal-title') || ''}</h2>
              <p class="sub-text">${this.getAttribute('modal-subtitle') || ''}</p>
              <ul class="steps">
                <li><span class="step-num">1</span> ${this.getAttribute('step-1') || ''}</li>
                <li><span class="step-num">2</span> ${this.getAttribute('step-2') || ''}</li>
                <li><span class="step-num">3</span> ${this.getAttribute('step-3') || ''}</li>
              </ul>
            </div>
            <div id="qr-container"></div>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.cta-button').addEventListener('click', () => this.handleButtonClick());
    this.shadowRoot.querySelector('#close-modal')?.addEventListener('click', () => this.closeModal());
  }
}
export default MyElement;