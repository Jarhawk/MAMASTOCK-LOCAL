#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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
        // CODEREVIEW: enable logs in release to diagnose startup issues
        builder = builder.plugin(
            tauri_plugin_log::Builder::default()
                .clear_targets()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("app".into()),
                    },
                ))
                .level(log::LevelFilter::Debug)
                .build(),
        );
    }

    builder
        .run(tauri::generate_context!())
        .expect("erreur au lancement de Tauri");
}
