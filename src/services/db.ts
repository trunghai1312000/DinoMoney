import Database from '@tauri-apps/plugin-sql';
import { Task, Board, UserProfile, Note } from '../types';

//Images & Videos Assets
import image1 from '../assets/image/image1.avif';
import image2 from '../assets/image/image2.avif';
import image3 from '../assets/image/image3.avif';
import image4 from '../assets/image/image4.jpg';
import image5 from '../assets/image/image5.jpg';
import image6 from '../assets/image/image6.jpg';
import video1 from '../assets/video/video1.mp4';
import video3 from '../assets/video/video3.mp4';
import video4 from '../assets/video/video4.mp4';

const DB_NAME = 'sqlite:dinofocus.db';
let db: Database | null = null;

const DEFAULT_WALLPAPERS = [
  { id: 'def_img_1', type: 'image', url: image1 },
  { id: 'def_img_2', type: 'image', url: image2 },
  { id: 'def_img_3', type: 'image', url: image3 },
  { id: 'def_img_4', type: 'image', url: image4 },
  { id: 'def_img_5', type: 'image', url: image5 },
  { id: 'def_img_6', type: 'image', url: image6 },
  { id: 'def_vid_1', type: 'video', url: video1 },
  { id: 'def_vid_3', type: 'video', url: video3 },
  { id: 'def_vid_4', type: 'video', url: video4 },
];

// --- INITIALIZATION ---
export const initDB = async (): Promise<boolean> => {
  try {
    db = await Database.load(DB_NAME);
    console.log("🔌 Connected to SQLite successfully");

    // 1. Tạo bảng nếu chưa có
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1), 
        username TEXT, 
        bio TEXT, 
        avatar_url TEXT, 
        password TEXT, 
        joined_at TEXT, 
        settings TEXT
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY, 
        title TEXT, 
        is_default INTEGER, 
        columns TEXT
      )
    `);

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
        subtasks TEXT
      )
    `);

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

    await db.execute(`
      CREATE TABLE IF NOT EXISTS wallpapers (
        id TEXT PRIMARY KEY, 
        type TEXT, 
        url TEXT
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY,
        duration INTEGER,
        completed_at TEXT
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        title TEXT,
        artist TEXT,
        duration TEXT,
        duration_sec INTEGER,
        url TEXT
      )
    `);

    // 2. AUTO-MIGRATION: Cố gắng thêm các cột mới nếu bảng cũ chưa có (Chống lỗi Schema cũ)
    const safeAddColumn = async (table: string, col: string, type: string) => {
        try { await db?.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`); } catch (e) { /* Cột đã tồn tại, bỏ qua */ }
    }
    
    // Đảm bảo bảng tasks có đủ cột (nếu bạn chạy bản cũ trước đó)
    await safeAddColumn('tasks', 'created_at', 'TEXT');
    await safeAddColumn('tasks', 'subtasks', 'TEXT');
    await safeAddColumn('tasks', 'start_date', 'TEXT');
    await safeAddColumn('tasks', 'color', 'TEXT');

    // 3. Seed Wallpapers
    const countRes: any[] = await db.select("SELECT count(*) as c FROM wallpapers");
    if (countRes[0].c === 0) {
        for (const wp of DEFAULT_WALLPAPERS) {
            await db.execute("INSERT INTO wallpapers (id, type, url) VALUES ($1, $2, $3)", [wp.id, wp.type, wp.url]);
        }
    }

    return true;
  } catch (error) {
    console.error("❌ Database Init Error:", error);
    return false;
  }
};

// --- USER ---
export const getUser = async (): Promise<UserProfile | null> => {
    if (!db) return null;
    try {
        const res: any[] = await db.select("SELECT * FROM user_profile WHERE id=1");
        if (!res[0]) return null;
        return {
            ...res[0],
            avatarUrl: res[0].avatar_url,
            joinedAt: res[0].joined_at,
            settings: JSON.parse(res[0].settings || '{}')
        };
    } catch (e) { console.error(e); return null; }
};

export const saveUser = async (user: UserProfile) => {
    if (!db) return;
    try {
        await db.execute(
            "INSERT OR REPLACE INTO user_profile (id, username, bio, avatar_url, password, joined_at, settings) VALUES (1, $1, $2, $3, $4, $5, $6)",
            [user.username, user.bio, user.avatarUrl, user.password, user.joinedAt, JSON.stringify(user.settings || {})]
        );
    } catch (e) { console.error("Save User Error:", e); }
};

// --- BOARDS ---
export const getBoards = async (): Promise<Board[]> => {
    if (!db) return [];
    try {
        const res: any[] = await db.select("SELECT * FROM boards");
        return res.map(b => ({
            id: b.id,
            title: b.title,
            isDefault: !!b.is_default,
            columns: JSON.parse(b.columns)
        }));
    } catch (e) { console.error(e); return []; }
};

export const saveBoard = async (b: Board) => {
    if (!db) return;
    try {
        await db.execute(
            "INSERT OR REPLACE INTO boards (id, title, is_default, columns) VALUES ($1, $2, $3, $4)",
            [b.id, b.title, b.isDefault ? 1 : 0, JSON.stringify(b.columns)]
        );
    } catch (e) { console.error("Save Board Error:", e); }
};

export const deleteBoard = async (id: string) => {
    if (!db) return;
    try {
        await db.execute("DELETE FROM boards WHERE id=$1", [id]);
        await db.execute("DELETE FROM tasks WHERE board_id=$1", [id]);
    } catch (e) { console.error(e); }
};

// --- TASKS (Đã sửa lỗi lưu) ---
export const getTasks = async (): Promise<Task[]> => {
    if (!db) return [];
    try {
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
            subtasks: JSON.parse(t.subtasks || '[]')
        }));
    } catch (e) { console.error(e); return []; }
};

export const saveTask = async (t: Task) => {
    if (!db) return;
    try {
        // Fix: Đảm bảo các trường không bị undefined (gây lỗi SQL bind)
        await db.execute(
            `INSERT OR REPLACE INTO tasks 
            (id, title, status, board_id, due_date, start_date, description, color, created_at, subtasks) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                t.id, 
                t.title, 
                t.status, 
                t.boardId, 
                t.dueDate || null, 
                t.startDate || null, 
                t.description || '', 
                t.color || '#71717a', 
                t.createdAt || new Date().toISOString(), 
                JSON.stringify(t.subtasks || []) // Quan trọng: Tránh lỗi JSON.stringify(undefined)
            ]
        );
        console.log("✅ Task saved:", t.title);
    } catch (e) { console.error("❌ Save Task Error:", e); }
};

