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

  // Default launcher config
  var config = {
    primaryColor: '#536df4',
    position: 'bottom-right',
    launcherStyle: 'bar',
    launcherText: 'Ask AI anything...',
    launcherPlaceholder: 'Type a question...',
  };

  // Host container setup
  var hostElement = document.createElement('div');
  hostElement.id = 'ai-assistant-widget-root';
  hostElement.style.position = 'fixed';
  hostElement.style.zIndex = '999999';
  hostElement.style.pointerEvents = 'none';
  document.body.appendChild(hostElement);

  var shadow = hostElement.attachShadow({ mode: 'open' });

  // EXACT VIEWPORT CENTERING FIX
  function updateHostPosition(pos) {
    hostElement.style.top = '';
    hostElement.style.bottom = '20px';
    hostElement.style.left = '';
    hostElement.style.right = '';
    hostElement.style.transform = '';
    hostElement.style.width = 'auto';

    if (pos === 'bottom-left') {
      hostElement.style.left = '20px';
    } else if (pos === 'bottom-center') {
      hostElement.style.left = '50%';
      hostElement.style.transform = 'translateX(-50%)';
    } else {
      hostElement.style.right = '20px';
    }
  }

  function getPositionCss(pos) {
    if (pos === 'bottom-left') {
      return 'align-items: flex-start;';
    }
    if (pos === 'bottom-center') {
      return 'align-items: center;';
    }
    return 'align-items: flex-end;';
  }

  function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== 'string') return `rgba(83, 109, 244, ${alpha})`;
    var cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(function (c) { return c + c; }).join('');
    }
    if (cleanHex.length === 6) {
      var num = parseInt(cleanHex, 16);
      return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    }
    return hex;
  }

  function getStyles(cfg) {
    var primary = cfg.primaryColor || '#536df4';
    var shadowGlow = hexToRgba(primary, 0.4);
    var shadowGlowStrong = hexToRgba(primary, 0.67);
    var posCss = getPositionCss(cfg.position || 'bottom-right');

    return `
      *, *:before, *:after { box-sizing: border-box; margin: 0; padding: 0; }
      :host {
        font-family: Inter, system-ui, sans-serif;
      }
      .widget-wrapper {
        pointer-events: none;
        position: relative;
        ${posCss}
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .launcher-container {
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
      }

      /* Variant: Circle */
      .launcher-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${primary};
        color: #ffffff;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${shadowGlow};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
      }
      .launcher-circle:hover {
        transform: scale(1.08);
        box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 30px ${shadowGlowStrong};
      }
      .launcher-circle svg {
        width: 28px;
        height: 28px;
      }

      /* Variant: Pill */
      .launcher-pill {
        height: 50px;
        padding: 0 20px;
        border-radius: 25px;
        background: ${primary};
        color: #ffffff;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${shadowGlow};
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 600;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }
      .launcher-pill:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 30px ${shadowGlowStrong};
      }
      .launcher-pill svg {
        width: 20px;
        height: 20px;
      }

      /* Variant: Ask AI Input Bar */
      .launcher-bar {
        height: 52px;
        width: 320px;
        max-width: calc(100vw - 40px);
        border-radius: 26px;
        background: #0f172a;
        border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 12px 32px rgba(0,0,0,0.45), 0 0 20px ${shadowGlow};
        display: flex;
        align-items: center;
        padding: 4px 6px 4px 16px;
        gap: 8px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .launcher-bar:focus-within {
        border-color: ${primary};
        box-shadow: 0 12px 36px rgba(0,0,0,0.5), 0 0 25px ${shadowGlowStrong};
      }
      .launcher-bar svg.icon-sparkle {
        width: 20px;
        height: 20px;
        color: ${primary};
        flex-shrink: 0;
      }
      .launcher-bar input {
        flex: 1;
        background: transparent;
        border: none;
        color: #f8fafc;
        font-size: 13px;
        outline: none;
      }
      .launcher-bar input::placeholder {
        color: #94a3b8;
      }
      .launcher-bar button.bar-submit-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: ${primary};
        color: #ffffff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.15s ease;
      }
      .launcher-bar button.bar-submit-btn:hover {
        transform: scale(1.08);
      }
      .launcher-bar button.bar-submit-btn svg {
        width: 18px;
        height: 18px;
      }

      /* Variant: Tab */
      .launcher-tab {
        height: 44px;
        padding: 0 16px;
        border-radius: 12px 12px 0 0;
        background: ${primary};
        color: #ffffff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 -4px 16px rgba(0,0,0,0.25);
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
    iframeContainer.classList.add('open');
    renderLauncher();
  }

  function closeWidget() {
    isOpen = false;
    iframeContainer.classList.remove('open');
    renderLauncher();
  }

  function renderLauncher() {
    updateHostPosition(config.position || 'bottom-right');
    styleTag.textContent = getStyles(config);

    var closeSvg = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    var sparkSvg = `
      <svg class="icon-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </svg>
    `;
    var sendSvg = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    `;

    if (isOpen) {
      launcherContainer.innerHTML = `
        <button class="launcher-circle" id="btn-close-launcher">
          ${closeSvg}
        </button>
      `;
      launcherContainer.querySelector('#btn-close-launcher').onclick = closeWidget;
      return;
    }

    var styleVariant = (config.launcherStyle || 'bar').toLowerCase();

    if (styleVariant === 'pill') {
      launcherContainer.innerHTML = `
        <button class="launcher-pill" id="btn-open-launcher">
          ${sparkSvg}
          <span>${config.launcherText || 'Ask AI'}</span>
        </button>
      `;
      launcherContainer.querySelector('#btn-open-launcher').onclick = function () { openWidget(); };
    } else if (styleVariant === 'tab') {
      launcherContainer.innerHTML = `
        <button class="launcher-tab" id="btn-open-launcher">
          ${sparkSvg}
          <span>${config.launcherText || 'Need Help?'}</span>
        </button>
      `;
      launcherContainer.querySelector('#btn-open-launcher').onclick = function () { openWidget(); };
    } else if (styleVariant === 'bar') {
      launcherContainer.innerHTML = `
        <div class="launcher-bar">
          ${sparkSvg}
          <input type="text" id="bar-input-field" placeholder="${config.launcherPlaceholder || 'Ask AI anything...'}" />
          <button class="bar-submit-btn" id="btn-bar-submit">
            ${sendSvg}
          </button>
        </div>
      `;

      var inputEl = launcherContainer.querySelector('#bar-input-field');
      var submitBtn = launcherContainer.querySelector('#btn-bar-submit');

      var triggerFromBar = function () {
        var query = inputEl.value ? inputEl.value.trim() : '';
        openWidget(query);
      };

      submitBtn.onclick = triggerFromBar;
      inputEl.onkeydown = function (e) {
        if (e.key === 'Enter') triggerFromBar();
      };
    } else {
      launcherContainer.innerHTML = `
        <button class="launcher-circle" id="btn-open-launcher">
          ${sparkSvg}
        </button>
      `;
      launcherContainer.querySelector('#btn-open-launcher').onclick = function () { openWidget(); };
    }
  }

  fetch(apiOrigin + '/api/v1/widget/config?siteId=' + encodeURIComponent(websiteId) + '&t=' + Date.now())
    .then(function (res) { return res.json(); })
    .then(function (res) {
      var fetchedConfig = res && (res.data || res.config || res);
      if (fetchedConfig && typeof fetchedConfig === 'object') {
        config.primaryColor = fetchedConfig.primaryColor || fetchedConfig.primary_color || config.primaryColor;
        config.position = fetchedConfig.position || fetchedConfig.widget_position || config.position;
        config.launcherStyle = fetchedConfig.launcherStyle || fetchedConfig.launcher_style || fetchedConfig.style || config.launcherStyle;
        config.launcherText = fetchedConfig.launcherText || fetchedConfig.launcher_text || config.launcherText;
        config.launcherPlaceholder = fetchedConfig.launcherPlaceholder || fetchedConfig.launcher_placeholder || config.launcherPlaceholder;
      }
      renderLauncher();
    })
    .catch(function () {
      renderLauncher();
    });

  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ai-widget-close') {
      closeWidget();
    }
  });
})();
