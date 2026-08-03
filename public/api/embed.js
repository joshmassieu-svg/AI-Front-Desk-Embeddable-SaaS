/**
 * AI Front Desk Embed Loader
 * Dynamic Dashboard-Driven Custom CSS & Launcher Generator
 */
(function() {
  // 1. Identify script tag
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

  // 2. Parse Client ID
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

  // 3. Determine Base URL of Server A
  var baseUrl = window.location.origin;
  if (srcUrl && srcUrl.indexOf('http') === 0) {
    try {
      var parsed = new URL(srcUrl);
      baseUrl = parsed.origin;
    } catch(e) {}
  }

  // 4. Prevent duplicate initialization
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
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'flex-end';

  // 6. Create Chat Window iframe (Hidden initially)
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
  iframe.style.marginBottom = '16px';
  iframe.allow = 'microphone; clipboard-write';
  iframe.setAttribute('allowtransparency', 'true');

  var isOpen = false;
  iframe.style.display = 'none';
  iframe.style.opacity = '0';
  iframe.style.transform = 'translateY(12px)';
  iframe.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

  // 7. Create Launcher Button (Default styles apply until remote CSS loads)
  var button = document.createElement('button');
  var buttonClassName = 'ai-frontdesk-launcher-' + clientId;
  button.className = buttonClassName;
  button.innerHTML = '💬';

  // Fallback inline styles
  button.style.width = '60px';
  button.style.height = '60px';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = '#007bff';
  button.style.color = '#ffffff';
  button.style.fontSize = '24px';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.transition = 'transform 0.2s ease';

  button.onmouseenter = function() { button.style.transform = 'scale(1.05)'; };
  button.onmouseleave = function() { button.style.transform = 'scale(1)'; };

  // 8. Toggle Logic
  function toggleChat(show) {
    isOpen = typeof show === 'boolean' ? show : !isOpen;
    if (isOpen) {
      iframe.style.display = 'block';
      setTimeout(function() {
        iframe.style.opacity = '1';
        iframe.style.transform = 'translateY(0)';
      }, 10);
      button.innerHTML = '✕';
    } else {
      iframe.style.opacity = '0';
      iframe.style.transform = 'translateY(12px)';
      setTimeout(function() {
        iframe.style.display = 'none';
      }, 250);
      button.innerHTML = '💬';
    }
  }

  button.onclick = function() { toggleChat(); };

  // 9. Expose Global JS SDK methods
  window.AiFrontDesk = {
    open: function() { toggleChat(true); },
    close: function() { toggleChat(false); },
    toggle: function() { toggleChat(); },
    isOpen: function() { return isOpen; }
  };

  // 10. Fetch Remote Custom CSS from Server A
  fetch(baseUrl + '/api/widget-config?clientId=' + encodeURIComponent(clientId))
    .then(function(res) { return res.json(); })
    .then(function(config) {
      if (config && config.customCss) {
        var styleEl = document.createElement('style');
        styleEl.id = 'ai-frontdesk-custom-css-' + clientId;
        styleEl.textContent = config.customCss;
        document.head.appendChild(styleEl);
      }
    })
    .catch(function(err) {
      console.warn('AI Front Desk: Using fallback launcher styles.', err);
    });

  // 11. Listen for iframe close commands from Server A
  window.addEventListener('message', function(event) {
    if (event.origin !== baseUrl) return;

    if (event.data && event.data.type === 'AI_FRONTDESK_CLOSE') {
      toggleChat(false);
    } else if (event.data && event.data.type === 'AI_FRONTDESK_OPEN') {
      toggleChat(true);
    }
  });

  // 12. Responsive Sizing
  function updateSize() {
    if (window.innerWidth < 480) {
      iframe.style.width = 'calc(100vw - 32px)';
      iframe.style.height = 'calc(100vh - 110px)';
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

  // Mount elements
  container.appendChild(iframe);
  container.appendChild(button);
  document.body.appendChild(container);
})();
