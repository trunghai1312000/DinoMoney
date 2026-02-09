export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string; // Tên icon hoặc emoji
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string; // Lưu ID hoặc tên category
  date: string; // ISO string
  note?: string;
  walletId?: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'cash' | 'bank' | 'credit' | 'savings';
  color: string;
}

export interface GoldHolding {
  id: string;
  type: string; // SJC, Nhẫn trơn...
  quantity: number; // Chỉ
  buyPrice: number; // Giá mua vào (triệu VND/lượng)
  buyDate: string;
}

export interface GoldPrice {
  buy: number; // Giá mua vào của tiệm (mình bán)
  sell: number; // Giá bán ra của tiệm (mình mua)
  updatedAt: string;
}

// API Response Types
export interface GoldApiResponse {
  success: boolean;
  result: {
    [key: string]: {
      buy: string;
      sell: string;
    };
  };
}

export interface ApiKeyResponse {
  success: boolean;
  result: string; // The API Key
}