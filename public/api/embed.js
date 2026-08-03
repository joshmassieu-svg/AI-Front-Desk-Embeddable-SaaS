/**
 * AI Front Desk Embed Widget - Universal Standalone Javascript Loader
 * Works seamlessly across Static CDN hosting (Vercel, Netlify, Cloudflare Pages, Nginx),
 * Serverless Functions, and Node/Express servers.
 */
(function() {
  // 1. Identify the current script tag that loaded this file
  var scriptEl = document.currentScript;
  if (!scriptEl) {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      var s = scripts[i];
      if (s.src && (s.src.indexOf('embed.js') !== -1 || s.getAttribute('data-client-id'))) {
        scriptEl = s;
        break;
      }
    }
  }

  // 2. Determine Client ID from ?client=ID, ?clientId=ID, or data-client-id attribute
  var clientId = 'cl_apex_dental';
  var srcUrl = (scriptEl && scriptEl.src) || '';
  if (scriptEl && scriptEl.getAttribute('data-client-id')) {
    clientId = scriptEl.getAttribute('data-client-id');
  } else if (srcUrl && srcUrl.indexOf('?') !== -1) {
    try {
      var params = new URLSearchParams(srcUrl.split('?')[1]);
      if (params.get('client')) clientId = params.get('client');
      else if (params.get('clientId')) clientId = params.get('clientId');
    } catch(e) {}
  }

  // 3. Determine Base URL of the AI Front Desk installation automatically
  var baseUrl = window.location.origin;
  if (srcUrl && srcUrl.indexOf('http') === 0) {
    try {
      var parsed = new URL(srcUrl);
      baseUrl = parsed.origin;
    } catch(e) {}
  }

  // 4. Prevent duplicate widget insertion on the same page
  var containerId = 'ai-frontdesk-container-' + clientId;
  if (document.getElementById(containerId)) return;

  // 5. Create container element
  var container = document.createElement('div');
  container.id = containerId;
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '999999';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  // 6. Create iframe widget insulated from host website styling
  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/?embed=true&clientId=' + encodeURIComponent(clientId);
  iframe.style.border = 'none';
  iframe.style.background = 'transparent';
  iframe.style.width = '400px';
  iframe.style.height = '640px';
  iframe.style.maxHeight = '90vh';
  iframe.style.maxWidth = '95vw';
  iframe.style.borderRadius = '20px';
  iframe.style.boxShadow = '0 20px 40px rgba(0,0,0,0.18)';
  iframe.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  iframe.style.colorScheme = 'normal';
  iframe.allow = 'microphone; clipboard-write';

  // 7. Responsive mobile screen sizing
  function updateSize() {
    if (window.innerWidth < 480) {
      iframe.style.width = 'calc(100vw - 32px)';
      iframe.style.height = 'calc(100vh - 120px)';
      container.style.bottom = '16px';
      container.style.right = '16px';
    } else {
      iframe.style.width = '400px';
      iframe.style.height = '640px';
      container.style.bottom = '24px';
      container.style.right = '24px';
    }
  }
  window.addEventListener('resize', updateSize);
  updateSize();

  container.appendChild(iframe);
  document.body.appendChild(container);
})();
