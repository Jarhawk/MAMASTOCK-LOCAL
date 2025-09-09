#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    let mut builder = tauri::Builder::default();

    // Plugins communs (dev + prod)
    builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init());

    // Dev uniquement (évite les conflits de logger)
    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(tauri_plugin_devtools::init());
    }

    // Prod uniquement (logger)
    #[cfg(not(debug_assertions))]
    {
        builder = builder.plugin(tauri_plugin_log::Builder::default().build());
    }

    builder
        .run(tauri::generate_context!())
        .expect("erreur au lancement de Tauri");
}

