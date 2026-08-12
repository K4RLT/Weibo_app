document.addEventListener('DOMContentLoaded', () => {
  const iframe = document.getElementById('weiboFrame');
  const btnBack = document.getElementById('btnBack');
  const btnForward = document.getElementById('btnForward');
  const btnReload = document.getElementById('btnReload');
  const btnHome = document.getElementById('btnHome');
  const btnLoginMode = document.getElementById('btnLoginMode');
  const btnDesktopMode = document.getElementById('btnDesktopMode');
  const btnMobileMode = document.getElementById('btnMobileMode');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const zoomLabel = document.getElementById('zoomLevel');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const btnCleanUI = document.getElementById('btnCleanUI');

  let currentZoom = 1.0;
  let isCleanMode = true;
  const LOGIN_URL = 'https://passport.weibo.com/sso/signin?entry=miniblog&source=miniblog&disp=popup&url=https%3A%2F%2Fweibo.com%2Fnewlogin%3Ftabtype%3Dweibo%26gid%3D102803%26openLoginLayer%3D0%26url%3Dhttps%3A%2F%2Fwww.weibo.com%2F&from=weibopro';
  let currentBaseUrl = 'https://weibo.com';

  // Navigation Logic
  btnBack?.addEventListener('click', () => {
    try {
      iframe.contentWindow?.history.back();
    } catch (e) {
      console.warn('Iframe cross-origin restriction on back navigation');
    }
  });

  btnForward?.addEventListener('click', () => {
    try {
      iframe.contentWindow?.history.forward();
    } catch (e) {
      console.warn('Iframe cross-origin restriction on forward navigation');
    }
  });

  btnReload?.addEventListener('click', () => {
    iframe.src = iframe.src;
  });

  btnHome?.addEventListener('click', () => {
    iframe.src = currentBaseUrl;
  });

  // Desktop / Mobile / Login Mode Switcher
  const switchMode = (activeBtn, url) => {
    [btnLoginMode, btnDesktopMode, btnMobileMode].forEach(btn => btn?.classList.remove('active'));
    activeBtn?.classList.add('active');
    currentBaseUrl = url;
    iframe.src = url;
  };

  btnLoginMode?.addEventListener('click', () => {
    switchMode(btnLoginMode, LOGIN_URL);
  });

  btnDesktopMode?.addEventListener('click', () => {
    switchMode(btnDesktopMode, 'https://weibo.com');
  });

  btnMobileMode?.addEventListener('click', () => {
    switchMode(btnMobileMode, 'https://m.weibo.cn');
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

  // Theme Toggle
  btnThemeToggle?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      btnThemeToggle.textContent = '☀️';
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      btnThemeToggle.textContent = '🌙';
    }
  });

  // Clean UI Toggle
  btnCleanUI?.addEventListener('click', () => {
    isCleanMode = !isCleanMode;
    if (isCleanMode) {
      btnCleanUI.classList.add('active-toggle');
      btnCleanUI.textContent = '✨ Clean Mode';
    } else {
      btnCleanUI.classList.remove('active-toggle');
      btnCleanUI.textContent = '🌐 Normal Mode';
    }
  });
});
