#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::{info, warn};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    Manager,
};
use tauri_plugin_log::{Builder as LogBuilder, Target, TargetKind};

// Entrypoint for the Tauri v2 application
fn main() {
    tauri::Builder::default()
        .plugin(
            LogBuilder::new()
                // write to the OS log dir + also to stdout and the webview console
                .targets([
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                ])
                .level(log::LevelFilter::Info) // set to Debug for more verbosity
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .menu(|app| {
            let affichage = SubmenuBuilder::new(app, "Affichage")
                .item(
                    &MenuItemBuilder::new("Ouvrir DevTools")
                        .id("devtools")
                        .build()?,
                )
                .build()?;
            MenuBuilder::new(app).items(&[&affichage]).build()
        })
        .setup(|app| {
            let handle = app.handle();
            app.on_menu_event(move |app, event| {
                if event.id() == "devtools" {
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.open_devtools();
                        let _ = w.set_focus();
                    }
                }
            });

            let app_handle = app.handle();
            app.on_window_event(move |_w, e| if let tauri::WindowEvent::FileDrop(_) = e {});
            app.listen("open-devtools", move |_payload| {
                if let Some(w) = app_handle.get_webview_window("main") {
                    let _ = w.open_devtools();
                    let _ = w.set_focus();
                }
            });

            if let Ok(dir) = app.path().app_log_dir() {
                info!("Log directory: {}", dir.display());
            } else {
                info!("No app_log_dir available (using defaults)");
            }

            if let Some(main) = app.get_webview_window("main") {
                let _ = main.set_focus();
                info!("Main webview acquired");
                #[cfg(debug_assertions)]
                {
                    let main_cloned = main.clone();
                    tauri::async_runtime::spawn(async move {
                        tauri::async_runtime::sleep(std::time::Duration::from_millis(150)).await;
                        let _ = main_cloned.emit("app:ready", "tauri-main-ready");
                    });
                    println!("[mamastock] main window ready (debug)");
                }
            } else {
                warn!("Main webview not found at setup.");
            }

            info!("MamaStock Local started (v{})", app.package_info().version);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
