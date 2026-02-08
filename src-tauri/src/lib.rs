#[cfg_attr(mobile, tauri::mobile_entry_point)]

use tauri::{
    tray::{TrayIconBuilder, TrayIconEvent},
    Manager,
};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())

        // --- QUAN TRỌNG: Dòng này đăng ký plugin SQL ---
        .plugin(tauri_plugin_sql::Builder::default().build()) 
        // -----------------------------------------------
        

        //system-tray
        .setup(|app| {
            // ===== SYSTEM TRAY =====
            let _tray_icon = tauri::tray::TrayIconBuilder::new()
            .icon(app.default_window_icon().unwrap().clone())
            .on_tray_icon_event(|window, event| {
                // Logic click để hiện lại app
                if let tauri::tray::TrayIconEvent::Click { .. } = event {
                    let win = window.app_handle().get_webview_window("main").unwrap();
                    win.show().unwrap();
                    win.unminimize().unwrap();
                    win.set_focus().unwrap();
                }
            })
            .build(app)?;

            // ===== HIDE TO TRAY (TAURI 2.x CORRECT WAY) =====
            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();

                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = window_clone.hide();
                    }
                });
            }

            Ok(())
        })


        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}