export const deleteTask = async (id: string) => {
    if (!db) return;
    try {
        await db.execute("DELETE FROM tasks WHERE id=$1", [id]);
    } catch (e) { console.error(e); }
};

// --- NOTES ---
export const getNotes = async (): Promise<Note[]> => {
    if (!db) return [];
    try {
        const res: any[] = await db.select("SELECT * FROM notes");
        return res.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            x: n.x,
            y: n.y,
            width: n.width,
            height: n.height,
            colorBg: n.color_bg,
            colorBorder: n.color_border,
            textColor: n.text_color,
            isBold: !!n.is_bold,
            isItalic: !!n.is_italic,
            isUnderline: !!n.is_underline,
            rotate: n.rotate
        }));
    } catch (e) { console.error(e); return []; }
};

export const saveNote = async (n: Note) => {
    if (!db) return;
    try {
        await db.execute(
            `INSERT OR REPLACE INTO notes 
            (id, title, content, x, y, width, height, color_bg, color_border, text_color, is_bold, is_italic, is_underline, rotate) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
                n.id, n.title, n.content, n.x, n.y, n.width, n.height,
                n.colorBg, n.colorBorder, n.textColor,
                n.isBold ? 1 : 0, n.isItalic ? 1 : 0, n.isUnderline ? 1 : 0, n.rotate
            ]
        );
    } catch (e) { console.error("Save Note Error:", e); }
};

export const deleteNote = async (id: string) => {
    if (!db) return;
    try {
        await db.execute("DELETE FROM notes WHERE id=$1", [id]);
    } catch (e) { console.error(e); }
};

// --- WALLPAPERS ---
export interface Wallpaper { id: string; type: 'image' | 'video'; url: string; }

export const getWallpapers = async (): Promise<Wallpaper[]> => {
    if (!db) return [];
    try {
        return await db.select("SELECT * FROM wallpapers");
    } catch (e) { console.error(e); return []; }
};

export const addWallpaper = async (wp: Wallpaper) => {
    if (!db) return;
    try {
        await db.execute("INSERT OR REPLACE INTO wallpapers (id, type, url) VALUES ($1, $2, $3)", [wp.id, wp.type, wp.url]);
    } catch (e) { console.error(e); }
};

export const deleteWallpaper = async (id: string) => {
    if (!db) return;
    try {
        await db.execute("DELETE FROM wallpapers WHERE id=$1", [id]);
    } catch (e) { console.error(e); }
};

export const saveFocusSession = async (minutes: number) => {
  if (!db) return;
  try {
      await db.execute(
          "INSERT INTO focus_sessions (id, duration, completed_at) VALUES ($1, $2, $3)",
          [crypto.randomUUID(), minutes, new Date().toISOString()]
      );
      console.log(`✅ Saved focus session: ${minutes} mins`);
  } catch (e) {
      console.error("❌ Save Focus Session Error:", e);
  }
};

export const getFocusSessions = async (): Promise<FocusSession[]> => {
  if (!db) return [];
  try {
      const res: any[] = await db.select("SELECT * FROM focus_sessions");
      return res.map(s => ({
          id: s.id,
          duration: s.duration,
          completedAt: s.completed_at
      }));
  } catch (e) {
      console.error(e);
      return [];
  }
};

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  durationSec: number;
  url?: string;
}

export const getSongs = async (): Promise<Song[]> => {
    if (!db) return [];
    try {
        const res: any[] = await db.select("SELECT * FROM songs");
        return res.map(s => ({
            id: s.id,
            title: s.title,
            artist: s.artist,
            duration: s.duration,
            durationSec: s.duration_sec,
            url: s.url
        }));
    } catch (e) { console.error(e); return []; }
};

export const saveSong = async (s: Song) => {
  if (!db) return;
  try {
      await db.execute(
          "INSERT OR REPLACE INTO songs (id, title, artist, duration, duration_sec, url) VALUES ($1, $2, $3, $4, $5, $6)",
          [s.id, s.title, s.artist, s.duration, s.durationSec, s.url || '']
      );
  } catch (e) { console.error(e); }
};

export const deleteSong = async (id: string) => {
  if (!db) return;
  try { await db.execute("DELETE FROM songs WHERE id=$1", [id]); } catch (e) { console.error(e); }
};