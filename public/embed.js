(function () {
  if (window.__AI_ASSISTANT_WIDGET_LOADED__) return;
  window.__AI_ASSISTANT_WIDGET_LOADED__ = true;

  // Extract website ID from script tag attributes
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('embed.js') !== -1) {
        return scripts[i];
      }
    }
    return null;
  })();

  var websiteId = currentScript ? (currentScript.getAttribute('data-website-id') || currentScript.getAttribute('data-site-id')) : 'site_acme_123';
  if (!websiteId) websiteId = 'site_acme_123';

  // Determine API Origin
  var apiOrigin = (function () {
    if (currentScript && currentScript.src) {
      try {
        var u = new URL(currentScript.src);
        return u.origin;
      } catch (e) { }
    }
    return window.location.origin.indexOf('localhost') !== -1 ? window.location.origin : 'https://demo.flowdexx.com';
  })();

  var isOpen = false;
  var iframeCreated = false;
  var iframeContainer = null;
  var iframeEl = null;

  // Fetch initial config for primary color
  var primaryColor = '#536df4';
  fetch(apiOrigin + '/api/v1/widget/config?siteId=' + websiteId)
    .then(function (res) { return res.json(); })
    .then(function (cfg) {
      if (cfg && cfg.primaryColor) primaryColor = cfg.primaryColor;
      if (launcherBtn) launcherBtn.style.backgroundColor = primaryColor;
    })
    .catch(function () {});

  // Host container setup
  var hostElement = document.createElement('div');
  hostElement.id = 'ai-assistant-widget-root';
  hostElement.style.position = 'fixed';
  hostElement.style.zIndex = '999999';
  hostElement.style.bottom = '20px';
  hostElement.style.right = '20px';
  hostElement.style.pointerEvents = 'none';
  document.body.appendChild(hostElement);

  var shadow = hostElement.attachShadow({ mode: 'open' });

  // Add styles for launcher button & iframe container inside Shadow DOM
  var styleTag = document.createElement('style');
  styleTag.textContent = `
    *, *:before, *:after { box-sizing: border-box; margin: 0; padding: 0; }
    .widget-wrapper {
      pointer-events: none;
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .launcher-btn {
      pointer-events: auto;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${primaryColor};
      color: #ffffff;
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 0 20px rgba(83,109,244,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
    }
    .launcher-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 30px rgba(0,0,0,0.35), 0 0 30px rgba(83,109,244,0.7);
    }
    .launcher-btn svg {
      width: 28px;
      height: 28px;
    }
    .iframe-wrapper {
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 100px);
      margin-bottom: 16px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.1);
      display: none;
      pointer-events: auto;
      transition: opacity 0.25s ease;
    }
    .iframe-wrapper.open {
      display: block;
    }
    .iframe-element {
      width: 100%;
      height: 100%;
      border: none;
    }
    @media (max-width: 480px) {
      .iframe-wrapper {
        width: calc(100vw - 32px);
        height: calc(100vh - 100px);
        right: 16px;
      }
    }
  `;
  shadow.appendChild(styleTag);

  var wrapper = document.createElement('div');
  wrapper.className = 'widget-wrapper';

  iframeContainer = document.createElement('div');
  iframeContainer.className = 'iframe-wrapper';

  var launcherBtn = document.createElement('button');
  launcherBtn.className = 'launcher-btn';
  launcherBtn.title = 'Open AI Chat';
  launcherBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  `;

  wrapper.appendChild(iframeContainer);
  wrapper.appendChild(launcherBtn);
  shadow.appendChild(wrapper);

  var closeSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  var sparkSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  `;

  // Handle launcher button click
  launcherBtn.onclick = function () {
    if (!iframeCreated) {
      // Create iframe ONLY when the launcher button is clicked for the first time
      iframeEl = document.createElement('iframe');
      iframeEl.className = 'iframe-element';
      iframeEl.src = apiOrigin + '/widget-frame?siteId=' + encodeURIComponent(websiteId);
      iframeContainer.appendChild(iframeEl);
      iframeCreated = true;
    }

    isOpen = !isOpen;
    if (isOpen) {
      iframeContainer.classList.add('open');
      launcherBtn.innerHTML = closeSvg;
    } else {
      iframeContainer.classList.remove('open');
      launcherBtn.innerHTML = sparkSvg;
    }
  };

  // Listen for close postMessage from iframe
  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ai-widget-close') {
      isOpen = false;
      iframeContainer.classList.remove('open');
      launcherBtn.innerHTML = sparkSvg;
    }
  });
})();
