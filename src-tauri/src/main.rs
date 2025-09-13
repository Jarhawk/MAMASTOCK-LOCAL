#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager};
use tauri::window::FileDropEvent;

fn main() {
    let mut builder = tauri::Builder::default();

    // Common plugins (both dev & prod)
    builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build());

    // Dev only
    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(tauri_plugin_devtools::init());
    }

    // Prod only
    #[cfg(not(debug_assertions))]
    {
        builder = builder.plugin(tauri_plugin_log::Builder::default().build());
    }

    builder.setup(|app| {
        if let Some(win) = app.get_webview_window("main") {
            win.on_file_drop(|_w, ev| {
                match ev {
                    FileDropEvent::Hovered { .. } => true,
                    FileDropEvent::Dropped { paths, .. } => {
                        // Autorise UNIQUEMENT les fichiers réguliers (ignore dossiers/URLs/etc.)
                        let only_files = paths.iter().all(|p| p.is_file());
                        only_files
                    }
                    FileDropEvent::Cancelled => true,
                    _ => true,
                }
            });
        }
        Ok(())
    }).expect("setup failed");

    builder
        .run(tauri::generate_context!())
        .expect("erreur au lancement de Tauri");
}
