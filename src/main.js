document.addEventListener('DOMContentLoaded', () => {

  // ── Elements ─────────────────────────────────────────────────
  const iframe             = document.getElementById('weiboFrame');
  const settingsModal      = document.getElementById('settingsModal');
  const btnCloseSettings   = document.getElementById('btnCloseSettings');
  const sideBtnSettings    = document.getElementById('sideBtnSettings');
  const btnSettingsToggle  = document.getElementById('btnSettingsToggle');

  // Sidebar nav
  const sideBtnHome        = document.getElementById('sideBtnHome');
  const sideBtnHot         = document.getElementById('sideBtnHot');
  const sideBtnVideo       = document.getElementById('sideBtnVideo');
  const sideBtnMsg         = document.getElementById('sideBtnMsg');
  const sideBtnFav         = document.getElementById('sideBtnFav');
  const sideBtnProfile     = document.getElementById('sideBtnProfile');
  const sideBtnLogin       = document.getElementById('sideBtnLogin');

  // Header nav
  const btnBack            = document.getElementById('btnBack');
  const btnForward         = document.getElementById('btnForward');
  const btnReload          = document.getElementById('btnReload');

  // Settings controls
  const btnLoginMode       = document.getElementById('btnLoginMode');
  const btnDesktopMode     = document.getElementById('btnDesktopMode');
  const btnMobileMode      = document.getElementById('btnMobileMode');
  const btnZoomIn          = document.getElementById('btnZoomIn');
  const btnZoomOut         = document.getElementById('btnZoomOut');
  const zoomLabel          = document.getElementById('zoomLevel');
  const btnCleanUI         = document.getElementById('btnCleanUI');
  const themeChips         = document.querySelectorAll('[data-theme]');

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
  const ZOOM_MIN = 7, ZOOM_MAX = 15;
  let zoomSteps   = parseInt(localStorage.getItem('weibo_zoom') || '10', 10);
  let isCleanMode = true;
  let activeSideBtn = sideBtnHome;

  // ── Navigation ──────────────────────────────────────────────
  let wasOnLoginPage = true;

  const updateLoginButtonVisibility = (url) => {
    const isLoginPage = url === URLS.login || url.includes('passport') || url.includes('signin');
    if (sideBtnLogin) {
      sideBtnLogin.style.display = isLoginPage ? 'flex' : 'none';
    }
  };

  const navigateTo = (url, nextBtn = null) => {
    iframe.src = url;
    const isLoginPage = url === URLS.login || url.includes('passport') || url.includes('signin');
    wasOnLoginPage = isLoginPage;
    updateLoginButtonVisibility(url);

    if (nextBtn && nextBtn !== activeSideBtn) {
      activeSideBtn?.classList.remove('active');
      nextBtn.classList.add('active');
      activeSideBtn = nextBtn;
    }
  };

  iframe?.addEventListener('load', () => {
    try {
      const currentUrl = iframe.contentWindow?.location.href || iframe.src;
      const isLoginPage = currentUrl.includes('passport') || currentUrl.includes('signin');

      // Post-login redirect: If login was in progress and now completed, automatically go to home feed!
      if (wasOnLoginPage && !isLoginPage) {
        wasOnLoginPage = false;
        navigateTo(URLS.home, sideBtnHome);
        return;
      }

      wasOnLoginPage = isLoginPage;
      updateLoginButtonVisibility(currentUrl);
    } catch (_) {
      // Cross-origin redirect after SSO login
      if (wasOnLoginPage) {
        wasOnLoginPage = false;
        navigateTo(URLS.home, sideBtnHome);
      }
    }
  });

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

  btnLoginMode?.addEventListener('click',   () => { navigateTo(URLS.login,  sideBtnLogin);   closeSettings(); });
  btnDesktopMode?.addEventListener('click', () => { navigateTo(URLS.home,   sideBtnHome);    closeSettings(); });
  btnMobileMode?.addEventListener('click',  () => { navigateTo(URLS.mobile);                 closeSettings(); });

  // ── Settings Modal ──────────────────────────────────────────
  const openSettings  = () => settingsModal?.classList.add('open');
  const closeSettings = () => settingsModal?.classList.remove('open');

  sideBtnSettings?.addEventListener('click', openSettings);
  btnSettingsToggle?.addEventListener('click', openSettings);
  btnCloseSettings?.addEventListener('click', closeSettings);
  settingsModal?.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettings(); });

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
    btnCleanUI.lastChild.textContent = isCleanMode ? ' On' : ' Off';
  });

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
