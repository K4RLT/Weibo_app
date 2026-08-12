// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{image::Image, Manager};

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

fn main() {
    let saved_key = read_saved_icon_key();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![set_app_icon])
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
