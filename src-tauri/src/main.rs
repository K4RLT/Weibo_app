// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    image::Image,
    webview::WebviewBuilder,
    Emitter, LogicalPosition, LogicalSize, Manager, Rect, WebviewUrl,
};

// Embedded icon bytes at compile time
static ICON_BLOCK_NORMAL:    &[u8] = include_bytes!("../icons/weibo_block-normal.png");
static ICON_BLOCK_DARK:      &[u8] = include_bytes!("../icons/weibo_block-dark.png");
static ICON_BLOCK_WHITE:     &[u8] = include_bytes!("../icons/weibo_block-white.png");
static ICON_CIRCULAR_NORMAL: &[u8] = include_bytes!("../icons/weibo_circular-normal.png");
static ICON_CIRCULAR_DARK:   &[u8] = include_bytes!("../icons/weibo_circular-dark.png");
static ICON_CIRCULAR_WHITE:  &[u8] = include_bytes!("../icons/weibo_circular-white.png");

fn icon_bytes_for_key(key: &str) -> &'static [u8] {
    match key {
        "weibo_block-dark"      => ICON_BLOCK_DARK,
        "weibo_block-white"     => ICON_BLOCK_WHITE,
        "weibo_circular-normal" => ICON_CIRCULAR_NORMAL,
        "weibo_circular-dark"   => ICON_CIRCULAR_DARK,
        "weibo_circular-white"  => ICON_CIRCULAR_WHITE,
        _                       => ICON_BLOCK_NORMAL, // default
    }
}

fn config_dir() -> Option<std::path::PathBuf> {
    dirs::config_dir().map(|p| p.join("weibo-desktop"))
}

fn read_saved_icon_key() -> String {
    config_dir()
        .and_then(|dir| std::fs::read_to_string(dir.join("icon.txt")).ok())
        .unwrap_or_default()
        .trim()
        .to_string()
}

struct ChildWebviewState {
    created: std::sync::Mutex<bool>,
    is_dark: std::sync::Mutex<bool>,
}

impl Default for ChildWebviewState {
    fn default() -> Self {
        Self {
            created: std::sync::Mutex::new(false),
            is_dark: std::sync::Mutex::new(true),
        }
    }
}

