use tauri::{
  Manager, Listener,
  menu::{MenuBuilder, SubmenuBuilder, MenuItemBuilder},
};

#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
  tauri::Builder::default()
    .setup(|app| {
      // --- MENU ---
      let open_devtools = MenuItemBuilder::with_id("open-devtools", "Ouvrir DevTools")
        .accelerator("F12")
        .build(app)?; // passer le manager (app) en Tauri v2

      let outils = SubmenuBuilder::new(app, "Outils")
        .items(&[&open_devtools])
        .build()?;

      let menu = MenuBuilder::new(app)
        .items(&[&outils])
        .build()?;
      app.set_menu(menu)?;

      // --- MENU HANDLER ---
      app.on_menu_event(|app, event| {
        if event.id().as_ref() == "open-devtools" {
          if let Some(w) = app.get_webview_window("main") {
            #[cfg(feature = "devtools")]
            {
              let _ = w.open_devtools();
              let _ = w.set_focus();
            }
          }
        }
      });

      // --- EVENT FRONT -> BACK ---
      let handle = app.handle();
      app.listen("open-devtools", move |_payload| {
        if let Some(w) = handle.get_webview_window("main") {
          #[cfg(feature = "devtools")]
          {
            let _ = w.open_devtools();
            let _ = w.set_focus();
          }
        }
      });

      Ok(())
    })
    .plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .targets([
          tauri_plugin_log::Target::LogDir,   // fichier sur disque
          tauri_plugin_log::Target::Stdout,   // console
          tauri_plugin_log::Target::Webview,  // récupère console.log du front
        ])
        .build()
    )
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_sql::init())
    .plugin(tauri_plugin_dialog::init())
    .run(tauri::generate_context!())
    .expect("error while running mamastock");
}
