#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Listener, Manager};

fn main() -> tauri::Result<()> {
    tauri::Builder::default()
        // Plugin de logs (écrit côté disque via la config par défaut)
        .plugin(tauri_plugin_log::Builder::default().build())
        .setup(|app| {
            // Écoute un évènement envoyé depuis le front: emit('open-devtools')
            let handle = app.handle().clone();
            app.listen("open-devtools", move |_payload| {
                if let Some(w) = handle.get_webview_window("main") {
                    // Ouvre DevTools uniquement si la feature 'devtools' est activée côté Rust
                    #[cfg(feature = "devtools")]
                    {
                        let _ = w.open_devtools();
                    }
                    let _ = w.set_focus();
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
}
