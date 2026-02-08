import Database from '@tauri-apps/plugin-sql';

export interface Wallet {
  id: number;
  name: string;
  type: 'cash' | 'bank' | 'ewallet';
  balance: number;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  amount: number;
  type: 'income' | 'expense'; // Mới: Phân loại Thu/Chi
  category: string;
  description: string;
  date: string;
}

export interface GoldSettings {
  quantity: number; // Đơn vị: Chỉ
  market_price: number; // Giá: VNĐ/Chỉ
}

export interface Jewelry {
  id: number;
  name: string; // Nhẫn, dây chuyền...
  weight: number; // Chỉ
  buy_price: number;
  date: string;
}

const DB_PATH = 'sqlite:dinomoney.db';

const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const dbService = {
  db: null as Database | null,

  initDB: async () => {
    try {
      if (!dbService.db) {
        dbService.db = await Database.load(DB_PATH);
      }
      const db = dbService.db!;

      await db.execute(`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), password_hash TEXT, is_setup INTEGER DEFAULT 0);`);
      await db.execute(`CREATE TABLE IF NOT EXISTS wallets (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT NOT NULL, balance REAL DEFAULT 0);`);
      
      // Cập nhật bảng transactions (tên cũ là expenses)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet_id INTEGER,
          amount REAL,
          type TEXT DEFAULT 'expense', 
          category TEXT,
          description TEXT,
          date TEXT,
          FOREIGN KEY(wallet_id) REFERENCES wallets(id)
        );
      `);

      await db.execute(`CREATE TABLE IF NOT EXISTS gold_settings (id INTEGER PRIMARY KEY CHECK (id = 1), quantity REAL DEFAULT 0, market_price REAL DEFAULT 0);`);
      
      // Bảng mới: Nữ trang
      await db.execute(`
        CREATE TABLE IF NOT EXISTS jewelry (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          weight REAL,
          buy_price REAL,
          date TEXT
        );
      `);

      await db.execute(`INSERT OR IGNORE INTO gold_settings (id, quantity, market_price) VALUES (1, 0, 0);`);

      // Tự động tạo ví Tiền mặt
      const cashWallet: any[] = await db.select("SELECT * FROM wallets WHERE type = 'cash'");
      if (cashWallet.length === 0) {
        await db.execute("INSERT INTO wallets (name, type, balance) VALUES ('Tiền mặt (Mặc định)', 'cash', 0)");
      }

      return true;
    } catch (error) {
      console.error("Init DB Error:", error);
      return false;
    }
  },

  checkSetup: async (): Promise<boolean> => {
      if (!dbService.db) await dbService.initDB();
      const result: any[] = await dbService.db!.select("SELECT is_setup FROM settings WHERE id = 1");
      return result.length > 0 && result[0].is_setup === 1;
  },
  setupApp: async (password: string) => {
      if (!dbService.db) await dbService.initDB();
      const hashed = await hashPassword(password);
      await dbService.db!.execute("INSERT OR REPLACE INTO settings (id, password_hash, is_setup) VALUES (1, $1, 1)", [hashed]);
      return true;
  },
  verifyPassword: async (password: string): Promise<boolean> => {
      if (!dbService.db) await dbService.initDB();
      const hashed = await hashPassword(password);
      const result: any[] = await dbService.db!.select("SELECT password_hash FROM settings WHERE id = 1");
      if (result.length > 0) return result[0].password_hash === hashed;
      return false;
  },

  getWallets: async (): Promise<Wallet[]> => {
    if (!dbService.db) await dbService.initDB();
    return await dbService.db!.select("SELECT * FROM wallets");
  },

  addWallet: async (name: string, type: string, initialBalance: number) => {
    if (!dbService.db) await dbService.initDB();
    if (type === 'cash') throw new Error("Không thể tạo thêm ví tiền mặt");
    await dbService.db!.execute("INSERT INTO wallets (name, type, balance) VALUES ($1, $2, $3)", [name, type, initialBalance]);
  },

  // --- TRANSACTION LOGIC (THU/CHI) ---
  getTransactions: async (): Promise<Transaction[]> => {
    if (!dbService.db) await dbService.initDB();
    return await dbService.db!.select("SELECT * FROM transactions ORDER BY date DESC");
  },

  getTransactionsByRange: async (startDate: string, endDate: string): Promise<Transaction[]> => {
    if (!dbService.db) await dbService.initDB();
    // Thêm thời gian vào ngày để query chính xác cả ngày
    return await dbService.db!.select(
      "SELECT * FROM transactions WHERE date >= $1 AND date <= $2 ORDER BY date ASC",
      [`${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`]
    );
  },

  addTransaction: async (walletId: number, amount: number, type: 'income' | 'expense', category: string, description: string, date: string) => {
    if (!dbService.db) await dbService.initDB();
    
    // Cập nhật số dư ví
    if (type === 'expense') {
        await dbService.db!.execute("UPDATE wallets SET balance = balance - $1 WHERE id = $2", [amount, walletId]);
    } else {
        await dbService.db!.execute("UPDATE wallets SET balance = balance + $1 WHERE id = $2", [amount, walletId]);
    }

    // Lưu giao dịch
    await dbService.db!.execute(
      "INSERT INTO transactions (wallet_id, amount, type, category, description, date) VALUES ($1, $2, $3, $4, $5, $6)",
      [walletId, amount, type, category, description, date]
    );
  },

  // --- GOLD LOGIC ---
  getGoldSettings: async (): Promise<GoldSettings> => {
    if (!dbService.db) await dbService.initDB();
    const res: GoldSettings[] = await dbService.db!.select("SELECT * FROM gold_settings WHERE id = 1");
    return res[0] || { quantity: 0, market_price: 0 };
  },

  updateGoldSettings: async (quantity: number, marketPrice: number) => {
    if (!dbService.db) await dbService.initDB();
    await dbService.db!.execute("UPDATE gold_settings SET quantity = $1, market_price = $2 WHERE id = 1", [quantity, marketPrice]);
  },

  // --- JEWELRY LOGIC ---
  getJewelry: async (): Promise<Jewelry[]> => {
    if (!dbService.db) await dbService.initDB();
    return await dbService.db!.select("SELECT * FROM jewelry ORDER BY date DESC");
  },

  addJewelry: async (name: string, weight: number, buyPrice: number, date: string) => {
    if (!dbService.db) await dbService.initDB();
    await dbService.db!.execute(
        "INSERT INTO jewelry (name, weight, buy_price, date) VALUES ($1, $2, $3, $4)", 
        [name, weight, buyPrice, date]
    );
  },

  deleteJewelry: async (id: number) => {
    if (!dbService.db) await dbService.initDB();
    await dbService.db!.execute("DELETE FROM jewelry WHERE id = $1", [id]);
  }
};