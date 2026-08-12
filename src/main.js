document.addEventListener('DOMContentLoaded', () => {

  // ── Elements ─────────────────────────────────────────────────
  const iframe             = document.getElementById('weiboFrame');
  const settingsModal      = document.getElementById('settingsModal');
  const btnCloseSettings   = document.getElementById('btnCloseSettings');
  const sideBtnSettings    = document.getElementById('sideBtnSettings');

  // Sidebar nav
  const sideBtnHome        = document.getElementById('sideBtnHome');
  const sideBtnHot         = document.getElementById('sideBtnHot');
  const sideBtnVideo       = document.getElementById('sideBtnVideo');
  const sideBtnMsg         = document.getElementById('sideBtnMsg');
  const sideBtnFav         = document.getElementById('sideBtnFav');
  const sideBtnProfile     = document.getElementById('sideBtnProfile');
  const sideBtnLogin       = document.getElementById('sideBtnLogin');

  // Titlebar nav
  const btnBack            = document.getElementById('btnBack');
  const btnForward         = document.getElementById('btnForward');
  const btnReload          = document.getElementById('btnReload');

  // Window controls
  const btnMinimize        = document.getElementById('btnMinimize');
  const btnMaximize        = document.getElementById('btnMaximize');
  const btnClose           = document.getElementById('btnClose');

  // Settings controls
  const btnLoginMode       = document.getElementById('btnLoginMode');
  const btnDesktopMode     = document.getElementById('btnDesktopMode');
  const btnMobileMode      = document.getElementById('btnMobileMode');
  const btnZoomIn          = document.getElementById('btnZoomIn');
  const btnZoomOut         = document.getElementById('btnZoomOut');
  const zoomLabel          = document.getElementById('zoomLevel');
  const btnCleanUI         = document.getElementById('btnCleanUI');
  const iconSelectedLabel  = document.getElementById('iconSelectedLabel');
  const iconOptions        = document.querySelectorAll('.icon-option');
  const themeChips         = document.querySelectorAll('.theme-chip');

  // Brand icons (switch with theme)
  const sidebarBrandIcon   = document.getElementById('sidebarBrandIcon');
  const titlebarBrandIcon  = document.getElementById('titlebarBrandIcon');

  // ── URLs ────────────────────────────────────────────────────
  const URLS = {
    home:    'https://weibo.com',
    hot:     'https://s.weibo.com/top/summary',
    video:   'https://weibo.com/tv',
    msg:     'https://weibo.com/message',
    fav:     'https://weibo.com/fav',
    profile: 'https://weibo.com/mygroups',
    login:   'https://passport.weibo.com/sso/signin',
    mobile:  'https://m.weibo.cn',
  };

  // ── State ───────────────────────────────────────────────────
  // Integer zoom steps: 7=70% … 10=100% … 15=150%
  const ZOOM_MIN = 7, ZOOM_MAX = 15;
  let zoomSteps   = parseInt(localStorage.getItem('weibo_zoom')  || '10', 10);
  let isCleanMode = true;
  let activeSideBtn = sideBtnHome;

  // Elements
  const btnEnterApp        = document.getElementById('btnEnterApp');

  // Window controls & titlebar menu
  const btnTitlebarMenu    = document.getElementById('btnTitlebarMenu');

  const getTauriWindow = () => {
    try { return window.__TAURI__?.window?.getCurrentWindow?.(); } catch (_) { return null; }
  };

  btnTitlebarMenu?.addEventListener('click', () => openSettings());

  btnMinimize?.addEventListener('click', () => {
    getTauriWindow()?.minimize?.();
  });

  btnMaximize?.addEventListener('click', async () => {
    const win = getTauriWindow();
    if (!win) return;
    const isMax = await win.isMaximized?.();
    isMax ? win.unmaximize?.() : win.maximize?.();
  });

  btnClose?.addEventListener('click', () => {
    getTauriWindow()?.close?.();
  });

  // ── Window Sizing (QQ Style Compact Login vs Full App) ──────
  const setWindowMode = async (isLogin) => {
    document.body.classList.toggle('is-login-page', isLogin);
    const win = getTauriWindow();
    if (!win) return;
    try {
      const LogicalSize = window.__TAURI__?.window?.LogicalSize || window.__TAURI__?.dpi?.LogicalSize;
      if (LogicalSize) {
        if (isLogin) {
          await win.setSize(new LogicalSize(760, 580));
        } else {
          await win.setSize(new LogicalSize(1280, 840));
        }
        await win.center();
      }
    } catch (_) {}
  };

  // ── Navigation ──────────────────────────────────────────────
  const navigateTo = (url, nextBtn = null) => {
    iframe.src = url;

    // Toggle compact window vs full desktop window
    const isLoginPage = url === URLS.login || url.includes('passport') || url.includes('signin');
    setWindowMode(isLoginPage);

    if (nextBtn && nextBtn !== activeSideBtn) {
      activeSideBtn?.classList.remove('active');
      nextBtn.classList.add('active');
      activeSideBtn = nextBtn;
    }
  };

  btnEnterApp?.addEventListener('click', () => {
    navigateTo(URLS.home, sideBtnHome);
  });

  // Start in compact login mode on launch
  setWindowMode(true);

  const reloadFrame = () => {
    try { iframe.contentWindow?.location.reload(); }
    catch (_) {
      const s = iframe.src; iframe.src = '';
      requestAnimationFrame(() => { iframe.src = s; });
    }
  };

  btnBack?.addEventListener('click',    () => { try { iframe.contentWindow?.history.back();    } catch (_) {} });
  btnForward?.addEventListener('click', () => { try { iframe.contentWindow?.history.forward(); } catch (_) {} });
  btnReload?.addEventListener('click',  reloadFrame);

  sideBtnHome?.addEventListener('click',    () => navigateTo(URLS.home,    sideBtnHome));
  sideBtnHot?.addEventListener('click',     () => navigateTo(URLS.hot,     sideBtnHot));
  sideBtnVideo?.addEventListener('click',   () => navigateTo(URLS.video,   sideBtnVideo));
  sideBtnMsg?.addEventListener('click',     () => navigateTo(URLS.msg,     sideBtnMsg));
  sideBtnFav?.addEventListener('click',     () => navigateTo(URLS.fav,     sideBtnFav));
  sideBtnProfile?.addEventListener('click', () => navigateTo(URLS.profile, sideBtnProfile));
  sideBtnLogin?.addEventListener('click',   () => navigateTo(URLS.login,   sideBtnLogin));

  // Mode chips in settings
  btnLoginMode?.addEventListener('click',   () => { navigateTo(URLS.login,  sideBtnLogin);   closeSetting(); });
  btnDesktopMode?.addEventListener('click', () => { navigateTo(URLS.home,   sideBtnHome);    closeSetting(); });
  btnMobileMode?.addEventListener('click',  () => { navigateTo(URLS.mobile);                 closeSetting(); });

  // ── Settings Modal ──────────────────────────────────────────
  const openSettings  = () => settingsModal?.classList.add('open');
  const closeSetting  = () => settingsModal?.classList.remove('open');

  sideBtnSettings?.addEventListener('click', openSettings);
  btnCloseSettings?.addEventListener('click', closeSetting);
  settingsModal?.addEventListener('click', (e) => { if (e.target === settingsModal) closeSetting(); });

  // ── Theme ───────────────────────────────────────────────────
  const LIGHT_THEMES = new Set(['light']);
  const DARK_BRAND_SRC  = 'icons/weibo_circular-dark.png';   // use on light bg
  const LIGHT_BRAND_SRC = 'icons/weibo_circular-white.png';  // use on dark bg

  const applyTheme = (theme) => {
    const KNOWN = ['dark-theme','light-theme','oled-theme','orange-theme'];
    KNOWN.forEach(c => document.body.classList.remove(c));
    document.body.classList.add(`${theme}-theme`);

    // Switch brand icons with theme
    const brandSrc = LIGHT_THEMES.has(theme) ? DARK_BRAND_SRC : LIGHT_BRAND_SRC;
    if (sidebarBrandIcon)  sidebarBrandIcon.src  = brandSrc;
    if (titlebarBrandIcon) titlebarBrandIcon.src = brandSrc;

    // Highlight correct theme chip
    themeChips.forEach(c => c.classList.toggle('active', c.dataset.theme === theme));

    localStorage.setItem('weibo_theme', theme);
  };

  themeChips.forEach(chip => {
    chip.addEventListener('click', () => applyTheme(chip.dataset.theme));
  });

  // Restore on load
  applyTheme(localStorage.getItem('weibo_theme') || 'dark');

  // ── Zoom ────────────────────────────────────────────────────
  const updateZoom = () => {
    const pct = zoomSteps * 10;
    zoomLabel.textContent = `${pct}%`;
    iframe.style.transform  = `scale(${zoomSteps / 10})`;
    iframe.style.width      = `${1000 / zoomSteps}%`;
    iframe.style.height     = `${1000 / zoomSteps}%`;
    iframe.style.transformOrigin = 'top left';
    localStorage.setItem('weibo_zoom', zoomSteps);
  };

  zoomSteps = parseInt(localStorage.getItem('weibo_zoom') || '10', 10);
  updateZoom();

  btnZoomIn?.addEventListener('click',  () => { if (zoomSteps < ZOOM_MAX) { zoomSteps++; updateZoom(); } });
  btnZoomOut?.addEventListener('click', () => { if (zoomSteps > ZOOM_MIN) { zoomSteps--; updateZoom(); } });

  // ── Clean Mode ──────────────────────────────────────────────
  btnCleanUI?.addEventListener('click', () => {
    isCleanMode = !isCleanMode;
    btnCleanUI.classList.toggle('active', isCleanMode);
    const icon = btnCleanUI.querySelector('.material-symbols-rounded');
    if (icon) icon.textContent = isCleanMode ? 'check' : 'close';
    btnCleanUI.lastChild.textContent = isCleanMode ? ' On' : ' Off';
  });

  // ── Icon Picker ─────────────────────────────────────────────
  const ICON_LABELS = {
    'weibo_block-normal':    'Original',
    'weibo_block-dark':      'Dark',
    'weibo_block-white':     'White',
    'weibo_circular-normal': 'Circle',
    'weibo_circular-dark':   'Circle Dark',
    'weibo_circular-white':  'Circle White',
  };

  const selectIcon = (key) => {
    iconOptions.forEach(btn => btn.classList.toggle('selected', btn.dataset.icon === key));
    if (iconSelectedLabel) {
      iconSelectedLabel.textContent = 'Selected: ';
      const s = document.createElement('strong');
      s.textContent = ICON_LABELS[key] || key;
      iconSelectedLabel.appendChild(s);
    }
    localStorage.setItem('weibo_icon', key);
    if (window.__TAURI__) {
      window.__TAURI__.core?.invoke?.('set_app_icon', { iconKey: key }).catch(() => {});
    }
  };

  iconOptions.forEach(btn => btn.addEventListener('click', () => selectIcon(btn.dataset.icon)));
  selectIcon(localStorage.getItem('weibo_icon') || 'weibo_block-normal');

  // ── Keyboard Shortcuts ───────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') { e.preventDefault(); reloadFrame(); }
    if (e.ctrlKey && e.key.toLowerCase() === 'h')       { e.preventDefault(); navigateTo(URLS.home,  sideBtnHome); }
    if (e.ctrlKey && e.key.toLowerCase() === 'l')       { e.preventDefault(); navigateTo(URLS.login, sideBtnLogin); }
    if (e.ctrlKey && e.key === ',')                     { e.preventDefault(); openSettings(); }
    if (e.ctrlKey && (e.key === '=' || e.key === '+'))  { e.preventDefault(); if (zoomSteps < ZOOM_MAX) { zoomSteps++; updateZoom(); } }
    if (e.ctrlKey && e.key === '-')                     { e.preventDefault(); if (zoomSteps > ZOOM_MIN) { zoomSteps--; updateZoom(); } }
  });
});
