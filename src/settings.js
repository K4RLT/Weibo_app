document.addEventListener('DOMContentLoaded', () => {
  const themeChips = document.querySelectorAll('.chip');
  const iconOpts   = document.querySelectorAll('.icon-opt');

  // ── Apply Theme ─────────────────────────────────────────────
  const applyTheme = (theme) => {
    document.documentElement.className = theme === 'light' ? 'adw-light' : 'adw-dark';
    themeChips.forEach(chip => {
      chip.classList.toggle('chip-active', chip.dataset.theme === theme);
    });
    localStorage.setItem('weibo_theme', theme);

    // Broadcast event to other windows (the main window)
    if (window.__TAURI__?.event?.emit) {
      window.__TAURI__.event.emit('theme-changed', theme);
    }
  };

  themeChips.forEach(chip => {
    chip.addEventListener('click', () => applyTheme(chip.dataset.theme));
  });

  // Load current theme
  const currentTheme = localStorage.getItem('weibo_theme') || 'dark';
  applyTheme(currentTheme);

  // ── App Icon Picker ──────────────────────────────────────────
  const selectIcon = (key) => {
    iconOpts.forEach(btn => btn.classList.toggle('selected', btn.dataset.icon === key));
    localStorage.setItem('weibo_icon', key);

    // Call Rust backend to change and save the app icon
    if (window.__TAURI__?.core?.invoke) {
      window.__TAURI__.core.invoke('set_app_icon', { icon_key: key }).catch(() => {});
    }
  };

  iconOpts.forEach(btn => {
    btn.addEventListener('click', () => selectIcon(btn.dataset.icon));
  });

  // Restore saved icon selection highlight on load
  const savedIcon = localStorage.getItem('weibo_icon') || 'weibo_block-normal';
  iconOpts.forEach(btn => btn.classList.toggle('selected', btn.dataset.icon === savedIcon));

  // ── Cache Cleaner ────────────────────────────────────────────
  const btnClearData = document.getElementById('btnClearData');

  btnClearData?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all cache and cookies? This will log you out of Weibo.')) {
      if (window.__TAURI__?.core?.invoke) {
        try {
          await window.__TAURI__.core.invoke('clear_webview_data');
          alert('Browsing data cleared successfully! The app will reload.');
          // Reload the main window webview
          await window.__TAURI__.core.invoke('reload_weibo');
          // Reload this settings window
          location.reload();
        } catch (e) {
          alert('Failed to clear browsing data: ' + e);
        }
      }
    }
  });
});
