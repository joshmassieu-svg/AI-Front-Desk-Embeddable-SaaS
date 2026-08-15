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

  var websiteId = (function () {
    if (currentScript) {
      var id = currentScript.getAttribute('data-website-id') || currentScript.getAttribute('data-site-id');
      if (id) return id;
    }
    var scripts = document.querySelectorAll('script[data-website-id], script[data-site-id]');
    if (scripts.length > 0) {
      return scripts[scripts.length - 1].getAttribute('data-website-id') || scripts[scripts.length - 1].getAttribute('data-site-id') || 'site_default';
    }
    return 'site_default';
  })();

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

  // Configuration default state
  var config = {
    primaryColor: '#536df4',
    position: 'bottom-center',
    launcherStyle: 'bar',
    launcherText: 'Ask AI',
    launcherPlaceholder: 'Ask me anything...',
    launcherPlaceholders: [
      'Ask me anything...',
      'How do I get started?',
      'What are your pricing plans?',
      'Book a live product demo...'
    ],
    placeholderEffect: 'random',
    placeholderSpeed: 3500,
    launcherAnimation: 'none',
    launcherTheme: 'solid',
    enableParticleTrail: false,
    enableLoadingWaves: false
  };

  // Host container setup inside Shadow DOM
  var hostElement = document.createElement('div');
  hostElement.id = 'ai-assistant-widget-root';
  hostElement.style.position = 'fixed';
  hostElement.style.zIndex = '999999';
  hostElement.style.pointerEvents = 'none';
  document.body.appendChild(hostElement);

  var shadow = hostElement.attachShadow({ mode: 'open' });

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
    var primary = cfg.primaryColor || '#536df4';
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

      /* LAUNCHER CONTAINER WITH TRANSITIONS */
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

      /* --- LAUNCHER VARIANTS --- */

      /* Variant: Circle */
      .launcher-circle {
        position: relative;
        overflow: hidden;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${primary};
        color: #ffffff;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${primary}66;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
      }
      .launcher-circle:hover {
        transform: scale(1.08);
        box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 30px ${primary}aa;
      }
      .launcher-circle svg { width: 28px; height: 28px; }

      /* Variant: Pill */
      .launcher-pill {
        position: relative;
        overflow: hidden;
        height: 50px;
        padding: 0 20px;
        border-radius: 25px;
        background: ${primary};
        color: #ffffff;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${primary}66;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 600;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }
      .launcher-pill:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 30px ${primary}aa;
      }
      .launcher-pill svg { width: 20px; height: 20px; }

      /* Variant: Tab */
      .launcher-tab {
        position: relative;
        overflow: hidden;
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

      /* Variant: Search Bar */
      .launcher-bar {
        position: relative;
        overflow: hidden;
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
        border-color: ${primary};
        box-shadow: 0 14px 36px rgba(0,0,0,0.45);
      }
      .launcher-bar svg.icon-sparkle { width: 20px; height: 20px; color: ${primary}; flex-shrink: 0; }
      .launcher-bar-input-wrapper {
        position: relative;
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
        overflow: hidden;
      }
      .launcher-bar input {
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        color: #94a3b8; /* Darker slate gray (darker than cbd5e1) */
        font-size: 14px;
        outline: none;
        position: relative;
        z-index: 5;
      }
      .launcher-bar input::placeholder { color: transparent; }

      .launcher-placeholder-overlay {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        pointer-events: none;
        color: #64748b; /* Slightly muted placeholder for contrast against input text */
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        z-index: 4;
        transition: opacity 0.2s ease;
      }
      .launcher-placeholder-overlay.hidden {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* Placeholder Animation Effects */
      .ph-caret {
        display: inline-block;
        width: 2px;
        height: 14px;
        background: ${primary};
        margin-left: 2px;
        vertical-align: middle;
        animation: ph-caret-blink 0.8s infinite;
      }
      @keyframes ph-caret-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      /* Dissolve Effect */
      .ph-effect-dissolve-out { animation: ph-dissolve-out 0.4s forwards ease-in-out; }
      .ph-effect-dissolve-in { animation: ph-dissolve-in 0.4s forwards ease-in-out; }
      @keyframes ph-dissolve-out {
        0% { opacity: 1; filter: blur(0px); transform: scale(1); }
        100% { opacity: 0; filter: blur(6px); transform: scale(0.95); }
      }
      @keyframes ph-dissolve-in {
        0% { opacity: 0; filter: blur(6px); transform: scale(1.05); }
        100% { opacity: 1; filter: blur(0px); transform: scale(1); }
      }

      /* Break Apart Effect (OUT and IN phases) */
      .ph-break-char {
        display: inline-block;
        transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease, filter 0.4s ease;
        will-change: transform, opacity, filter;
      }
      .ph-break-char.scattered {
        opacity: 0 !important;
        filter: blur(8px) !important;
      }

      /* Linear Clip Mask Effect */
      .ph-effect-clip-out { animation: ph-clip-out 0.45s forwards ease-in-out; }
      .ph-effect-clip-in { animation: ph-clip-in 0.45s forwards ease-in-out; }
      @keyframes ph-clip-out {
        0% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); opacity: 1; }
        100% { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); opacity: 0; }
      }
      @keyframes ph-clip-in {
        0% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); opacity: 0; }
        100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); opacity: 1; }
      }

      /* Micro Vertical Slide Effect */
      .ph-effect-slide-out { animation: ph-slide-out 0.35s forwards cubic-bezier(0.4, 0, 0.2, 1); }
      .ph-effect-slide-in { animation: ph-slide-in 0.35s forwards cubic-bezier(0.4, 0, 0.2, 1); }
      @keyframes ph-slide-out {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-100%); opacity: 0; }
      }
      @keyframes ph-slide-in {
        0% { transform: translateY(100%); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      .launcher-bar button.bar-submit-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: ${primary};
        color: #fff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.15s ease;
      }
      .launcher-bar button.bar-submit-btn:hover { transform: scale(1.06); }

      /* --- ADVANCED THEMES & ANIMATIONS --- */
      .launcher-bar input, .launcher-bar button, .launcher-bar svg,
      .launcher-pill span, .launcher-pill svg, .launcher-tab span, .launcher-tab svg, .launcher-circle svg {
        position: relative;
        z-index: 2;
      }

      .launcher-theme-cosmic { background: linear-gradient(135deg, #6366f1, #d946ef) !important; --glow-color: #d946ef; border: none !important; }
      .launcher-theme-sunset { background: linear-gradient(135deg, #f97316, #ec4899) !important; --glow-color: #ec4899; border: none !important; }
      .launcher-theme-ocean { background: linear-gradient(135deg, #14b8a6, #3b82f6) !important; --glow-color: #3b82f6; border: none !important; }
      .launcher-theme-rainbow {
        background: linear-gradient(120deg, #ff007f, #7f00ff, #00f0ff, #ff007f) !important;
        background-size: 300% 300% !important;
        animation: rainbow-gradient 4s ease infinite !important;
        --glow-color: #7f00ff; border: none !important;
      }
      .launcher-theme-glass {
        background: rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        --glow-color: rgba(255, 255, 255, 0.4); color: #ffffff !important;
      }
      @keyframes rainbow-gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .launcher-bar.launcher-theme-cosmic { border-color: #6366f1 !important; background: #0b0d19 !important; }
      .launcher-bar.launcher-theme-cosmic .bar-submit-btn { background: linear-gradient(135deg, #6366f1, #d946ef) !important; }
      .launcher-bar.launcher-theme-cosmic svg.icon-sparkle { color: #d946ef !important; }

      .launcher-animation-wrap { display: flex; align-items: center; justify-content: center; }
      .launcher-anim-pulse { animation: launcher-pulse 2s infinite ease-in-out; }
      .launcher-anim-glow { border-radius: 9999px; animation: launcher-glow 2s infinite ease-in-out; }
      .launcher-anim-bounce { animation: launcher-bounce 2s infinite ease-in-out; }
      .launcher-anim-float { animation: launcher-float 4s infinite ease-in-out; }

      @keyframes launcher-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
      @keyframes launcher-glow {
        0%, 100% { box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 8px var(--glow-color, ${primary})44; }
        50% { box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 20px var(--glow-color, ${primary})aa; }
      }
      @keyframes launcher-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes launcher-float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(1deg); } }

      /* Waves Background */
      .launcher-waves {
        position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
        overflow: hidden; border-radius: inherit; pointer-events: none; z-index: 1; opacity: 0.35;
      }
      .launcher-waves svg { position: absolute; bottom: 0; left: 0; width: 200%; height: 100%; }
      .wave1 { animation: wave-move 8s linear infinite; fill: rgba(255, 255, 255, 0.3); }
      .wave2 { animation: wave-move 4s linear infinite; fill: rgba(255, 255, 255, 0.4); }
      @keyframes wave-move { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

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
      iframeEl.contentWindow.postMessage({ type: 'ai-widget-query', query: initialQuery }, apiOrigin);
    }
  }

  function openWidget(initialQuery) {
    createIframe(initialQuery);
    isOpen = true;

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

    iframeContainer.classList.remove('open');

    setTimeout(function () {
      iframeContainer.classList.remove('visible');
      launcherContainer.classList.remove('hidden');
    }, 300);
  }

  // Particle Trail Engine
  var particleCanvas = null;
  var particleCtx = null;
  var particles = [];
  var animationFrameId = null;

  function initParticleTrail(launcherEl) {
    if (particleCanvas) {
      if (particleCanvas.parentNode) particleCanvas.parentNode.removeChild(particleCanvas);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      particles = [];
    }

    particleCanvas = document.createElement('canvas');
    particleCanvas.style.position = 'absolute';
    particleCanvas.style.top = '-50px';
    particleCanvas.style.left = '-50px';
    particleCanvas.style.width = 'calc(100% + 100px)';
    particleCanvas.style.height = 'calc(100% + 100px)';
    particleCanvas.style.pointerEvents = 'none';
    particleCanvas.style.zIndex = '3';
    launcherEl.style.position = 'relative';
    launcherEl.appendChild(particleCanvas);

    var rect = launcherEl.getBoundingClientRect();
    particleCanvas.width = rect.width + 100;
    particleCanvas.height = rect.height + 100;

    particleCtx = particleCanvas.getContext('2d');

    function spawnParticle(x, y) {
      var colors = ['#ffffff'];
      if (config.launcherTheme === 'cosmic') colors.push('#6366f1', '#d946ef');
      else if (config.launcherTheme === 'sunset') colors.push('#f97316', '#ec4899');
      else if (config.launcherTheme === 'ocean') colors.push('#14b8a6', '#3b82f6');
      else if (config.launcherTheme === 'rainbow') colors.push('#ff007f', '#7f00ff', '#00f0ff');
      else colors.push(config.primaryColor || '#536df4');

      particles.push({
        x: x + 50,
        y: y + 50,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.6,
        size: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    launcherEl.onmousemove = function (e) {
      var r = launcherEl.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      if (Math.random() < 0.3) spawnParticle(x, y);
    };

    var lastSpawn = 0;
    function update(timestamp) {
      if (!particleCanvas || !particleCtx) return;
      particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

      if (timestamp - lastSpawn > 250) {
        var r = launcherEl.getBoundingClientRect();
        if (particleCanvas.width !== r.width + 100 || particleCanvas.height !== r.height + 100) {
          particleCanvas.width = r.width + 100;
          particleCanvas.height = r.height + 100;
        }
        spawnParticle(Math.random() * r.width, Math.random() * r.height);
        lastSpawn = timestamp;
      }

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        particleCtx.save();
        particleCtx.globalAlpha = p.alpha;
        var grad = particleCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, 'transparent');
        particleCtx.fillStyle = grad;
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        particleCtx.fill();
        particleCtx.restore();
      }
      animationFrameId = requestAnimationFrame(update);
    }
    animationFrameId = requestAnimationFrame(update);
  }

  // Rotating Input Placeholder Engine
  var currentRotationTimer = null;
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function initPlaceholderRotation(containerEl) {
    if (currentRotationTimer) {
      clearTimeout(currentRotationTimer);
      currentRotationTimer = null;
    }

    var inputEl = containerEl.querySelector('#bar-input-field');
    var overlayEl = containerEl.querySelector('#placeholder-overlay');
    if (!inputEl || !overlayEl) return;

    var placeholders = (config.launcherPlaceholders && config.launcherPlaceholders.length > 0)
      ? config.launcherPlaceholders
      : [config.launcherPlaceholder || 'Ask me anything...'];

    var effect = config.placeholderEffect || 'random';
    var speed = config.placeholderSpeed || 3500;

    if (placeholders.length === 0) return;

    var currentIndex = 0;
    var allEffects = ['typewriter', 'dissolve', 'break', 'clip', 'vertical-slide'];

    function getNextEffect() {
      if (effect === 'random') {
        var randIdx = Math.floor(Math.random() * allEffects.length);
        return allEffects[randIdx];
      }
      return effect;
    }

    // Initial text display
    overlayEl.innerHTML = escapeHtml(placeholders[0]);

    // Input interaction handlers
    inputEl.onfocus = function () {
      overlayEl.classList.add('hidden');
    };
    inputEl.onblur = function () {
      if (!inputEl.value.trim()) {
        overlayEl.classList.remove('hidden');
      }
    };
    inputEl.oninput = function () {
      if (inputEl.value.length > 0) {
        overlayEl.classList.add('hidden');
      } else {
        overlayEl.classList.remove('hidden');
      }
    };

    if (effect === 'none' || placeholders.length === 1) {
      return;
    }

    function rotateNext() {
      if (inputEl.value.length > 0 || document.activeElement === inputEl) {
        currentRotationTimer = setTimeout(rotateNext, 1000);
        return;
      }

      var nextIdx = (currentIndex + 1) % placeholders.length;
      var activeEffect = getNextEffect();
      var targetText = placeholders[nextIdx];

      if (activeEffect === 'typewriter') {
        var currText = placeholders[currentIndex];
        var charIdx = currText.length;
        function typeDelete() {
          if (charIdx > 0) {
            charIdx--;
            overlayEl.innerHTML = escapeHtml(currText.substring(0, charIdx)) + '<span class="ph-caret"></span>';
            currentRotationTimer = setTimeout(typeDelete, 30);
          } else {
            var addIdx = 0;
            function typeAdd() {
              if (addIdx <= targetText.length) {
                overlayEl.innerHTML = escapeHtml(targetText.substring(0, addIdx)) + '<span class="ph-caret"></span>';
                addIdx++;
                currentRotationTimer = setTimeout(typeAdd, 45);
              } else {
                currentIndex = nextIdx;
                setTimeout(function () {
                  overlayEl.innerHTML = escapeHtml(targetText);
                }, 400);
                currentRotationTimer = setTimeout(rotateNext, speed);
              }
            }
            typeAdd();
          }
        }
        typeDelete();
      } else if (activeEffect === 'dissolve') {
        overlayEl.className = 'launcher-placeholder-overlay ph-effect-dissolve-out';
        currentRotationTimer = setTimeout(function () {
          currentIndex = nextIdx;
          overlayEl.innerHTML = escapeHtml(targetText);
          overlayEl.className = 'launcher-placeholder-overlay ph-effect-dissolve-in';
          currentRotationTimer = setTimeout(function () {
            overlayEl.className = 'launcher-placeholder-overlay';
            currentRotationTimer = setTimeout(rotateNext, speed);
          }, 400);
        }, 400);
      } else if (activeEffect === 'break') {
        // --- PHASE 1: OUT (Explode / Scatter current text outward) ---
        var currStr = placeholders[currentIndex];
        var outHtml = '';
        for (var i = 0; i < currStr.length; i++) {
          var ch = currStr[i] === ' ' ? '&nbsp;' : escapeHtml(currStr[i]);
          outHtml += '<span class="ph-break-char">' + ch + '</span>';
        }
        overlayEl.innerHTML = outHtml;
        void overlayEl.offsetHeight; // force reflow

        var outSpans = overlayEl.querySelectorAll('.ph-break-char');
        outSpans.forEach(function (span) {
          var rx = (Math.random() - 0.5) * 120;
          var ry = (Math.random() - 0.5) * 80 - 20;
          var rdeg = (Math.random() - 0.5) * 180;
          var rscale = 0.5 + Math.random() * 0.8;
          span.style.transform = 'translate(' + rx + 'px, ' + ry + 'px) rotate(' + rdeg + 'deg) scale(' + rscale + ')';
          span.classList.add('scattered');
        });

        // --- PHASE 2: IN (Fly in & Converge target text inward) ---
        currentRotationTimer = setTimeout(function () {
          currentIndex = nextIdx;
          var inHtml = '';
          for (var j = 0; j < targetText.length; j++) {
            var ch = targetText[j] === ' ' ? '&nbsp;' : escapeHtml(targetText[j]);
            var rx = (Math.random() - 0.5) * 120;
            var ry = (Math.random() - 0.5) * 80 + 20;
            var rdeg = (Math.random() - 0.5) * 180;
            var rscale = 0.5 + Math.random() * 0.8;
            inHtml += '<span class="ph-break-char scattered" style="transform: translate(' + rx + 'px, ' + ry + 'px) rotate(' + rdeg + 'deg) scale(' + rscale + ');">' + ch + '</span>';
          }
          overlayEl.innerHTML = inHtml;
          void overlayEl.offsetHeight; // force reflow

          requestAnimationFrame(function () {
            setTimeout(function () {
              var inSpans = overlayEl.querySelectorAll('.ph-break-char');
              inSpans.forEach(function (span) {
                span.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
                span.classList.remove('scattered');
              });
              currentRotationTimer = setTimeout(function () {
                overlayEl.innerHTML = escapeHtml(targetText);
                currentRotationTimer = setTimeout(rotateNext, speed);
              }, 450);
            }, 30);
          });
        }, 400);
      } else if (activeEffect === 'clip') {
        overlayEl.className = 'launcher-placeholder-overlay ph-effect-clip-out';
        currentRotationTimer = setTimeout(function () {
          currentIndex = nextIdx;
          overlayEl.innerHTML = escapeHtml(targetText);
          overlayEl.className = 'launcher-placeholder-overlay ph-effect-clip-in';
          currentRotationTimer = setTimeout(function () {
            overlayEl.className = 'launcher-placeholder-overlay';
            currentRotationTimer = setTimeout(rotateNext, speed);
          }, 450);
        }, 450);
      } else if (activeEffect === 'vertical-slide') {
        overlayEl.className = 'launcher-placeholder-overlay ph-effect-slide-out';
        currentRotationTimer = setTimeout(function () {
          currentIndex = nextIdx;
          overlayEl.innerHTML = escapeHtml(targetText);
          overlayEl.className = 'launcher-placeholder-overlay ph-effect-slide-in';
          currentRotationTimer = setTimeout(function () {
            overlayEl.className = 'launcher-placeholder-overlay';
            currentRotationTimer = setTimeout(rotateNext, speed);
          }, 350);
        }, 350);
      }
    }

    currentRotationTimer = setTimeout(rotateNext, speed);
  }

  function renderLauncher() {
    updateHostPosition(config.position || 'bottom-center');
    styleTag.textContent = getStyles(config);

    if (isOpen) return;

    var sparkSvg = `<svg class="icon-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
    var sendSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;

    var styleVariant = config.launcherStyle || 'bar';
    var themeClass = 'launcher-theme-' + (config.launcherTheme || 'solid');
    var animClass = 'launcher-anim-' + (config.launcherAnimation || 'none');

    var wavesHtml = config.enableLoadingWaves ? `
      <div class="launcher-waves">
        <svg viewBox="0 0 120 28" preserveAspectRatio="none">
          <path d="M0 15 Q 30 0, 60 15 T 120 15 L 120 28 L 0 28 Z" class="wave1" />
          <path d="M0 18 Q 30 5, 60 18 T 120 18 L 120 28 L 0 28 Z" class="wave2" />
        </svg>
      </div>
    ` : '';

    var wrapStart = '<div class="launcher-animation-wrap ' + animClass + '">';
    var wrapEnd = '</div>';

    if (styleVariant === 'pill') {
      launcherContainer.innerHTML = wrapStart + `
        <button class="launcher-pill ${themeClass}" id="btn-open-launcher">
          ${wavesHtml}
          ${sparkSvg}
          <span>${config.launcherText || 'Ask AI'}</span>
        </button>
      ` + wrapEnd;
      launcherContainer.querySelector('#btn-open-launcher').onclick = function () { openWidget(); };
    } else if (styleVariant === 'tab') {
      launcherContainer.innerHTML = wrapStart + `
        <button class="launcher-tab ${themeClass}" id="btn-open-launcher">
          ${wavesHtml}
          ${sparkSvg}
          <span>${config.launcherText || 'Need Help?'}</span>
        </button>
      ` + wrapEnd;
      launcherContainer.querySelector('#btn-open-launcher').onclick = function () { openWidget(); };
    } else if (styleVariant === 'circle') {
      launcherContainer.innerHTML = wrapStart + `
        <button class="launcher-circle ${themeClass}" id="btn-open-launcher">
          ${wavesHtml}
          ${sparkSvg}
        </button>
      ` + wrapEnd;
      launcherContainer.querySelector('#btn-open-launcher').onclick = function () { openWidget(); };
    } else {
      // Default: Bar
      launcherContainer.innerHTML = wrapStart + `
        <div class="launcher-bar ${themeClass}" id="btn-open-launcher-bar">
          ${wavesHtml}
          ${sparkSvg}
          <div class="launcher-bar-input-wrapper">
            <input type="text" id="bar-input-field" placeholder="" />
            <div class="launcher-placeholder-overlay" id="placeholder-overlay"></div>
          </div>
          <button class="bar-submit-btn" id="btn-bar-submit">${sendSvg}</button>
        </div>
      ` + wrapEnd;

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

      initPlaceholderRotation(launcherContainer);
    }

    if (config.enableParticleTrail) {
      var launcherEl = launcherContainer.querySelector('#btn-open-launcher') || launcherContainer.querySelector('#btn-open-launcher-bar');
      if (launcherEl) {
        initParticleTrail(launcherEl);
      }
    }
  }

  // Fetch backend configuration with timeout and error handling
  var hasRendered = false;
  function safeRenderLauncher() {
    if (!hasRendered) {
      hasRendered = true;
      if (timeoutId) clearTimeout(timeoutId);
      renderLauncher();
    }
  }

  var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timeoutId = setTimeout(function () {
    if (controller) controller.abort();
    console.warn('[AI Widget] Config fetch timed out after 5s; falling back to default config.');
    safeRenderLauncher();
  }, 5000);

  var fetchOptions = controller ? { signal: controller.signal } : {};
  var configUrl = apiOrigin + '/api/v1/widget/config?siteId=' + encodeURIComponent(websiteId) + '&t=' + Date.now();

  function fetchConfig(isRetry) {
    fetch(configUrl, fetchOptions)
      .then(function (res) {
        if (!res.ok) {
          var err = new Error('HTTP error ' + res.status + ' (' + res.statusText + ')');
          (err).status = res.status;
          throw err;
        }
        return res.json();
      })
      .then(function (res) {
        var fetchedConfig = res && (res.data || res.config || res);
        if (fetchedConfig && typeof fetchedConfig === 'object' && !fetchedConfig.error) {
          config = Object.assign(config, fetchedConfig);
        }
        safeRenderLauncher();
      })
      .catch(function (err) {
        if (!isRetry && err && err.status === 503) {
          console.warn('[AI Widget] Config temporarily unavailable, retrying once...');
          setTimeout(function () { fetchConfig(true); }, 800);
          return;
        }
        console.warn('[AI Widget] Failed to fetch custom configuration:', err.message || err);
        safeRenderLauncher();
      });
  }

  fetchConfig(false);

  // Handle postMessages sent from iframe
  window.addEventListener('message', function (event) {
    if (event.origin !== apiOrigin) return; // Origin validation check
    if (event.data && event.data.type === 'ai-widget-close') {
      closeWidget();
    }
  });
})();