#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Entrypoint for the Tauri v2 application
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
