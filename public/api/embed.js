/**
 * AI Front Desk Embed Loader
 * Place this script on any client website (Server B).
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

  // 2. Determine Client ID
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

  // 3. Determine Base URL of the AI Front Desk installation
  var baseUrl = window.location.origin;
  if (srcUrl && srcUrl.indexOf('http') === 0) {
    try {
      var parsed = new URL(srcUrl);
      baseUrl = parsed.origin;
    } catch(e) {}
  }

  // 4. Prevent duplicate widget insertion
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

  // 6. Create the Chat Window iframe (Hidden by default)
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
  iframe.style.colorScheme = 'normal';
  iframe.allow = 'microphone; clipboard-write';
  iframe.setAttribute('allowtransparency', 'true');

  // HIDE IFRAME INITIALLY (Prevents the glassy rectangle!)
  var isOpen = false;
  iframe.style.display = 'none';
  iframe.style.opacity = '0';
  iframe.style.transform = 'translateY(12px)';
  iframe.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

  // 7. Create Native Launcher Button on Host Site
  var button = document.createElement('button');
  button.innerHTML = '💬'; // Default chat icon
  button.style.width = '60px';
  button.style.height = '60px';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = '#007bff'; // Change to match brand accent
  button.style.color = '#ffffff';
  button.style.fontSize = '24px';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
  button.style.transition = 'transform 0.2s ease, background-color 0.2s ease';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';

  // Hover animations
  button.onmouseenter = function() { button.style.transform = 'scale(1.06)'; };
  button.onmouseleave = function() { button.style.transform = 'scale(1)'; };

  // 8. Toggle Functionality
  function toggleChat(show) {
    isOpen = typeof show === 'boolean' ? show : !isOpen;
    if (isOpen) {
      iframe.style.display = 'block';
      setTimeout(function() {
        iframe.style.opacity = '1';
        iframe.style.transform = 'translateY(0)';
      }, 10);
      button.innerHTML = '✕'; // Close icon
    } else {
      iframe.style.opacity = '0';
      iframe.style.transform = 'translateY(12px)';
      setTimeout(function() {
        iframe.style.display = 'none';
      }, 250);
      button.innerHTML = '💬'; // Chat icon
    }
  }

  button.onclick = function() { toggleChat(); };

  // 9. Listen for messages from inside the iframe on Server A
  // Inside Server A, run: window.parent.postMessage({ type: 'AI_FRONTDESK_CLOSE' }, '*')
  window.addEventListener('message', function(event) {
    if (event.origin !== baseUrl) return; // Security check

    if (event.data && event.data.type === 'AI_FRONTDESK_CLOSE') {
      toggleChat(false);
    } else if (event.data && event.data.type === 'AI_FRONTDESK_OPEN') {
      toggleChat(true);
    }
  });

  // 10. Responsive Screen Sizing
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

  // 11. Mount to DOM
  container.appendChild(iframe);
  container.appendChild(button);
  document.body.appendChild(container);
})();
