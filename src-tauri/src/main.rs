#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem, Submenu},
    Manager,
};
use log::{info, warn};
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

            info!(
                "MamaStock Local started (v{})",
                app.package_info().version
            );
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
