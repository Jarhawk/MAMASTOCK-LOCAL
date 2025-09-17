#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use serde_json::{Map, Value};
use std::{fs, path::{Path, PathBuf}};
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

fn read_url_from_value(value: &Value) -> Option<String> {
    if let Some(url) = value.get("dbUrl").and_then(|v| v.as_str()) {
        let trimmed = url.trim();
        if !trimmed.is_empty() {
            return Some(trimmed.to_string());
        }
    }
    if let Some(obj) = value.get("db").and_then(|v| v.as_object()) {
        if let Some(url) = obj.get("url").and_then(|v| v.as_str()) {
            let trimmed = url.trim();
            if !trimmed.is_empty() {
                return Some(trimmed.to_string());
            }
        }
    }
    None
}

fn read_config_url_from_path(path: &Path) -> Option<String> {
    let content = fs::read_to_string(path).ok()?;
    let parsed: Value = serde_json::from_str(&content).ok()?;
    read_url_from_value(&parsed)
}

#[tauri::command]
fn get_db_url() -> Option<String> {
    if let Ok(url) = std::env::var("MAMASTOCK_PGURL") {
        let trimmed = url.trim();
        if !trimmed.is_empty() {
            return Some(trimmed.to_string());
        }
    }

    let path = config_file_path();
    read_config_url_from_path(&path)
}

#[tauri::command]
fn get_db_config_path() -> String {
    config_file_path().to_string_lossy().to_string()
}

#[tauri::command]
fn set_db_url(url: String) -> Result<(), String> {
    let trimmed = url.trim();
    if trimmed.is_empty() {
        return Err("URL PostgreSQL invalide".into());
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
    obj.insert("dbUrl".into(), Value::String(trimmed.to_string()));

    let db_entry = obj
        .entry("db".into())
        .or_insert_with(|| Value::Object(Map::new()));
    if let Some(db_obj) = db_entry.as_object_mut() {
        db_obj.insert("type".into(), Value::String("postgres".into()));
        db_obj.insert("url".into(), Value::String(trimmed.to_string()));
    } else {
        let mut map = Map::new();
        map.insert("type".into(), Value::String("postgres".into()));
        map.insert("url".into(), Value::String(trimmed.to_string()));
        obj.insert("db".into(), Value::Object(map));
    }

    let payload = serde_json::to_string_pretty(&root).map_err(|err| err.to_string())?;
    fs::write(&path, payload).map_err(|err| err.to_string())?;
    Ok(())
}

fn main() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .invoke_handler(tauri::generate_handler![get_db_url, get_db_config_path, set_db_url]);

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
