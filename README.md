# Weibo Desktop (Unofficial) 🚀

[![Build Desktop App](https://github.com/K4RLT/Weibo_app/actions/workflows/build.yml/badge.svg)](https://github.com/K4RLT/Weibo_app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-v2-blueviolet.svg)](https://tauri.app)

> **Disclaimer**: This is an **unofficial**, lightweight desktop application for Weibo (新浪微博). It was originally intended for personal use to provide a clean, distraction-free desktop experience. Contributions, feedback, and pull requests are very much appreciated!

---

## 🌟 Key Features

- ⚡ **Ultra-Lightweight & Fast**: Built on Tauri v2 (~30MB memory footprint, fractional compared to traditional Electron apps).
- 🛡️ **Sandboxed & Persistent Session**: Dedicated storage environment keeps your login state secure and logged in across sessions.
- 🎨 **Modern Desktop Dashboard**:
  - Custom Navigation Controls (Back, Forward, Refresh, Home, Zoom).
  - One-click **Desktop vs. Mobile View** layout switcher.
  - Quick **Dark Theme** / High-Contrast mode toggle.
  - Distraction-Free mode hiding banner ads & irrelevant sidebar modules.
- 🔔 **System Tray Integration**: Minimize to tray and background run capability.
- ☁️ **Zero-Local-Footprint CI/CD**: Cloud compilation via GitHub Actions (no need to install Rust or Node locally).

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

## 🛠️ Local Running & Alternatives

### Option A: PyWebView (Zero-Build Python Launcher)
If you want to run the app instantly on Linux/macOS using standard Python:

```bash
cd launcher
pip install -r requirements.txt
python app.py
```

### Option B: Docker Container Build
To compile the Tauri binary locally without polluting your host OS:

```bash
docker-compose up --build
```
Compiled binaries will appear in `./dist/`.

---

## 🤝 Contributing

Contributions are warmly welcome! Feel free to:
- Open an [Issue](https://github.com/K4RLT/Weibo_app/issues) for bug reports or feature requests.
- Submit a [Pull Request](https://github.com/K4RLT/Weibo_app/pulls) to improve UI, add custom CSS, or enhance features.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
