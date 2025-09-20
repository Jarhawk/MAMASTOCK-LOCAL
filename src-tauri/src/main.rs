#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use serde_json::{json, Map, Value};
use std::{
    fs, io,
    path::{Path, PathBuf},
};
use tauri::Manager;
use tauri_plugin_fs;
use tauri_plugin_sql;

#[allow(dead_code)]
#[derive(Serialize)]
struct DbCfg {
    db_url: String,
}

fn config_base_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        let base = std::env::var_os("PROGRAMDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("C:\\ProgramData"));
        return base.join("MAMASTOCK");
    }

    #[cfg(not(target_os = "windows"))]
    {
        if let Some(dir) = std::env::var_os("MAMASTOCK_CONFIG_DIR") {
            return PathBuf::from(dir);
        }
        if let Some(dir) = std::env::var_os("XDG_CONFIG_HOME") {
            return PathBuf::from(dir).join("mamastock");
        }
        if let Some(home) = std::env::var_os("HOME") {
            return PathBuf::from(home).join(".config").join("mamastock");
        }
        PathBuf::from(".")
    }
}

fn config_file_path() -> PathBuf {
    let mut path = config_base_dir();
    path.push("config.json");
    path
}

fn read_config_url_from_path(path: &Path) -> Option<String> {
    let content = fs::read_to_string(path).ok()?;
    let parsed: Value = serde_json::from_str(&content).ok()?;
    read_url_from_value(&parsed)
}

fn is_supported_db_url(raw: &str) -> bool {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return false;
    }
    trimmed
        .to_ascii_lowercase()
        .starts_with("sqlite:")
}

fn normalize_config(value: &mut Value) -> bool {
    if !value.is_object() {
        *value = Value::Object(Map::new());
    }

    let obj = value.as_object_mut().expect("value coerced to object");
    let mut changed = false;

    for key in ["pgUrl", "dbUrl"] {
        if let Some(url_value) = obj.get(key).and_then(|v| v.as_str()) {
            if !is_supported_db_url(url_value) {
                obj.remove(key);
                changed = true;
            }
        }
    }

    match obj.get_mut("db") {
        Some(Value::Object(db_obj)) => {
            if let Some(url_value) = db_obj.get("url").and_then(|v| v.as_str()) {
                if !is_supported_db_url(url_value) {
                    db_obj.remove("url");
                    changed = true;
                }
            }
            if let Some(db_type) = db_obj.get("type").and_then(|v| v.as_str()) {
                if !db_type.eq_ignore_ascii_case("sqlite") {
                    db_obj.insert("type".into(), Value::String("sqlite".into()));
                    changed = true;
                }
            } else {
                db_obj.insert("type".into(), Value::String("sqlite".into()));
                changed = true;
            }
        }
        Some(_) => {
            obj.insert("db".into(), Value::Object(Map::new()));
            changed = true;
        }
        None => {
            obj.insert("db".into(), Value::Object(Map::new()));
            changed = true;
        }
    }

    if let Some(db_obj) = obj.get_mut("db").and_then(|v| v.as_object_mut()) {
        if !db_obj.contains_key("type") {
            db_obj.insert("type".into(), Value::String("sqlite".into()));
            changed = true;
        }
    }

    changed
}

fn default_config_payload() -> Value {
    json!({
        "db": {
            "type": "sqlite",
        }
    })
}

fn sanitize_existing_config(path: &Path) -> io::Result<()> {
    let text = match fs::read_to_string(path) {
        Ok(content) => content,
        Err(_) => return Ok(()),
    };
    let mut parsed: Value = match serde_json::from_str(&text) {
        Ok(value) => value,
        Err(_) => Value::Object(Map::new()),
    };
    if normalize_config(&mut parsed) {
        let formatted = serde_json::to_string_pretty(&parsed)?;
        fs::write(path, formatted)?;
    }
    Ok(())
}

fn ensure_default_config() -> io::Result<()> {
    let path = config_file_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    if !path.exists() {
        let mut payload = default_config_payload();
        normalize_config(&mut payload);
        let formatted = serde_json::to_string_pretty(&payload)?;
        fs::write(&path, formatted)?;
        return Ok(());
    }

    sanitize_existing_config(&path)?;

    Ok(())
}

#[tauri::command]
fn get_db_url() -> Option<String> {
    let path = config_file_path();
    if let Some(url) = read_config_url_from_path(&path) {
        if is_supported_db_url(&url) {
            return Some(url);
        }
    }

    let env_vars = ["MAMASTOCK_DB_URL", "DATABASE_URL", "MAMASTOCK_PGURL", "PGURL"];
    for key in env_vars {
        if let Ok(url) = std::env::var(key) {
            if is_supported_db_url(&url) {
                let trimmed = url.trim();
                if !trimmed.is_empty() {
                    return Some(trimmed.to_string());
                }
            }
        }
    }

    None
}

fn pick_supported_url(value: Option<&Value>) -> Option<String> {
    let raw = value?.as_str()?;
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return None;
    }
    if is_supported_db_url(trimmed) {
        return Some(trimmed.to_string());
    }
    None
}

fn read_url_from_value(value: &Value) -> Option<String> {
    if let Some(url) = pick_supported_url(value.get("dbUrl")) {
        return Some(url);
    }
    if let Some(url) = pick_supported_url(value.get("pgUrl")) {
        return Some(url);
    }
    if let Some(obj) = value.get("db").and_then(|v| v.as_object()) {
        if let Some(url) = pick_supported_url(obj.get("url")) {
            return Some(url);
        }
    }
    None
}

#[tauri::command]
fn get_db_config_path() -> String {
    config_file_path().to_string_lossy().to_string()
}

#[tauri::command]
fn set_db_url(url: String) -> Result<(), String> {
    let trimmed = url.trim();
    if trimmed.is_empty() {
        return Err("URL SQLite invalide".into());
    }

    if !is_supported_db_url(trimmed) {
        return Err("Seules les URL sqlite: sont prises en charge".into());
    }

    let path = config_file_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }

    let existing = fs::read_to_string(&path).ok();
    let mut root = existing
        .and_then(|text| serde_json::from_str::<Value>(&text).ok())
        .unwrap_or_else(|| Value::Object(Map::new()));

    if !root.is_object() {
        root = Value::Object(Map::new());
    }

    let obj = root.as_object_mut().expect("root ensured to be object");
    obj.remove("pgUrl");
    obj.insert("dbUrl".into(), Value::String(trimmed.to_string()));

    let db_entry = obj
        .entry("db")
        .or_insert_with(|| Value::Object(Map::new()));
    if let Some(db_obj) = db_entry.as_object_mut() {
        db_obj.insert("type".into(), Value::String("sqlite".into()));
        db_obj.insert("url".into(), Value::String(trimmed.to_string()));
    } else {
        let mut map = Map::new();
        map.insert("type".into(), Value::String("sqlite".into()));
        map.insert("url".into(), Value::String(trimmed.to_string()));
        obj.insert("db".into(), Value::Object(map));
    }

    let payload = serde_json::to_string_pretty(&root).map_err(|err| err.to_string())?;
    fs::write(&path, payload).map_err(|err| err.to_string())?;
    Ok(())
}

fn main() {
    if let Err(err) = ensure_default_config() {
        eprintln!("[config] Failed to prepare default config: {err}");
    }

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![
            get_db_url,
            get_db_config_path,
            set_db_url
        ]);

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(tauri_plugin_devtools::init());
    }

    #[cfg(not(debug_assertions))]
    {
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
