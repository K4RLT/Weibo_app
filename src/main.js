document.addEventListener('DOMContentLoaded', () => {

  // ── Elements ─────────────────────────────────────────────────
  const iframe             = document.getElementById('weiboFrame');
  const settingsModal      = document.getElementById('settingsModal');
  const btnCloseSettings   = document.getElementById('btnCloseSettings');
  const btnToggleSidebar   = document.getElementById('btnToggleSidebar');
  const appSidebar         = document.getElementById('appSidebar');
  const themeChips         = document.querySelectorAll('[data-theme]');

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

  // ── URLs ────────────────────────────────────────────────────
  // NOTE: Use www.weibo.com — bare weibo.com redirects through a
  // visitor-challenge JS page that blocks iframe loading.
  const URLS = {
    home:    'https://www.weibo.com',
    hot:     'https://s.weibo.com/top/summary',
    video:   'https://weibo.com/tv',
    msg:     'https://weibo.com/message',
    fav:     'https://weibo.com/fav',
    profile: 'https://weibo.com/mygroups',
    login:   'https://passport.weibo.com/sso/signin',
    mobile:  'https://m.weibo.cn',
  };

  // ── State ───────────────────────────────────────────────────
  let activeSideBtn = sideBtnHome;
  let wasOnLoginPage = false;

  // ── Login button visibility ─────────────────────────────────
  const isLoginUrl = (url) =>
    url.includes('passport') || url.includes('signin');

  const updateLoginBtn = (url) => {
    if (sideBtnLogin) {
      sideBtnLogin.style.display = isLoginUrl(url) ? 'flex' : 'none';
    }
  };

  // ── Navigation ──────────────────────────────────────────────
  const navigateTo = (url, nextBtn = null) => {
    iframe.src = url;
    wasOnLoginPage = isLoginUrl(url);
    updateLoginBtn(url);

    if (nextBtn && nextBtn !== activeSideBtn) {
      activeSideBtn?.classList.remove('active');
      nextBtn.classList.add('active');
      activeSideBtn = nextBtn;
    }
  };

  // After login completes → redirect to home feed automatically
  iframe?.addEventListener('load', () => {
    try {
      const url = iframe.contentWindow?.location.href || iframe.src;
      if (wasOnLoginPage && !isLoginUrl(url)) {
        wasOnLoginPage = false;
        navigateTo(URLS.home, sideBtnHome);
        return;
      }
      wasOnLoginPage = isLoginUrl(url);
      updateLoginBtn(url);
    } catch (_) {
      // Cross-origin: if we were on login, assume redirect = login done
      if (wasOnLoginPage) {
        wasOnLoginPage = false;
        navigateTo(URLS.home, sideBtnHome);
      }
    }
  });

  const reloadFrame = () => {
    try { iframe.contentWindow?.location.reload(); }
    catch (_) {
      const s = iframe.src;
      iframe.src = '';
      requestAnimationFrame(() => { iframe.src = s; });
    }
  };

  // Toolbar buttons
  btnBack?.addEventListener('click',    () => { try { iframe.contentWindow?.history.back();    } catch (_) {} });
  btnForward?.addEventListener('click', () => { try { iframe.contentWindow?.history.forward(); } catch (_) {} });
  btnReload?.addEventListener('click',  reloadFrame);

  // Sidebar buttons
  sideBtnHome?.addEventListener('click',    () => navigateTo(URLS.home,    sideBtnHome));
  sideBtnHot?.addEventListener('click',     () => navigateTo(URLS.hot,     sideBtnHot));
  sideBtnVideo?.addEventListener('click',   () => navigateTo(URLS.video,   sideBtnVideo));
  sideBtnMsg?.addEventListener('click',     () => navigateTo(URLS.msg,     sideBtnMsg));
  sideBtnFav?.addEventListener('click',     () => navigateTo(URLS.fav,     sideBtnFav));
  sideBtnProfile?.addEventListener('click', () => navigateTo(URLS.profile, sideBtnProfile));
  sideBtnLogin?.addEventListener('click',   () => navigateTo(URLS.login,   sideBtnLogin));

  // ── Settings Modal ──────────────────────────────────────────
  const openSettings  = () => settingsModal?.classList.add('open');
  const closeSettings = () => settingsModal?.classList.remove('open');

  sideBtnSettings?.addEventListener('click', openSettings);
  btnCloseSettings?.addEventListener('click', closeSettings);
  settingsModal?.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettings(); });

  // ── Sidebar Toggle (burger menu) ────────────────────────────
  btnToggleSidebar?.addEventListener('click', () => {
    if (appSidebar) {
      const hidden = appSidebar.style.display === 'none';
      appSidebar.style.display = hidden ? 'flex' : 'none';
    }
  });

  // ── Theme ───────────────────────────────────────────────────
  const applyTheme = (theme) => {
    document.body.classList.remove('adw-dark', 'adw-light');
    document.body.classList.add(`adw-${theme}`);
    themeChips.forEach(c => c.classList.toggle('chip-active', c.dataset.theme === theme));
    localStorage.setItem('weibo_theme', theme);
  };

  themeChips.forEach(chip => {
    chip.addEventListener('click', () => applyTheme(chip.dataset.theme));
  });

  applyTheme(localStorage.getItem('weibo_theme') || 'dark');

  // ── App Icon Picker ──────────────────────────────────────────
  const iconOpts = document.querySelectorAll('.icon-opt');

  const selectIcon = (key) => {
    iconOpts.forEach(btn => btn.classList.toggle('selected', btn.dataset.icon === key));
    localStorage.setItem('weibo_icon', key);
    // Tell Rust to persist and apply the icon
    if (window.__TAURI__?.core?.invoke) {
      window.__TAURI__.core.invoke('set_app_icon', { iconKey: key }).catch(() => {});
    }
  };

  iconOpts.forEach(btn => {
    btn.addEventListener('click', () => selectIcon(btn.dataset.icon));
  });

  // Restore saved icon selection highlight on load
  const savedIcon = localStorage.getItem('weibo_icon') || 'weibo_block-normal';
  iconOpts.forEach(btn => btn.classList.toggle('selected', btn.dataset.icon === savedIcon));

  // ── Keyboard Shortcuts ───────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') { e.preventDefault(); reloadFrame(); }
    if (e.ctrlKey && e.key.toLowerCase() === 'h')       { e.preventDefault(); navigateTo(URLS.home,  sideBtnHome); }
    if (e.ctrlKey && e.key.toLowerCase() === 'l')       { e.preventDefault(); navigateTo(URLS.login, sideBtnLogin); }
    if (e.ctrlKey && e.key === ',')                     { e.preventDefault(); openSettings(); }
  });
});
