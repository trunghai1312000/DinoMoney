// src/types.ts

export type WalletKind = 'Cash' | 'Bank' | 'E-Wallet';

export interface Wallet {
  id: string;
  name: string;
  kind: WalletKind;
  balance: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  wallet_id: string;
  date: string; // ISO String
  note: string;
}

export interface GoldSettings {
  holdings: number;
  last_price: number;
}

export interface AppSettings {
  is_setup: number; // 0 or 1 (SQLite doesn't have boolean)
  password_hash: string;
}

export interface AuthStatus {
  is_setup: boolean;
  is_unlocked: boolean;
}

// Dữ liệu tổng hợp để hiển thị Dashboard
export interface DashboardData {
  wallets: Wallet[];
  expenses: Expense[];
  gold: GoldSettings;
}