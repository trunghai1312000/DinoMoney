export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string
  note?: string;
  walletId: string; // Bắt buộc phải chọn nguồn tiền
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'bank' | 'ewallet' | 'credit' | 'savings' | 'cash';
  color: string;
  accountNumber?: string;
}

export interface GoldHolding {
  id: string;
  type: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
}

export interface GoldPrice {
  buy: number;
  sell: number;
  updatedAt: string;
}

export interface GoldPriceRecord {
  timestamp: string;
  buy: number;
  sell: number;
}

export interface GoldApiResult {
    buy_nutrang_9999: string;
    sell_nutrang_9999: string;
    datetime: string;
}

export interface GoldApiResponse {
  results: GoldApiResult[];
}