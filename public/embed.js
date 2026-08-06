(function () {
  if (window.__AI_ASSISTANT_WIDGET_LOADED__) return;
  window.__AI_ASSISTANT_WIDGET_LOADED__ = true;

  // Extract website ID from script tag attributes
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && (scripts[i].src.indexOf('embed.js') !== -1 || scripts[i].src.indexOf('widget.js') !== -1)) {
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

  var config = {
    primaryColor: '#536df4',
    position: 'bottom-center',
    launcherStyle: 'bar',
    launcherPlaceholder: 'Ask me anything...',
  };

  // Host container setup inside Shadow DOM
  var hostElement = document.createElement('div');
  hostElement.id = 'ai-assistant-widget-root';
  hostElement.style.position = 'fixed';
  hostElement.style.zIndex = '999999';
  hostElement.style.pointerEvents = 'none';
  document.body.appendChild(hostElement);

  var shadow = hostElement.attachShadow({ mode: 'open' });

  // Absolute Centering & Mobile Bounds Logic
  function updateHostPosition(pos) {
    hostElement.style.top = '';
    hostElement.style.bottom = '16px';
    hostElement.style.left = '';
    hostElement.style.right = '';
    hostElement.style.transform = '';
    hostElement.style.width = 'auto';
    hostElement.style.margin = '';

    if (pos === 'bottom-left') {
      hostElement.style.left = '16px';
    } else if (pos === 'bottom-center') {
      hostElement.style.left = '0';
      hostElement.style.right = '0';
      hostElement.style.margin = '0 auto';
      hostElement.style.width = 'max-content';
    } else {
      hostElement.style.right = '16px';
    }
  }

  function getPositionCss(pos) {
    if (pos === 'bottom-left') return 'align-items: flex-start;';
    if (pos === 'bottom-center') return 'align-items: center;';
    return 'align-items: flex-end;';
  }

  function getStyles(cfg) {
    var posCss = getPositionCss(cfg.position || 'bottom-center');

    return `
      *, *:before, *:after { box-sizing: border-box; margin: 0; padding: 0; }
      :host {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .widget-wrapper {
        pointer-events: none;
        position: relative;
        ${posCss}
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        margin: 0 auto;
      }

      /* LAUNCHER CONTAINER WITH MORPH ANIMATION */
      .launcher-container {
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
        transform-origin: bottom center;
        opacity: 1;
        transform: scale(1);
      }
      .launcher-container.hidden {
        opacity: 0;
        transform: scale(0.92) translateY(10px);
        pointer-events: none;
        height: 0;
        overflow: hidden;
      }

      /* IFRAME CONTAINER WITH SMOOTH EXPAND ANIMATION */
      .iframe-wrapper {
        width: 400px;
        height: 680px;
        max-width: calc(100vw - 24px);
        max-height: calc(100vh - 40px);
        margin-bottom: 8px;
        background: transparent;
        border: none;
        pointer-events: auto;
        opacity: 0;
        transform: scale(0.95) translateY(20px);
        transform-origin: bottom center;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        display: none;
      }
      .iframe-wrapper.visible {
        display: block;
      }
      .iframe-wrapper.open {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      .iframe-element {
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
      }

      /* LAUNCHER BAR STYLING */
      .launcher-bar {
        height: 52px;
        width: 340px;
        max-width: calc(100vw - 32px);
        border-radius: 26px;
        background: #0f172a;
        border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 12px 32px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        padding: 4px 6px 4px 16px;
        gap: 8px;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
      }
      .launcher-bar:focus-within {
        border-color: rgba(255,255,255,0.3);
        box-shadow: 0 14px 36px rgba(0,0,0,0.45);
      }
      .launcher-bar input {
        flex: 1;
        background: transparent;
        border: none;
        color: #f8fafc;
        font-size: 14px;
        outline: none;
      }
      .launcher-bar input::placeholder { color: #94a3b8; }
      .launcher-bar button {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #536df4;
        color: #fff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.15s ease;
      }
      .launcher-bar button:hover { transform: scale(1.06); }

      @media (max-width: 480px) {
        .iframe-wrapper {
          width: calc(100vw - 24px);
          height: calc(100vh - 80px);
        }
      }
    `;
  }

  var styleTag = document.createElement('style');
  shadow.appendChild(styleTag);

  var wrapper = document.createElement('div');
  wrapper.className = 'widget-wrapper';

  iframeContainer = document.createElement('div');
  iframeContainer.className = 'iframe-wrapper';

  var launcherContainer = document.createElement('div');
  launcherContainer.className = 'launcher-container';

  wrapper.appendChild(iframeContainer);
  wrapper.appendChild(launcherContainer);
  shadow.appendChild(wrapper);

  function createIframe(initialQuery) {
    if (!iframeCreated) {
      iframeEl = document.createElement('iframe');
      iframeEl.className = 'iframe-element';
      iframeEl.allow = 'autoplay; camera; microphone';
      var src = apiOrigin + '/widget-frame?siteId=' + encodeURIComponent(websiteId);
      if (initialQuery) {
        src += '&initialQuery=' + encodeURIComponent(initialQuery);
      }
      iframeEl.src = src;
      iframeContainer.appendChild(iframeEl);
      iframeCreated = true;
    } else if (initialQuery && iframeEl && iframeEl.contentWindow) {
      iframeEl.contentWindow.postMessage({ type: 'ai-widget-query', query: initialQuery }, '*');
    }
  }

  function openWidget(initialQuery) {
    createIframe(initialQuery);
    isOpen = true;

    // Trigger morphing transition
    launcherContainer.classList.add('hidden');
    iframeContainer.classList.add('visible');

    requestAnimationFrame(function () {
      setTimeout(function () {
        iframeContainer.classList.add('open');
      }, 20);
    });
  }

  function closeWidget() {
    isOpen = false;

    // Trigger collapse transition
    iframeContainer.classList.remove('open');

    setTimeout(function () {
      iframeContainer.classList.remove('visible');
      launcherContainer.classList.remove('hidden');
    }, 300);
  }

  function renderLauncher() {
    updateHostPosition(config.position || 'bottom-center');
    styleTag.textContent = getStyles(config);

    if (isOpen) return;

    var sparkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#536df4" stroke-width="2" width="20" height="20"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
    var sendSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;

    launcherContainer.innerHTML = `
      <div class="launcher-bar" id="widget-launcher-bar">
        ${sparkSvg}
        <input type="text" id="bar-input-field" placeholder="${config.launcherPlaceholder || 'Ask me anything...'}" />
        <button id="btn-bar-submit">${sendSvg}</button>
      </div>
    `;

    var inputEl = launcherContainer.querySelector('#bar-input-field');
    var submitBtn = launcherContainer.querySelector('#btn-bar-submit');

    var triggerFromBar = function () {
      var query = inputEl.value ? inputEl.value.trim() : '';
      openWidget(query);
      inputEl.value = '';
    };

    submitBtn.onclick = triggerFromBar;
    inputEl.onkeydown = function (e) {
      if (e.key === 'Enter') triggerFromBar();
    };
  }

  // Fetch backend configuration
  fetch(apiOrigin + '/api/v1/widget/config?siteId=' + encodeURIComponent(websiteId) + '&t=' + Date.now())
    .then(function (res) { return res.json(); })
    .then(function (res) {
      var fetchedConfig = res && (res.data || res.config || res);
      if (fetchedConfig && typeof fetchedConfig === 'object') {
        config.position = fetchedConfig.position || config.position;
        config.launcherPlaceholder = fetchedConfig.launcherPlaceholder || config.launcherPlaceholder;
      }
      renderLauncher();
    })
    .catch(function () { renderLauncher(); });

  // Handle close postMessages from iframe
  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ai-widget-close') {
      closeWidget();
    }
  });
})();