fn get_user_agent() -> &'static str {
    #[cfg(target_os = "linux")]
    {
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
    #[cfg(target_os = "macos")]
    {
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
    #[cfg(target_os = "windows")]
    {
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
}

#[tauri::command]
fn set_webview_bounds(
    window: tauri::Window,
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, ChildWebviewState>,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    let mut created = state.created.lock().map_err(|e| e.to_string())?;

    if !*created {
        let label = "weibo_child";
        let url_str = "https://www.weibo.com";
        let url = url::Url::parse(url_str).map_err(|e| e.to_string())?;

        let ua = get_user_agent();

        let app_handle_clone = app_handle.clone();
        let app_handle_clone2 = app_handle.clone();
        let webview_builder = WebviewBuilder::new(label, WebviewUrl::External(url))
            .user_agent(ua)
            .on_navigation(move |url| {
                let _ = app_handle_clone.emit("weibo-nav", url.as_str());
                true
            })
            .on_page_load(move |webview, payload| {
                if let tauri::webview::PageLoadEvent::Finished = payload.event() {
                    let state = app_handle_clone2.state::<ChildWebviewState>();
                    if let Ok(is_dark) = state.is_dark.lock() {
                        if *is_dark {
                            let css = "html { filter: invert(1) hue-rotate(180deg) !important; } img, video, [style*=\\\"background-image\\\"], .oauth_avatar, .avatar, [class*=\\\"avatar\\\"], .pic, [class*=\\\"pic\\\"] { filter: invert(1) hue-rotate(180deg) !important; }";
                            let js = format!(
                                "(function() {{ \
                                    let style = document.getElementById('weibo-dark-mode-override'); \
                                    if (!style) {{ \
                                        style = document.createElement('style'); \
                                        style.id = 'weibo-dark-mode-override'; \
                                        style.innerHTML = '{}'; \
                                        document.documentElement.appendChild(style); \
                                    }} \
                                }})();",
                                css
                            );
                            let _ = webview.eval(&js);
                        }
                    }
                }
            });

        let position = LogicalPosition::new(x, y);
        let size = LogicalSize::new(width, height);

        window.add_child(webview_builder, position, size).map_err(|e| e.to_string())?;
        *created = true;
    } else {
        if let Some(webview) = window.get_webview("weibo_child") {
            let position = LogicalPosition::new(x, y).into();
            let size = LogicalSize::new(width, height).into();
            webview.set_bounds(Rect { position, size }).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
fn navigate_weibo(app: tauri::AppHandle, url: String) -> Result<(), String> {
    let parsed_url = url::Url::parse(&url).map_err(|e| e.to_string())?;
    let webview = app.get_webview("weibo_child").ok_or("Webview not found")?;
    webview.navigate(parsed_url).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn reload_weibo(app: tauri::AppHandle) -> Result<(), String> {
    let webview = app.get_webview("weibo_child").ok_or("Webview not found")?;
    webview.eval("location.reload()").map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn back_weibo(app: tauri::AppHandle) -> Result<(), String> {
    let webview = app.get_webview("weibo_child").ok_or("Webview not found")?;
    webview.eval("history.back()").map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn forward_weibo(app: tauri::AppHandle) -> Result<(), String> {
    let webview = app.get_webview("weibo_child").ok_or("Webview not found")?;
    webview.eval("history.forward()").map_err(|e| e.to_string())?;
    Ok(())
}

/// JS-callable command: saves icon key to config file so it
/// persists across reboots. The window icon is updated immediately too.
#[tauri::command]
fn set_app_icon(app_handle: tauri::AppHandle, icon_key: String) -> Result<(), String> {
    // Persist the choice
    if let Some(dir) = config_dir() {
        std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        std::fs::write(dir.join("icon.txt"), &icon_key).map_err(|e| e.to_string())?;
    }

    // Apply immediately to all windows
    let bytes = icon_bytes_for_key(&icon_key);
    let image = Image::from_bytes(bytes).map_err(|e| e.to_string())?;

    if let Some(main_win) = app_handle.get_webview_window("main") {
        let _ = main_win.set_icon(image.clone());
    }
    if let Some(settings_win) = app_handle.get_webview_window("settings") {
        let _ = settings_win.set_icon(image);
    }

    Ok(())
}

#[tauri::command]
fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
fn toggle_maximize_window(window: tauri::Window) {
    if let Ok(true) = window.is_maximized() {
        let _ = window.unmaximize();
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
fn close_window(window: tauri::Window) {
    let _ = window.close();
}

#[tauri::command]
fn drag_window(window: tauri::Window) {
    let _ = window.start_dragging();
}

#[tauri::command]
fn open_settings_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(existing) = app_handle.get_webview_window("settings") {
        existing.set_focus().map_err(|e| e.to_string())?;
    } else {
        let main_win = app_handle.get_webview_window("main").ok_or("Main window not found")?;

        let settings_win = tauri::WebviewWindowBuilder::new(
            &app_handle,
            "settings",
            tauri::WebviewUrl::App("settings.html".into()),
        )
        .title("Preferences · 首选项")
        .inner_size(480.0, 520.0)
        .resizable(false)
        .center()
        .skip_taskbar(true)
        .parent(&main_win).map_err(|e| e.to_string())?
        .build()
        .map_err(|e| e.to_string())?;

        // Apply current icon immediately to settings window as well
        let saved_key = read_saved_icon_key();
        let bytes = icon_bytes_for_key(&saved_key);
        if let Ok(image) = Image::from_bytes(bytes) {
            let _ = settings_win.set_icon(image);
        }
    }
    Ok(())
}

#[tauri::command]
fn apply_weibo_theme(
    app: tauri::AppHandle,
    state: tauri::State<'_, ChildWebviewState>,
    is_dark: bool,
) -> Result<(), String> {
    if let Ok(mut is_dark_guard) = state.is_dark.lock() {
        *is_dark_guard = is_dark;
    }

    if let Some(webview) = app.get_webview("weibo_child") {
        let css = "html { filter: invert(1) hue-rotate(180deg) !important; } img, video, [style*=\\\"background-image\\\"], .oauth_avatar, .avatar, [class*=\\\"avatar\\\"], .pic, [class*=\\\"pic\\\"] { filter: invert(1) hue-rotate(180deg) !important; }";
        let js = format!(
            "(function() {{ \
                let style = document.getElementById('weibo-dark-mode-override'); \
                if ({}) {{ \
                    if (!style) {{ \
                        style = document.createElement('style'); \
                        style.id = 'weibo-dark-mode-override'; \
                        style.innerHTML = '{}'; \
                        document.documentElement.appendChild(style); \
                    }} \
                }} else {{ \
                    if (style) {{ \
                        style.remove(); \
                    }} \
                }} \
            }})();",
            is_dark, css
        );
        let _ = webview.eval(&js);
    }

    // Also update the native window themes
    let theme = if is_dark { tauri::Theme::Dark } else { tauri::Theme::Light };
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.set_theme(Some(theme));
    }
    if let Some(settings_win) = app.get_webview_window("settings") {
        let _ = settings_win.set_theme(Some(theme));
    }

    Ok(())
}

#[tauri::command]
fn clear_webview_data(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(webview) = app.get_webview("weibo_child") {
        webview.clear_all_browsing_data().map_err(|e| e.to_string())?;
    }
    if let Some(main_win) = app.get_webview_window("main") {
        main_win.clear_all_browsing_data().map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn main() {
    let saved_key = read_saved_icon_key();

    tauri::Builder::default()
        .manage(ChildWebviewState::default())
        .invoke_handler(tauri::generate_handler![
            set_app_icon,
            set_webview_bounds,
            navigate_weibo,
            reload_weibo,
            back_weibo,
            forward_weibo,
            minimize_window,
            toggle_maximize_window,
            close_window,
            drag_window,
            open_settings_window,
            apply_weibo_theme,
            clear_webview_data
        ])
        .setup(move |app| {
            // Apply saved icon on startup
            if let Some(window) = app.get_webview_window("main") {
                let bytes = icon_bytes_for_key(&saved_key);
                if let Ok(image) = Image::from_bytes(bytes) {
                    let _ = window.set_icon(image);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Weibo Desktop application");
}
