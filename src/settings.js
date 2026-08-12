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
      window.__TAURI__.core.invoke('set_app_icon', { iconKey: key }).catch(() => {});
    }
  };

  iconOpts.forEach(btn => {
    btn.addEventListener('click', () => selectIcon(btn.dataset.icon));
  });

  // Restore saved icon selection highlight on load
  const savedIcon = localStorage.getItem('weibo_icon') || 'weibo_block-normal';
  iconOpts.forEach(btn => btn.classList.toggle('selected', btn.dataset.icon === savedIcon));
});
