(function initializeGoogleAds(windowObject) {
  const GOOGLE_ADS_ID = 'AW-18371492048';
  const COMPLETED_ORDER_DESTINATION = 'AW-18371492048/yJOnCNeYzNwcENDxmrhE';
  const CUSTOM_PLAN_INQUIRY_DESTINATION = 'AW-18371492048/vFfeCNHFq-McENDxmrhE';
  const CONTACT_CLICK_DESTINATION = 'AW-18371492048/zO4UCJjct-McENDxmrhE';

  windowObject.dataLayer = windowObject.dataLayer || [];
  windowObject.gtag = windowObject.gtag || function gtag() {
    windowObject.dataLayer.push(arguments);
  };

  windowObject.gtag('js', new Date());
  windowObject.gtag('config', GOOGLE_ADS_ID);

  windowObject.trackGoogleAdsCompletedOrder = function trackGoogleAdsCompletedOrder(orderId, total) {
    const transactionId = String(orderId || '').trim();
    const value = Number(total);
    if (!transactionId || !Number.isFinite(value) || value < 0) return false;

    windowObject.gtag('event', 'conversion', {
      send_to: COMPLETED_ORDER_DESTINATION,
      value,
      currency: 'USD',
      transaction_id: transactionId,
    });
    return true;
  };

  windowObject.trackGoogleAdsCustomPlanInquiry = function trackGoogleAdsCustomPlanInquiry(leadId) {
    const transactionId = String(leadId || '').trim();
    if (!transactionId) return false;

    windowObject.gtag('event', 'conversion', {
      send_to: CUSTOM_PLAN_INQUIRY_DESTINATION,
      value: 0,
      currency: 'USD',
      transaction_id: transactionId,
    });
    return true;
  };

  function trackContactClickOnce(channel) {
    const normalizedChannel = channel === 'email' ? 'email' : 'sms';
    const sessionKey = `prpd_google_ads_contact_${normalizedChannel}`;
    try {
      if (windowObject.sessionStorage.getItem(sessionKey) === '1') return false;
      windowObject.sessionStorage.setItem(sessionKey, '1');
    } catch (_error) {
      // Tracking still works when storage is unavailable.
    }

    windowObject.gtag('event', 'conversion', {
      send_to: CONTACT_CLICK_DESTINATION,
      value: 0,
      currency: 'USD',
    });
    return true;
  }

  windowObject.document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = String(link.getAttribute('href') || '').toLowerCase();
    if (href.startsWith('sms:')) trackContactClickOnce('sms');
    if (href.startsWith('mailto:')) trackContactClickOnce('email');
  }, { capture: true });
}(window));
