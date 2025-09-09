#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
  tauri::Builder::default()
    // === Plugins côté Rust ===
    // FS en DEV + PROD
    .plugin(tauri_plugin_fs::init())

    // Log seulement en release (évite "logger already initialized")
    #[cfg(not(debug_assertions))]
    .plugin(tauri_plugin_log::Builder::default().build())

    .setup(|app| {
      // DevTools seulement en DEV
      #[cfg(debug_assertions)]
      if let Some(w) = app.get_webview_window("main") {
        w.open_devtools();
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("erreur au lancement de Tauri");
}
