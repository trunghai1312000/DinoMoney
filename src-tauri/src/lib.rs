use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

// Lệnh thoát hẳn ứng dụng (Dùng cho nút Power)
#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

// Lệnh ẩn ứng dụng xuống Tray (Dùng cho nút X hoặc Minimize)
#[tauri::command]
fn hide_app(window: tauri::Window) {
    window.hide().unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![quit_app, hide_app])
        .setup(|app| {
            // Tạo Menu cho Tray
            let quit_i = MenuItem::with_id(app, "quit", "Thoát DinoMoney", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Hiện DinoMoney", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            // Cấu hình Tray Icon
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| match event {
                    // Click chuột trái vào icon tray để hiện app
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        // Chặn sự kiện đóng cửa sổ (ví dụ Alt+F4) để chuyển thành ẩn
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}