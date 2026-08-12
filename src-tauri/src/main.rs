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

struct ChildWebviewState(std::sync::Mutex<bool>);

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
    let mut created = state.0.lock().map_err(|e| e.to_string())?;

    if !*created {
        let label = "weibo_child";
        let url_str = "https://www.weibo.com";
        let url = url::Url::parse(url_str).map_err(|e| e.to_string())?;

        let ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

        let app_handle_clone = app_handle.clone();
        let webview_builder = WebviewBuilder::new(label, WebviewUrl::External(url))
            .user_agent(ua)
            .on_navigation(move |url| {
                let _ = app_handle_clone.emit("weibo-nav", url.as_str());
                true
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
fn set_app_icon(window: tauri::Window, icon_key: String) -> Result<(), String> {
    // Persist the choice
    if let Some(dir) = config_dir() {
        std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        std::fs::write(dir.join("icon.txt"), &icon_key).map_err(|e| e.to_string())?;
    }

    // Apply immediately to the window titlebar icon
    let bytes = icon_bytes_for_key(&icon_key);
    let image = Image::from_bytes(bytes).map_err(|e| e.to_string())?;
    window.set_icon(image).map_err(|e| e.to_string())?;

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
        tauri::WebviewWindowBuilder::new(
            &app_handle,
            "settings",
            tauri::WebviewUrl::App("settings.html".into()),
        )
        .title("Preferences · 首选项")
        .inner_size(480.0, 520.0)
        .resizable(false)
        .center()
        .build()
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn main() {
    let saved_key = read_saved_icon_key();

    tauri::Builder::default()
        .manage(ChildWebviewState(std::sync::Mutex::new(false)))
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
            open_settings_window
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
