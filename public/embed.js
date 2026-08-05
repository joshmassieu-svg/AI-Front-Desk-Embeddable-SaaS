(function () {
  if (window.__AI_ASSISTANT_WIDGET_LOADED__) return;
  window.__AI_ASSISTANT_WIDGET_LOADED__ = true;

  // Extract website ID from script tag attributes or global variable
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('widget.js') !== -1) {
        return scripts[i];
      }
    }
    return null;
  })();

  var websiteId = currentScript ? (currentScript.getAttribute('data-website-id') || currentScript.getAttribute('data-site-id')) : 'site_acme_123';
  if (!websiteId) websiteId = 'site_acme_123';

  // Production snippet domain: demo.flowdexx.com
  var apiOrigin = (function() {
    if (currentScript && currentScript.src) {
      try {
        var u = new URL(currentScript.src);
        return u.origin;
      } catch (e) {}
    }
    return window.location.origin.indexOf('localhost') !== -1 ? window.location.origin : 'https://demo.flowdexx.com';
  })();

  // State
  var isOpen = false;
  var config = null;
  var visitorId = localStorage.getItem('ai_widget_visitor_id');
  if (!visitorId) {
    visitorId = 'vis_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('ai_widget_visitor_id', visitorId);
  }

  var conversationId = localStorage.getItem('ai_widget_conv_id_' + websiteId);
  var messages = [];
  var isTyping = false;
  var isLeadFormSubmitted = localStorage.getItem('ai_widget_lead_done_' + websiteId) === 'true';
  var currentStatus = 'ai'; // 'ai' | 'human_requested' | 'human_active'

  // Host container setup
  var hostElement = document.createElement('div');
  hostElement.id = 'ai-assistant-widget-root';
  hostElement.style.position = 'fixed';
  hostElement.style.zIndex = '999999';
  hostElement.style.bottom = '20px';
  hostElement.style.right = '20px';
  hostElement.style.pointerEvents = 'none';
  document.body.appendChild(hostElement);

  // Attach Shadow DOM for 100% style isolation
  var shadow = hostElement.attachShadow({ mode: 'open' });

  // Stylesheet template
  function getStyles(cfg) {
    var primary = cfg ? cfg.primaryColor : '#536df4';
    var isDark = cfg ? (cfg.theme === 'dark' || (cfg.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) : true;
    var bg = isDark ? '#0f172a' : '#ffffff';
    var surface = isDark ? '#1e293b' : '#f8fafc';
    var text = isDark ? '#f8fafc' : '#0f172a';
    var textMuted = isDark ? '#94a3b8' : '#64748b';
    var border = isDark ? '#334155' : '#e2e8f0';
    var radius = (cfg ? cfg.borderRadius : 16) + 'px';
    var isLeft = cfg && cfg.position === 'bottom-left';

    return `
      :host {
        font-family: ${cfg && cfg.fontFamily ? cfg.fontFamily : 'Inter, system-ui, sans-serif'};
        color-scheme: ${isDark ? 'dark' : 'light'};
        box-sizing: border-box;
      }
      *, *:before, *:after { box-sizing: border-box; margin: 0; padding: 0; }

      .widget-wrapper {
        pointer-events: none;
        position: fixed;
        bottom: 20px;
        ${isLeft ? 'left: 20px;' : 'right: 20px;'}
        display: flex;
        flex-direction: column;
        align-items: ${isLeft ? 'flex-start' : 'flex-end'};
      }

      .launcher-btn {
        pointer-events: auto;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${primary};
        color: #ffffff;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 0 20px ${primary}66;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
        position: relative;
      }
      .launcher-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 12px 30px rgba(0,0,0,0.35), 0 0 30px ${primary}aa;
      }
      .launcher-btn svg {
        width: 28px;
        height: 28px;
        transition: transform 0.3s ease;
      }

      .badge-dot {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 14px;
        height: 14px;
        background: #10b981;
        border: 2px solid ${bg};
        border-radius: 50%;
      }

      .chat-window {
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 100px);
        background: ${bg};
        color: ${text};
        border: 1px solid ${border};
        border-radius: ${radius};
        box-shadow: 0 20px 40px rgba(0,0,0,0.35);
        display: flex;
        flex-direction: column;
        margin-bottom: 16px;
        overflow: hidden;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .chat-window.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .chat-header {
        background: ${surface};
        padding: 14px 16px;
        border-bottom: 1px solid ${border};
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .bot-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .bot-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid ${primary};
      }

      .bot-details h4 {
        font-size: 15px;
        font-weight: 600;
        color: ${text};
        line-height: 1.2;
      }

      .bot-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: ${textMuted};
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .icon-btn {
        background: transparent;
        border: none;
        color: ${textMuted};
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .icon-btn:hover {
        background: ${border};
        color: ${text};
      }

      .chat-body {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: ${bg};
      }

      .msg {
        display: flex;
        flex-direction: column;
        max-width: 85%;
        animation: fadeIn 0.2s ease forwards;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .msg.visitor {
        align-self: flex-end;
      }

      .msg.ai, .msg.agent {
        align-self: flex-start;
      }

      .msg-bubble {
        padding: 12px 14px;
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
      }

      .msg.visitor .msg-bubble {
        background: ${primary};
        color: #ffffff;
        border-bottom-right-radius: 4px;
      }

      .msg.ai .msg-bubble, .msg.agent .msg-bubble {
        background: ${surface};
        color: ${text};
        border: 1px solid ${border};
        border-bottom-left-radius: 4px;
      }

      .msg-sender {
        font-size: 11px;
        color: ${textMuted};
        margin-bottom: 4px;
        font-weight: 500;
      }

      .sources-container {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed ${border};
        font-size: 12px;
        color: ${textMuted};
      }

      .source-pill {
        display: inline-block;
        background: ${border};
        color: ${text};
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        margin-right: 4px;
        margin-top: 4px;
        text-decoration: none;
      }

      .suggested-questions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }

      .suggested-btn {
        background: ${surface};
        border: 1px solid ${primary}66;
        color: ${primary};
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
      }
      .suggested-btn:hover {
        background: ${primary};
        color: #ffffff;
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 10px 14px;
        background: ${surface};
        border: 1px solid ${border};
        border-radius: 14px;
        border-bottom-left-radius: 4px;
        width: fit-content;
      }

      .typing-dot {
        width: 6px;
        height: 6px;
        background: ${textMuted};
        border-radius: 50%;
        animation: typingBounce 1.2s infinite ease-in-out;
      }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes typingBounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-6px); }
      }

      .lead-card {
        background: ${surface};
        border: 1px solid ${primary}44;
        border-radius: 12px;
        padding: 14px;
        margin-top: 8px;
      }

      .lead-card h5 {
        font-size: 13px;
        font-weight: 600;
        color: ${text};
        margin-bottom: 8px;
      }

      .lead-input {
        width: 100%;
        padding: 8px 10px;
        background: ${bg};
        border: 1px solid ${border};
        border-radius: 6px;
        color: ${text};
        font-size: 13px;
        margin-bottom: 8px;
      }
      .lead-input:focus {
        outline: none;
        border-color: ${primary};
      }

      .lead-submit-btn {
        width: 100%;
        padding: 8px;
        background: ${primary};
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s ease;
      }
      .lead-submit-btn:hover { opacity: 0.9; }

      .chat-footer {
        padding: 12px;
        background: ${surface};
        border-top: 1px solid ${border};
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .chat-input {
        flex: 1;
        padding: 10px 12px;
        background: ${bg};
        border: 1px solid ${border};
        border-radius: 20px;
        color: ${text};
        font-size: 14px;
      }
      .chat-input:focus {
        outline: none;
        border-color: ${primary};
      }

      .send-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${primary};
        color: #ffffff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s ease;
      }
      .send-btn:hover { transform: scale(1.05); }

      .branding-footer {
        text-align: center;
        padding: 4px;
        font-size: 10px;
        color: ${textMuted};
        background: ${surface};
      }
      .branding-footer a {
        color: ${primary};
        text-decoration: none;
        font-weight: 500;
      }

      /* Mobile Responsive Override */
      @media (max-width: 480px) {
        .chat-window {
          width: calc(100vw - 20px);
          height: calc(100vh - 80px);
          position: fixed;
          bottom: 10px;
          right: 10px;
          left: 10px;
          border-radius: 16px;
        }
      }
    `;
  }

  // Render Widget UI
  function render() {
    if (!config) return;

    var styleTag = shadow.querySelector('style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      shadow.appendChild(styleTag);
    }
    styleTag.textContent = getStyles(config);

    var wrapper = shadow.querySelector('.widget-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'widget-wrapper';
      shadow.appendChild(wrapper);
    }

    var launcherIconSvg = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    if (config.launcherIcon === 'sparkles') {
      launcherIconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
      `;
    }

    var closeIconSvg = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    var html = `
      <div class="chat-window ${isOpen ? 'open' : ''}">
        <div class="chat-header">
          <div class="bot-info">
            <img class="bot-avatar" src="${config.botAvatar}" alt="${config.botName}" />
            <div class="bot-details">
              <h4>${config.botName}</h4>
              <div class="bot-status">
                <span class="status-dot"></span>
                <span>${currentStatus === 'human_active' ? 'Live Support Agent' : 'AI Online'}</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button class="icon-btn" id="btn-clear" title="Clear Chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            <button class="icon-btn" id="btn-close-header">
              ${closeIconSvg}
            </button>
          </div>
        </div>

        <div class="chat-body" id="chat-messages-container">
          <!-- Messages will be injected here -->
        </div>

        <div class="chat-footer">
          <input type="text" class="chat-input" id="chat-input-field" placeholder="Ask a question..." />
          <button class="send-btn" id="btn-send-msg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>

        <div class="branding-footer">
          Powered by <a href="https://demo.flowdexx.com" target="_blank">FlowDexx AI</a>
        </div>
      </div>

      <button class="launcher-btn" id="btn-toggle-launcher">
        <span class="badge-dot"></span>
        ${isOpen ? closeIconSvg : launcherIconSvg}
      </button>
    `;

    wrapper.innerHTML = html;

    // Attach event listeners
    shadow.querySelector('#btn-toggle-launcher').onclick = toggleOpen;
    shadow.querySelector('#btn-close-header').onclick = toggleOpen;
    shadow.querySelector('#btn-clear').onclick = clearChat;

    var inputEl = shadow.querySelector('#chat-input-field');
    var sendBtn = shadow.querySelector('#btn-send-msg');

    sendBtn.onclick = function () {
      handleSend(inputEl.value);
    };

    inputEl.onkeydown = function (e) {
      if (e.key === 'Enter') {
        handleSend(inputEl.value);
      }
    };

    updateMessagesUI();
  }

  function toggleOpen() {
    isOpen = !isOpen;
    render();
  }

  function clearChat() {
    messages = [];
    if (config) {
      messages.push({
        id: 'welcome',
        sender: 'ai',
        content: config.welcomeMessage,
        createdAt: new Date().toISOString()
      });
    }
    updateMessagesUI();
  }

  function updateMessagesUI() {
    var container = shadow.querySelector('#chat-messages-container');
    if (!container) return;

    var html = '';

    messages.forEach(function (msg) {
      var isVisitor = msg.sender === 'visitor';
      var formattedContent = formatMarkdown(msg.content);

      html += `
        <div class="msg ${msg.sender}">
          ${msg.sender === 'agent' ? `<span class="msg-sender">👨‍💼 Support Agent (${msg.agentName || 'Agent'})</span>` : ''}
          <div class="msg-bubble">${formattedContent}</div>
          ${msg.sources && msg.sources.length ? `
            <div class="sources-container">
              Sources:
              ${msg.sources.map(s => `<a class="source-pill" href="${s.url || '#'}" target="_blank">📄 ${s.title}</a>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    });

    // Suggested Questions (if messages count is small)
    if (config && config.suggestedQuestions && messages.length <= 2) {
      html += `
        <div class="suggested-questions">
          ${config.suggestedQuestions.map(q => `<button class="suggested-btn" data-query="${q}">${q}</button>`).join('')}
        </div>
      `;
    }

    // Lead Capture Form Overlay
    if (config && config.leadFormEnabled && !isLeadFormSubmitted && messages.length >= 3) {
      html += `
        <div class="lead-card">
          <h5>${config.leadFormTitle}</h5>
          ${config.leadFields.name ? `<input type="text" class="lead-input" id="lead-name" placeholder="Your Name" />` : ''}
          ${config.leadFields.email ? `<input type="email" class="lead-input" id="lead-email" placeholder="Email Address *" />` : ''}
          ${config.leadFields.company ? `<input type="text" class="lead-input" id="lead-company" placeholder="Company Name" />` : ''}
          <button class="lead-submit-btn" id="btn-submit-lead">Submit Info</button>
        </div>
      `;
    }

    // Typing Indicator
    if (isTyping) {
      html += `
        <div class="msg ai">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;

    // Attach suggested question clicks
    var sBtns = container.querySelectorAll('.suggested-btn');
    sBtns.forEach(function (btn) {
      btn.onclick = function () {
        handleSend(btn.getAttribute('data-query'));
      };
    });

    // Attach Lead submit handler
    var leadBtn = container.querySelector('#btn-submit-lead');
    if (leadBtn) {
      leadBtn.onclick = function () {
        var email = (container.querySelector('#lead-email') || {}).value || '';
        var name = (container.querySelector('#lead-name') || {}).value || '';
        var company = (container.querySelector('#lead-company') || {}).value || '';

        if (!email) {
          alert('Please enter your email address.');
          return;
        }

        fetch(apiOrigin + '/api/v1/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            websiteId: websiteId,
            conversationId: conversationId,
            name: name || 'Visitor',
            email: email,
            company: company,
            sourceUrl: window.location.href,
          })
        }).then(function () {
          isLeadFormSubmitted = true;
          localStorage.setItem('ai_widget_lead_done_' + websiteId, 'true');
          messages.push({
            id: 'lead_thanks',
            sender: 'ai',
            content: '✅ Thank you! Your contact information has been saved.',
            createdAt: new Date().toISOString()
          });
          updateMessagesUI();
        });
      };
    }
  }

  function handleSend(text) {
    if (!text || !text.trim() || isTyping) return;
    text = text.trim();

    var inputEl = shadow.querySelector('#chat-input-field');
    if (inputEl) inputEl.value = '';

    messages.push({
      id: 'usr_' + Date.now(),
      sender: 'visitor',
      content: text,
      createdAt: new Date().toISOString()
    });

    isTyping = true;
    updateMessagesUI();

    // Invoke SSE API Chat Stream
    var aiMsgId = 'ai_' + Date.now();
    var accumulatedText = '';

    fetch(apiOrigin + '/api/v1/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteId: websiteId,
        visitorId: visitorId,
        conversationId: conversationId,
        message: text,
        currentUrl: window.location.href,
      })
    }).then(function (res) {
      isTyping = false;
      var reader = res.body.getReader();
      var decoder = new TextDecoder();

      messages.push({
        id: aiMsgId,
        sender: 'ai',
        content: '',
        createdAt: new Date().toISOString()
      });

      function read() {
        reader.read().then(function (result) {
          if (result.done) return;
          var chunk = decoder.decode(result.value, { stream: true });
          
          var lines = chunk.split('\n');
          lines.forEach(function (line) {
            if (line.indexOf('data: ') === 0) {
              try {
                var json = JSON.parse(line.substring(6));
                if (json.conversationId) {
                  conversationId = json.conversationId;
                  localStorage.setItem('ai_widget_conv_id_' + websiteId, conversationId);
                }
                if (json.chunk) {
                  accumulatedText += json.chunk;
                  var aiMsgIndex = messages.findIndex(m => m.id === aiMsgId);
                  if (aiMsgIndex !== -1) {
                    messages[aiMsgIndex].content = accumulatedText;
                    if (json.sources) messages[aiMsgIndex].sources = json.sources;
                  }
                  updateMessagesUI();
                }
                if (json.status) {
                  currentStatus = json.status;
                }
              } catch (e) {}
            }
          });
          read();
        });
      }
      read();
    }).catch(function (err) {
      isTyping = false;
      messages.push({
        id: 'err_' + Date.now(),
        sender: 'ai',
        content: 'Apologies, I encountered a connection issue. Please try again!',
        createdAt: new Date().toISOString()
      });
      updateMessagesUI();
    });
  }

  // Simple Markdown Formatter
  function formatMarkdown(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/```([\s\S]*?)```/g, function (match, p1) {
        return '<pre style="background:#0f172a; color:#38bdf8; padding:8px; border-radius:6px; overflow-x:auto; margin:6px 0; font-family:monospace;"><code>' + p1 + '</code></pre>';
      })
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-family:monospace;">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }

  // Fetch configuration on load
  fetch(apiOrigin + '/api/v1/widget/config?siteId=' + websiteId)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      config = data;
      messages.push({
        id: 'welcome',
        sender: 'ai',
        content: config.welcomeMessage,
        createdAt: new Date().toISOString()
      });
      render();
    })
    .catch(function (err) {
      console.warn('Failed to load widget config:', err);
    });

})();
