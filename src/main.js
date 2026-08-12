document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const iframe = document.getElementById('weiboFrame');
  const appSidebar = document.getElementById('appSidebar');
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');

  // Nav Buttons
  const btnBack = document.getElementById('btnBack');
  const btnForward = document.getElementById('btnForward');
  const btnReload = document.getElementById('btnReload');

  // Mode Chips
  const btnLoginMode = document.getElementById('btnLoginMode');
  const btnDesktopMode = document.getElementById('btnDesktopMode');
  const btnMobileMode = document.getElementById('btnMobileMode');

  // Sidebar Items
  const sideBtnHome = document.getElementById('sideBtnHome');
  const sideBtnHot = document.getElementById('sideBtnHot');
  const sideBtnMsg = document.getElementById('sideBtnMsg');
  const sideBtnFav = document.getElementById('sideBtnFav');
  const sideBtnProfile = document.getElementById('sideBtnProfile');
  const sideBtnLogin = document.getElementById('sideBtnLogin');
  const sideBtnSettings = document.getElementById('sideBtnSettings');

  // Tools & Zoom
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const zoomLabel = document.getElementById('zoomLevel');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const btnCleanUI = document.getElementById('btnCleanUI');

  // Settings Modal
  const settingsModal = document.getElementById('settingsModal');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const themeSelect = document.getElementById('themeSelect');
  const uaSelect = document.getElementById('uaSelect');

  // Constants & State
  const PASSPORT_LOGIN_URL = 'https://passport.weibo.com/sso/signin?entry=miniblog&source=miniblog&disp=popup&url=https%3A%2F%2Fweibo.com%2Fnewlogin%3Ftabtype%3Dweibo%26gid%3D102803%26openLoginLayer%3D0%26url%3Dhttps%3A%2F%2Fwww.weibo.com%2F&from=weibopro';
  const URLS = {
    home: 'https://weibo.com',
    hot: 'https://weibo.com/hot/search',
    msg: 'https://weibo.com/message',
    fav: 'https://weibo.com/fav',
    profile: 'https://weibo.com/mygroups',
    login: PASSPORT_LOGIN_URL,
    mobile: 'https://m.weibo.cn'
  };

  let currentZoom = 1.0;
  let isCleanMode = true;

  // Navigate Function
  const navigateTo = (url, activeSideBtn = null) => {
    iframe.src = url;
    if (activeSideBtn) {
      document.querySelectorAll('.side-item').forEach(btn => btn.classList.remove('active'));
      activeSideBtn.classList.add('active');
    }
  };

  // Sidebar Toggle
  btnToggleSidebar?.addEventListener('click', () => {
    appSidebar.classList.toggle('collapsed');
  });

  // Navigation Controls
  btnBack?.addEventListener('click', () => {
    try { iframe.contentWindow?.history.back(); } catch (e) {}
  });

  btnForward?.addEventListener('click', () => {
    try { iframe.contentWindow?.history.forward(); } catch (e) {}
  });

  btnReload?.addEventListener('click', () => {
    iframe.src = iframe.src;
  });

  // Sidebar Quick Nav
  sideBtnHome?.addEventListener('click', () => navigateTo(URLS.home, sideBtnHome));
  sideBtnHot?.addEventListener('click', () => navigateTo(URLS.hot, sideBtnHot));
  sideBtnMsg?.addEventListener('click', () => navigateTo(URLS.msg, sideBtnMsg));
  sideBtnFav?.addEventListener('click', () => navigateTo(URLS.fav, sideBtnFav));
  sideBtnProfile?.addEventListener('click', () => navigateTo(URLS.profile, sideBtnProfile));
  sideBtnLogin?.addEventListener('click', () => navigateTo(URLS.login, sideBtnLogin));

  // Top Mode Switchers
  btnLoginMode?.addEventListener('click', () => navigateTo(URLS.login, sideBtnLogin));
  btnDesktopMode?.addEventListener('click', () => navigateTo(URLS.home, sideBtnHome));
  btnMobileMode?.addEventListener('click', () => navigateTo(URLS.mobile));

  // Settings Modal Handlers
  sideBtnSettings?.addEventListener('click', () => {
    settingsModal.classList.add('open');
  });

  btnCloseSettings?.addEventListener('click', () => {
    settingsModal.classList.remove('open');
  });

  settingsModal?.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('open');
    }
  });

  // Multi-Theme Selector
  const applyTheme = (themeName) => {
    document.body.className = '';
    document.body.classList.add(`${themeName}-theme`);
    if (themeName === 'light') {
      btnThemeToggle.textContent = '☀️';
    } else {
      btnThemeToggle.textContent = '🌙';
    }
  };

  themeSelect?.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });

  btnThemeToggle?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme') || document.body.classList.contains('oled-theme');
    applyTheme(isDark ? 'light' : 'dark');
  });

  // User Agent Switcher
  uaSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'mobile') {
      navigateTo(URLS.mobile);
    } else {
      navigateTo(URLS.home);
    }
  });

  // Zoom Controls
  const updateZoom = () => {
    zoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;
    iframe.style.transform = `scale(${currentZoom})`;
    iframe.style.width = `${100 / currentZoom}%`;
    iframe.style.height = `${100 / currentZoom}%`;
  };

  btnZoomIn?.addEventListener('click', () => {
    if (currentZoom < 1.5) {
      currentZoom += 0.1;
      updateZoom();
    }
  });

  btnZoomOut?.addEventListener('click', () => {
    if (currentZoom > 0.7) {
      currentZoom -= 0.1;
      updateZoom();
    }
  });

  // Clean Mode Toggle
  btnCleanUI?.addEventListener('click', () => {
    isCleanMode = !isCleanMode;
    btnCleanUI.classList.toggle('active-toggle', isCleanMode);
    btnCleanUI.textContent = isCleanMode ? '✨ Clean Mode' : '🌐 Normal Mode';
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ctrl + R or F5 (Reload)
    if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
      e.preventDefault();
      iframe.src = iframe.src;
    }
    // Ctrl + H (Home)
    if (e.ctrlKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      navigateTo(URLS.home, sideBtnHome);
    }
    // Ctrl + L (Login)
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      navigateTo(URLS.login, sideBtnLogin);
    }
    // Ctrl + Equal / Plus (Zoom In)
    if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      if (currentZoom < 1.5) { currentZoom += 0.1; updateZoom(); }
    }
    // Ctrl + Minus (Zoom Out)
    if (e.ctrlKey && e.key === '-') {
      e.preventDefault();
      if (currentZoom > 0.7) { currentZoom -= 0.1; updateZoom(); }
    }
  });
});
