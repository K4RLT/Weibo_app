# UI & Architecture Rules — Weibo Desktop App

## 🎨 UI Design Principles (Inspired by Notion for Linux & QQ Desktop)

1. **Zero Artificial / Generated Assets**:
   - Never use fake placeholder logos, generated canvas shapes, or cheap emojis in buttons.
   - Use vector SVG paths, Google Material Symbols Rounded, or official brand icons (`icons/weibo_circular-*.png`).

2. **Ultra-Slim Modern Sidebar Dock**:
   - Width: `50px` – `54px` (compact, non-intrusive strip).
   - Icon-only layout with crisp tooltips (no bulky text labels below icons taking up space).
   - Smooth hover backdrops (`rgba(255,255,255,0.06)`), accent active pill indicators.

3. **Frameless Seamless Integration**:
   - Custom titlebar height: `34px`, blending seamlessly into the app canvas.
   - Minimalist window control buttons (minimize, maximize, close) on the top right.
   - Burger menu (`≡`) integrated smoothly into the titlebar / sidebar header.

4. **Clean Webview Containment**:
   - Clean background colors matching dark mode (`#0d1117` / `#161b22`) and light mode (`#f4f5f8`).
   - Auto-hide sidebar during login flow for a dedicated compact login dialog experience.
