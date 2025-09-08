#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    let mut builder = tauri::Builder::default();

    #[cfg(debug_assertions)]
    {
        // DevTools seulement en développement
        builder = builder.plugin(tauri_plugin_devtools::init());
    }

    #[cfg(not(debug_assertions))]
    {
        // Logger uniquement en release
        builder = builder.plugin(tauri_plugin_log::Builder::default().build());
    }

    builder
        .setup(|_app| {
            // setup personnalisé si besoin
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("erreur au lancement de Tauri");
}

