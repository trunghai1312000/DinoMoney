import Database from '@tauri-apps/plugin-sql';
import { Task, Board, UserProfile } from '../types';

const DB_NAME = 'sqlite:dinofocus.db';

// --- KHỞI TẠO DB & BẢNG ---
export const initDB = async () => {
  try {
    const db = await Database.load(DB_NAME);

    // 1. Bảng USER (Chỉ lưu 1 dòng duy nhất)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        username TEXT,
        bio TEXT,
        avatar_url TEXT,
        password TEXT,
        joined_at TEXT,
        settings TEXT -- JSON string
      )
    `);

    // 2. Bảng BOARDS
    await db.execute(`
      CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        title TEXT,
        is_default INTEGER,
        columns TEXT -- JSON string
      )
    `);

    // 3. Bảng TASKS
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT,
        status TEXT,
        board_id TEXT,
        due_date TEXT,
        start_date TEXT,
        description TEXT,
        color TEXT,
        created_at TEXT,
        subtasks TEXT -- JSON string
      )
    `);

    // 4. Bảng NOTES
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        x REAL, y REAL,
        width REAL, height REAL,
        color_bg TEXT, color_border TEXT, text_color TEXT,
        is_bold INTEGER, is_italic INTEGER, is_underline INTEGER,
        rotate REAL
      )
    `);

    console.log("Database initialized successfully!");
    return true;
  } catch (error) {
    console.error("Failed to init DB:", error);
    return false;
  }
};

const getDb = async () => await Database.load(DB_NAME);

// --- USER API ---
export const getUser = async (): Promise<UserProfile | null> => {
    try {
        const db = await getDb();
        const res: any[] = await db.select("SELECT * FROM user_profile WHERE id = 1");
        if (res.length === 0) return null;
        const u = res[0];
        return {
            username: u.username,
            bio: u.bio,
            avatarUrl: u.avatar_url,
            password: u.password,
            joinedAt: u.joined_at,
            settings: u.settings ? JSON.parse(u.settings) : undefined
        };
    } catch (e) {
        console.error("Error getting user:", e);
        return null;
    }
};

export const saveUser = async (user: UserProfile) => {
    try {
        const db = await getDb();
        await db.execute(
            `INSERT OR REPLACE INTO user_profile (id, username, bio, avatar_url, password, joined_at, settings) VALUES (1, $1, $2, $3, $4, $5, $6)`,
            [user.username, user.bio, user.avatarUrl, user.password, user.joinedAt, JSON.stringify(user.settings || {})]
        );
    } catch (e) { console.error(e) }
};

// --- BOARD API ---
export const getBoards = async (): Promise<Board[]> => {
    try {
        const db = await getDb();
        const res: any[] = await db.select("SELECT * FROM boards");
        if (res.length === 0) return [];
        return res.map(b => ({
            id: b.id,
            title: b.title,
            isDefault: !!b.is_default,
            columns: JSON.parse(b.columns)
        }));
    } catch (e) { console.error(e); return []; }
};

export const saveBoard = async (board: Board) => {
    const db = await getDb();
    await db.execute(
        `INSERT OR REPLACE INTO boards (id, title, is_default, columns) VALUES ($1, $2, $3, $4)`,
        [board.id, board.title, board.isDefault ? 1 : 0, JSON.stringify(board.columns)]
    );
};

export const deleteBoard = async (id: string) => {
    const db = await getDb();
    await db.execute("DELETE FROM boards WHERE id = $1", [id]);
    await db.execute("DELETE FROM tasks WHERE board_id = $1", [id]);
};

// --- TASK API ---
export const getTasks = async (): Promise<Task[]> => {
    try {
        const db = await getDb();
        const res: any[] = await db.select("SELECT * FROM tasks");
        return res.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            boardId: t.board_id,
            dueDate: t.due_date,
            startDate: t.start_date,
            description: t.description,
            color: t.color,
            createdAt: t.created_at,
            subtasks: t.subtasks ? JSON.parse(t.subtasks) : []
        }));
    } catch (e) { console.error(e); return []; }
};

export const saveTask = async (task: Task) => {
    const db = await getDb();
    await db.execute(
        `INSERT OR REPLACE INTO tasks (id, title, status, board_id, due_date, start_date, description, color, created_at, subtasks) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [task.id, task.title, task.status, task.boardId, task.dueDate, task.startDate, task.description, task.color, task.createdAt, JSON.stringify(task.subtasks)]
    );
};

export const deleteTask = async (id: string) => {
    const db = await getDb();
    await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
};

// --- NOTE API ---
export const getNotes = async () => {
    try {
        const db = await getDb();
        const res: any[] = await db.select("SELECT * FROM notes");
        return res.map(n => ({
            id: n.id, title: n.title, content: n.content,
            x: n.x, y: n.y, width: n.width, height: n.height,
            colorBg: n.color_bg, colorBorder: n.color_border, textColor: n.text_color,
            isBold: !!n.is_bold, isItalic: !!n.is_italic, isUnderline: !!n.is_underline, rotate: n.rotate
        }));
    } catch (e) { return []; }
};

export const saveNote = async (n: any) => {
    const db = await getDb();
    await db.execute(
        `INSERT OR REPLACE INTO notes (id, title, content, x, y, width, height, color_bg, color_border, text_color, is_bold, is_italic, is_underline, rotate) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [n.id, n.title, n.content, n.x, n.y, n.width, n.height, n.colorBg, n.colorBorder, n.textColor, n.isBold?1:0, n.isItalic?1:0, n.isUnderline?1:0, n.rotate]
    );
};

export const deleteNote = async (id: string) => {
    const db = await getDb();
    await db.execute("DELETE FROM notes WHERE id = $1", [id]);
};