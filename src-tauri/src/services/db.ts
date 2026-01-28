import Database from '@tauri-apps/plugin-sql';

// Tên file database (sẽ được lưu trong thư mục App Data của máy tính)
const DB_NAME = 'sqlite:dinofocus.db';

// Khởi tạo Database và Bảng
export const initDB = async () => {
  try {
    const db = await Database.load(DB_NAME);

    // 1. Bảng TASKS (Công việc)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT,
        board_id TEXT,
        priority TEXT,
        due_date TEXT,
        start_date TEXT,
        description TEXT,
        color TEXT,
        created_at TEXT,
        subtasks TEXT -- Lưu dạng JSON string
      )
    `);

    // 2. Bảng BOARDS (Bảng Kanban)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        is_default INTEGER, -- 0 or 1
        columns TEXT -- Lưu cấu hình cột dạng JSON string
      )
    `);

    // 3. Bảng NOTES (Sticky Notes)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        x REAL,
        y REAL,
        width REAL,
        height REAL,
        color_bg TEXT,
        color_border TEXT,
        text_color TEXT,
        is_bold INTEGER,
        is_italic INTEGER,
        is_underline INTEGER,
        rotate REAL
      )
    `);

    // 4. Bảng USER_PROFILE (Thông tin & Cài đặt)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1), -- Chỉ có 1 user
        username TEXT,
        bio TEXT,
        avatar_url TEXT,
        password TEXT,
        joined_at TEXT,
        is_setup INTEGER,
        settings TEXT -- Lưu JSON setting (sound, goal...)
      )
    `);

    console.log("Database initialized successfully!");
    return db;
  } catch (error) {
    console.error("Failed to init DB:", error);
    return null;
  }
};

// --- API HELPER FUNCTIONS ---

export const getDb = async () => await Database.load(DB_NAME);

// Ví dụ hàm lấy Tasks
export const getAllTasks = async () => {
    const db = await getDb();
    const result = await db.select("SELECT * FROM tasks");
    // Parse JSON subtasks
    return result.map((t: any) => ({
        ...t,
        boardId: t.board_id,
        dueDate: t.due_date,
        startDate: t.start_date,
        createdAt: t.created_at,
        subtasks: t.subtasks ? JSON.parse(t.subtasks) : []
    }));
};

// Các hàm CRUD khác sẽ được thêm vào khi tích hợp vào App.tsx