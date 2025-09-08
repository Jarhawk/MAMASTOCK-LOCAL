// src-tauri/src/main.rs

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
  Manager,            // get_webview_window, set_menu, etc.
  Listener,           // .listen(...)
  menu::{MenuBuilder, SubmenuBuilder, MenuItemBuilder},
};

fn main() -> tauri::Result<()> {
  tauri::Builder::default()
    .setup(|app| {
      // ----- Menu "Débogage" -----
      let open_devtools = MenuItemBuilder::with_id("open-devtools", "Ouvrir DevTools")
        .accelerator("F12")
        .build(app)?; // <= passer app ici

      let debug_submenu = SubmenuBuilder::new(app, "Débogage")
        .item(&open_devtools)     // <= .item (pas .add_item)
        .build(app)?;             // <= passer app ici

      let app_menu = MenuBuilder::new(app)
        .submenu(&debug_submenu)  // <= .submenu (pas .add_submenu)
        .build(app)?;             // <= passer app ici

      app.set_menu(app_menu)?;

      // ----- Écoute des clics de menu -----
      app.on_menu_event(|app, event| {
        if event.id() == "open-devtools" {
          if let Some(w) = app.get_webview_window("main") {
            #[cfg(feature = "devtools")]
            {
              let _ = w.open_devtools();
            }
            let _ = w.set_focus();
          }
        }
      });

      // ----- Événement custom depuis le front (emit('open-devtools')) -----
      app.listen("open-devtools", move |_payload| {
        if let Some(w) = app.get_webview_window("main") {
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
