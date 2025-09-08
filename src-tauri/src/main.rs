#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::menu::{MenuBuilder, SubmenuBuilder, MenuItemBuilder};
use tauri::{AppHandle, Manager, Wry};

fn build_menu(app: &AppHandle<Wry>) -> tauri::Result<()> {
    let open_devtools = MenuItemBuilder::new("Ouvrir DevTools")
        .id("open_devtools")
        .build(app)?;
    let debug = SubmenuBuilder::new(app, "Débogage")
        .item(&open_devtools)
        .build()?;
    let menu = MenuBuilder::new(app)
        .items(&[&debug])
        .build()?;
    app.set_menu(menu)?;
    Ok(())
}

fn on_menu(app: &AppHandle<Wry>, ev: &tauri::menu::MenuEvent) {
    if ev.id().as_ref() == "open_devtools" {
        if let Some(w) = app.get_webview_window("main") {

        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_devtools::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            build_menu(&app.handle())?;
            app.on_menu_event(|app, ev| on_menu(app, &ev));

            // Event venant du frontend (F12)
            let h = app.handle();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("erreur au lancement de Tauri");
}

