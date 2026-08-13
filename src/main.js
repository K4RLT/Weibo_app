document.addEventListener('DOMContentLoaded', () => {

  // ── Elements ─────────────────────────────────────────────────
  const contentViewport    = document.getElementById('contentViewport');
  const appSidebar         = document.getElementById('appSidebar');

  // Sidebar nav
  const sideBtnHome        = document.getElementById('sideBtnHome');
  const sideBtnHot         = document.getElementById('sideBtnHot');
  const sideBtnVideo       = document.getElementById('sideBtnVideo');
  const sideBtnMsg         = document.getElementById('sideBtnMsg');
  const sideBtnFav         = document.getElementById('sideBtnFav');
  const sideBtnProfile     = document.getElementById('sideBtnProfile');
  const sideBtnLogin       = document.getElementById('sideBtnLogin');
  const sideBtnSettings    = document.getElementById('sideBtnSettings');

  // Toolbar nav
  const btnBack            = document.getElementById('btnBack');
  const btnForward         = document.getElementById('btnForward');
  const btnReload          = document.getElementById('btnReload');

  // ── Tauri IPC Helper ────────────────────────────────────────
  const invokeTauri = async (cmd, args = {}) => {
    if (window.__TAURI__?.core?.invoke) {
      try {
        return await window.__TAURI__.core.invoke(cmd, args);
      } catch (err) {
        console.error(`Failed to invoke ${cmd}:`, err);
      }
    }
  };

  // ── URLs ────────────────────────────────────────────────────
  // NOTE: Use www.weibo.com — bare weibo.com redirects through a
  // visitor-challenge JS page that blocks iframe loading.
  const URLS = {
    home:    'https://www.weibo.com',
    hot:     'https://s.weibo.com/top/summary',
    video:   'https://www.weibo.com/tv',
    msg:     'https://www.weibo.com/messages',
    fav:     'https://www.weibo.com/fav',
    profile: 'https://www.weibo.com/self',
    login:   'https://passport.weibo.com/sso/signin',
    mobile:  'https://m.weibo.cn',
  };

  // ── State ───────────────────────────────────────────────────
  let activeSideBtn = sideBtnHome;
  let wasOnLoginPage = false;

  // ── Login button visibility ─────────────────────────────────
  const isLoginUrl = (url) =>
    url.includes('passport') || url.includes('signin');

  const updateSidebarAndLoginVisibility = (url) => {
    const onLogin = isLoginUrl(url);
    if (appSidebar) {
      appSidebar.style.display = onLogin ? 'none' : 'flex';
    }
    if (sideBtnSettings) {
      sideBtnSettings.style.display = onLogin ? 'none' : 'flex';
    }
    if (sideBtnLogin) {
      sideBtnLogin.style.display = onLogin ? 'flex' : 'none';
    }
  };

  // ── Navigation ──────────────────────────────────────────────
  const navigateTo = (url, nextBtn = null) => {
    invokeTauri('navigate_weibo', { url });
    wasOnLoginPage = isLoginUrl(url);
    updateSidebarAndLoginVisibility(url);

    if (nextBtn && nextBtn !== activeSideBtn) {
      activeSideBtn?.classList.remove('active');
      nextBtn.classList.add('active');
      activeSideBtn = nextBtn;
    }
  };

  // Listen for the 'weibo-nav' event from Rust
  if (window.__TAURI__?.event?.listen) {
    window.__TAURI__.event.listen('weibo-nav', (event) => {
      const url = event.payload;
      console.log('weibo-nav event received, url:', url);
      
      if (wasOnLoginPage && !isLoginUrl(url)) {
        wasOnLoginPage = false;
        navigateTo(URLS.home, sideBtnHome);
        return;
      }
      wasOnLoginPage = isLoginUrl(url);
      updateSidebarAndLoginVisibility(url);
    });
  }

  const reloadFrame = () => {
    invokeTauri('reload_weibo');
  };

  // ── Resize Observer for Child Webview ──────────────────────
  const updateWebviewBounds = () => {
    if (!contentViewport) return;
    const rect = contentViewport.getBoundingClientRect();
    invokeTauri('set_webview_bounds', {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    });
  };

  if (contentViewport) {
    const observer = new ResizeObserver(() => {
      updateWebviewBounds();
    });
    observer.observe(contentViewport);
  }

  // Toolbar buttons
  btnBack?.addEventListener('click',    () => { invokeTauri('back_weibo'); });
  btnForward?.addEventListener('click', () => { invokeTauri('forward_weibo'); });
  btnReload?.addEventListener('click',  reloadFrame);

  // Sidebar buttons
  sideBtnHome?.addEventListener('click',    () => navigateTo(URLS.home,    sideBtnHome));
  sideBtnHot?.addEventListener('click',     () => navigateTo(URLS.hot,     sideBtnHot));
  sideBtnVideo?.addEventListener('click',   () => navigateTo(URLS.video,   sideBtnVideo));
  sideBtnMsg?.addEventListener('click',     () => navigateTo(URLS.msg,     sideBtnMsg));
  sideBtnFav?.addEventListener('click',     () => navigateTo(URLS.fav,     sideBtnFav));
  sideBtnProfile?.addEventListener('click', () => navigateTo(URLS.profile, sideBtnProfile));
  sideBtnLogin?.addEventListener('click',   () => navigateTo(URLS.login,   sideBtnLogin));

  // ── Settings (Preferences) Window ───────────────────────────
  const openSettings = () => {
    invokeTauri('open_settings_window');
  };

  sideBtnSettings?.addEventListener('click', openSettings);



  // ── Theme ───────────────────────────────────────────────────
  const applyTheme = (theme) => {
    document.documentElement.className = theme === 'light' ? 'adw-light' : 'adw-dark';
    localStorage.setItem('weibo_theme', theme);
    invokeTauri('apply_weibo_theme', { isDark: theme === 'dark' });
  };

  applyTheme(localStorage.getItem('weibo_theme') || 'dark');

  // Listen for theme-changed events from settings window
  if (window.__TAURI__?.event?.listen) {
    window.__TAURI__.event.listen('theme-changed', (event) => {
      applyTheme(event.payload);
    });
  }

  // ── Keyboard Shortcuts ───────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') { e.preventDefault(); reloadFrame(); }
    if (e.ctrlKey && e.key.toLowerCase() === 'h')       { e.preventDefault(); navigateTo(URLS.home,  sideBtnHome); }
    if (e.ctrlKey && e.key.toLowerCase() === 'l')       { e.preventDefault(); navigateTo(URLS.login, sideBtnLogin); }
    if (e.ctrlKey && e.key === ',')                     { e.preventDefault(); openSettings(); }
  });

  // ── Window Controls (using custom Rust commands) ────────────
  const winMin   = document.getElementById('winMin');
  const winMax   = document.getElementById('winMax');
  const winClose = document.getElementById('winClose');

  winMin?.addEventListener('click',   () => invokeTauri('minimize_window'));
  winMax?.addEventListener('click',   () => invokeTauri('toggle_maximize_window'));
  winClose?.addEventListener('click', () => invokeTauri('close_window'));

  // Drag region using custom drag command
  const adwToolbar = document.querySelector('.adw-toolbar');
  adwToolbar?.addEventListener('mousedown', (e) => {
    if (!e.target.closest('button')) {
      invokeTauri('drag_window');
    }
  });
});
