#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem, Submenu},
    Manager,
};
use log::{info, warn};
use tauri_plugin_log::{LogTarget, Builder as LogBuilder};

// Entrypoint for the Tauri v2 application
fn main() {
    tauri::Builder::default()
        .plugin(
            LogBuilder::default()
                .targets([
                    LogTarget::LogDir,
                    LogTarget::Stdout,
                    // LogTarget::Webview,
                ])
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .menu(|app| {
            let open = MenuItem::with_id(
                app,
                "open_devtools",
                "Ouvrir DevTools (F12)",
                true,
                None::<&str>,
            )?;
            let help = Submenu::new(app, "Aide", true)?;
            help.append_items(&[&open])?;
            Menu::with_items(app, &[&help])
        })
        .on_menu_event(|app, event| {
            if event.id().as_ref() == "open_devtools" {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.set_focus();
                }
            }
        })
        .setup(|app| {
            info!("Tauri app starting…");
            if let Some(w) = app.get_webview_window("main") {
                info!("Main webview acquired: {:?}", w.label());
                #[cfg(debug_assertions)]
                {
                    let _ = w.set_focus();
                    tauri::async_runtime::spawn(async {
                        tauri::async_runtime::sleep(std::time::Duration::from_millis(150)).await;
                        let _ = w.emit("app:ready", "tauri-main-ready");
                    });
                    println!("[mamastock] main window ready (debug)");
                }
            } else {
                warn!("Main webview not found at setup.");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
