#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem, Submenu},
    Manager,
};

// Entrypoint for the Tauri v2 application
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .menu(|app| {
            let open = MenuItem::with_id(app, "open_devtools", "Ouvrir DevTools (F12)", true, None::<&str>)?;
            let help = Submenu::new(app, "Aide", true)?;
            help.append_items(&[&open])?;
            Menu::with_items(app, &[&help])
        })
        .on_menu_event(|app, event| {
            if event.id().as_ref() == "open_devtools" {
                if let Some(w) = app.get_webview_window("main") {
                    w.open_devtools();
                    let _ = w.focus();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
