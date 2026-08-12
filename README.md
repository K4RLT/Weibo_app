# Weibo Desktop (Unofficial) 🚀

[![Build Desktop App](https://github.com/K4RLT/Weibo_app/actions/workflows/build.yml/badge.svg)](https://github.com/K4RLT/Weibo_app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-v2-blueviolet.svg)](https://tauri.app)

> **Disclaimer**: This is an **unofficial**, feature-rich desktop application for Weibo (新浪微博), inspired by native Linux desktop wrappers like Notion-for-Linux. It was originally intended for personal use to provide a clean, distraction-free desktop experience. Contributions, feedback, and pull requests are very much appreciated!

---

## 🌟 Feature Breakdown (Inspired by Notion-for-Linux)

### 🎨 Custom Design & Multi-Theme Engine
- **Sidebar Dock Navigation**: Quick access to Feed, Hot Search (微博热搜), Messages, Favorites, Profile, and SSO Login.
- **Multiple Themes**:
  - 🌙 **Dark Mode (Default)**: Sleek, eye-friendly dark grey interface.
  - ☀️ **Light Clean Theme**: Crisp, minimal light layout.
  - 🖤 **AMOLED Pitch Black**: Deep black theme optimized for OLED displays.
  - 🍊 **Signature Weibo Orange**: Vibrant custom accent styling.

### 🔑 Seamless Authentication & Persistence
- **One-Click Passport SSO Login**: Built-in access to `passport.weibo.com` for instant QR / SMS sign-in.
- **Sandboxed Cookies & Storage**: Keeps your login session permanently saved across app restarts.

### ⌨️ Global Hotkeys & Productivity
- `Ctrl + R` / `F5` — Reload current page
- `Ctrl + H` — Go to Home Feed
- `Ctrl + L` — Quick SSO Login
- `Ctrl + + / -` — Zoom In / Zoom Out
- `Ctrl + Shift + C` — Toggle Clean / Ad-Block Mode
- `Alt + Left / Right` — Back / Forward Navigation

### ⚙️ Preferences Drawer
- Interactive preferences modal allowing you to switch themes, select User Agents (Desktop, Mobile, iPad), and toggle Ad-blocking filters.

---

## 📦 Downloads & Releases

Pre-compiled standalone binaries for **Linux** (`.AppImage`, `.deb`), **Windows** (`.exe`), and **macOS** (`.dmg`) are automatically built via GitHub Actions.

👉 **[Download Latest Releases](https://github.com/K4RLT/Weibo_app/releases)**

---

## 🚀 Cloud Build via GitHub Actions

This repository uses **GitHub Actions** (`.github/workflows/build.yml`) to compile desktop executables in the cloud automatically.

### How to trigger a cloud build:
1. Push any commit to the `main` branch, or create a git release tag (e.g. `v1.0.0`).
2. GitHub Actions will spin up cloud runners for Linux, Windows, and macOS, compile the binaries, and upload them to the **Releases** tab.

---

## 🤝 Contributing

Contributions are warmly welcome! Feel free to:
- Open an [Issue](https://github.com/K4RLT/Weibo_app/issues) for bug reports or feature requests.
- Submit a [Pull Request](https://github.com/K4RLT/Weibo_app/pulls) to improve UI, add custom CSS, or enhance features.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
