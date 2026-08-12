document.addEventListener('DOMContentLoaded', () => {
  // ── Element References ───────────────────────────────────────
  const iframe          = document.getElementById('weiboFrame');
  const appSidebar      = document.getElementById('appSidebar');
  const btnToggleSidebar= document.getElementById('btnToggleSidebar');

  const btnBack         = document.getElementById('btnBack');
  const btnForward      = document.getElementById('btnForward');
  const btnReload       = document.getElementById('btnReload');

  const btnLoginMode    = document.getElementById('btnLoginMode');
  const btnDesktopMode  = document.getElementById('btnDesktopMode');
  const btnMobileMode   = document.getElementById('btnMobileMode');

  const sideBtnHome     = document.getElementById('sideBtnHome');
  const sideBtnHot      = document.getElementById('sideBtnHot');
  const sideBtnVideo    = document.getElementById('sideBtnVideo');
  const sideBtnMsg      = document.getElementById('sideBtnMsg');
  const sideBtnFav      = document.getElementById('sideBtnFav');
  const sideBtnProfile  = document.getElementById('sideBtnProfile');
  const sideBtnLogin    = document.getElementById('sideBtnLogin');
  const sideBtnSettings = document.getElementById('sideBtnSettings');

  const btnZoomIn       = document.getElementById('btnZoomIn');
  const btnZoomOut      = document.getElementById('btnZoomOut');
  const zoomLabel       = document.getElementById('zoomLevel');
  const btnThemeToggle  = document.getElementById('btnThemeToggle');
  const btnCleanUI      = document.getElementById('btnCleanUI');

  const settingsModal   = document.getElementById('settingsModal');
  const btnCloseSettings= document.getElementById('btnCloseSettings');
  const themeSelect     = document.getElementById('themeSelect');
  const uaSelect        = document.getElementById('uaSelect');

  // ── Constants ────────────────────────────────────────────────
  const PASSPORT_LOGIN_URL = 'https://passport.weibo.com/sso/signin';
  const URLS = {
    home:    'https://weibo.com',
    hot:     'https://s.weibo.com/top/summary',
    video:   'https://weibo.com/tv',
    msg:     'https://weibo.com/message',
    fav:     'https://weibo.com/fav',
    profile: 'https://weibo.com/mygroups',
    login:   PASSPORT_LOGIN_URL,
    mobile:  'https://m.weibo.cn',
  };

  // FIX: Use integer steps (×10) to avoid float drift — 10 = 100%, 15 = 150%
  const ZOOM_STEP = 1;
  const ZOOM_MIN  = 7;   // 70%
  const ZOOM_MAX  = 15;  // 150%
  let zoomSteps = 10;    // starts at 100%
  let isCleanMode = true;

  // Cache all side-item buttons once for O(1) active-state switching
  const allSideItems = Array.from(document.querySelectorAll('.side-item'));
  let activeSideBtn = sideBtnHome;

  // ── Navigation ───────────────────────────────────────────────
  const navigateTo = (url, nextActive = null) => {
    iframe.src = url;
    if (nextActive && nextActive !== activeSideBtn) {
      activeSideBtn?.classList.remove('active');
      nextActive.classList.add('active');
      activeSideBtn = nextActive;
    }
  };

  btnToggleSidebar?.addEventListener('click', () => {
    appSidebar.classList.toggle('collapsed');
  });

  // FIX: use contentWindow.location.reload() instead of re-assigning src
  const reloadFrame = () => {
    try {
      iframe.contentWindow?.location.reload();
    } catch (_) {
      // Cross-origin fallback: re-assign src
      const currentSrc = iframe.src;
      iframe.src = '';
      requestAnimationFrame(() => { iframe.src = currentSrc; });
    }
  };

  btnBack?.addEventListener('click',   () => { try { iframe.contentWindow?.history.back();    } catch (_) {} });
  btnForward?.addEventListener('click', () => { try { iframe.contentWindow?.history.forward(); } catch (_) {} });
  btnReload?.addEventListener('click',  reloadFrame);

  // Sidebar Nav
  sideBtnHome?.addEventListener('click',    () => navigateTo(URLS.home,    sideBtnHome));
  sideBtnHot?.addEventListener('click',     () => navigateTo(URLS.hot,     sideBtnHot));
  sideBtnVideo?.addEventListener('click',   () => navigateTo(URLS.video,   sideBtnVideo));
  sideBtnMsg?.addEventListener('click',     () => navigateTo(URLS.msg,     sideBtnMsg));
  sideBtnFav?.addEventListener('click',     () => navigateTo(URLS.fav,     sideBtnFav));
  sideBtnProfile?.addEventListener('click', () => navigateTo(URLS.profile, sideBtnProfile));
  sideBtnLogin?.addEventListener('click',   () => navigateTo(URLS.login,   sideBtnLogin));

  // Mode chips
  btnLoginMode?.addEventListener('click',   () => navigateTo(URLS.login,  sideBtnLogin));
  btnDesktopMode?.addEventListener('click', () => navigateTo(URLS.home,   sideBtnHome));
  btnMobileMode?.addEventListener('click',  () => navigateTo(URLS.mobile));

  // ── Settings Modal ───────────────────────────────────────────
  sideBtnSettings?.addEventListener('click', () => settingsModal?.classList.add('open'));
  btnCloseSettings?.addEventListener('click', () => settingsModal?.classList.remove('open'));
  settingsModal?.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove('open');
  });

  // ── Icon Picker ──────────────────────────────────────────────
  const ICON_LABELS = {
    'weibo_block-normal':    'Original',
    'weibo_block-dark':      'Dark',
    'weibo_block-white':     'White',
    'weibo_circular-normal': 'Circle',
    'weibo_circular-dark':   'Circle Dark',
    'weibo_circular-white':  'Circle White',
  };

  const iconSelectedLabel = document.getElementById('iconSelectedLabel');
  const iconOptions = document.querySelectorAll('.icon-option');

  const selectIcon = (iconKey) => {
    iconOptions.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.icon === iconKey);
    });
    // FIX: use textContent + DOM nodes instead of innerHTML to avoid XSS risk
    if (iconSelectedLabel) {
      iconSelectedLabel.textContent = 'Selected: ';
      const strong = document.createElement('strong');
      strong.textContent = ICON_LABELS[iconKey] || iconKey;
      iconSelectedLabel.appendChild(strong);
    }
    localStorage.setItem('weibo_icon', iconKey);
    if (window.__TAURI__) {
      window.__TAURI__.core.invoke('set_app_icon', { iconKey }).catch(() => {});
    }
  };

  const savedIcon = localStorage.getItem('weibo_icon') || 'weibo_block-normal';
  selectIcon(savedIcon);

  iconOptions.forEach(btn => {
    btn.addEventListener('click', () => selectIcon(btn.dataset.icon));
  });

  // ── Theme ────────────────────────────────────────────────────
  const THEME_CLASSES = ['dark-theme', 'light-theme', 'oled-theme', 'orange-theme'];

  // FIX: only remove known theme classes, don't wipe all body classes
  const applyTheme = (themeName) => {
    THEME_CLASSES.forEach(cls => document.body.classList.remove(cls));
    document.body.classList.add(`${themeName}-theme`);
    btnThemeToggle.textContent = themeName === 'light' ? '☀️' : '🌙';
    localStorage.setItem('weibo_theme', themeName);
  };

  // Restore saved theme on load
  const savedTheme = localStorage.getItem('weibo_theme') || 'dark';
  applyTheme(savedTheme);
  if (themeSelect) themeSelect.value = savedTheme;

  themeSelect?.addEventListener('change', (e) => applyTheme(e.target.value));
  btnThemeToggle?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme') ||
                   document.body.classList.contains('oled-theme');
    applyTheme(isDark ? 'light' : 'dark');
  });

  // ── User Agent Switcher ──────────────────────────────────────
  uaSelect?.addEventListener('change', (e) => {
    navigateTo(e.target.value === 'mobile' ? URLS.mobile : URLS.home);
  });

  // ── Zoom Controls (integer steps — no float drift) ───────────
  const updateZoom = () => {
    const pct = zoomSteps * 10;
    zoomLabel.textContent = `${pct}%`;
    iframe.style.transform = `scale(${zoomSteps / 10})`;
    iframe.style.width  = `${1000 / zoomSteps}%`;
    iframe.style.height = `${1000 / zoomSteps}%`;
    localStorage.setItem('weibo_zoom', zoomSteps);
  };

  // Restore saved zoom
  zoomSteps = parseInt(localStorage.getItem('weibo_zoom') || '10', 10);
  updateZoom();

  btnZoomIn?.addEventListener('click', () => {
    if (zoomSteps < ZOOM_MAX) { zoomSteps += ZOOM_STEP; updateZoom(); }
  });
  btnZoomOut?.addEventListener('click', () => {
    if (zoomSteps > ZOOM_MIN) { zoomSteps -= ZOOM_STEP; updateZoom(); }
  });

  // ── Clean Mode ───────────────────────────────────────────────
  btnCleanUI?.addEventListener('click', () => {
    isCleanMode = !isCleanMode;
    btnCleanUI.classList.toggle('active-toggle', isCleanMode);
    btnCleanUI.textContent = isCleanMode ? '✨ Clean Mode' : '🌐 Normal Mode';
  });

  // ── Keyboard Shortcuts ───────────────────────────────────────
  // Stored as named function so it could be removed if needed
  const handleKeydown = (e) => {
    if (e.ctrlKey && e.key === 'r' || e.key === 'F5') {
      e.preventDefault();
      reloadFrame();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      navigateTo(URLS.home, sideBtnHome);
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      navigateTo(URLS.login, sideBtnLogin);
    }
    if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      if (zoomSteps < ZOOM_MAX) { zoomSteps += ZOOM_STEP; updateZoom(); }
    }
    if (e.ctrlKey && e.key === '-') {
      e.preventDefault();
      if (zoomSteps > ZOOM_MIN) { zoomSteps -= ZOOM_STEP; updateZoom(); }
    }
  };

  window.addEventListener('keydown', handleKeydown);
});
