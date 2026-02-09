import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction, Wallet, GoldHolding, Category, GoldPrice } from '../types';
import { addDays, isAfter, parseISO } from 'date-fns';

// --- Mặc định Categories ---
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Ăn uống', type: 'expense', isDefault: true, icon: '🍔' },
  { id: 'cat_2', name: 'Di chuyển', type: 'expense', isDefault: true, icon: '🚗' },
  { id: 'cat_3', name: 'Mua sắm', type: 'expense', isDefault: true, icon: '🛍️' },
  { id: 'cat_4', name: 'Lương', type: 'income', isDefault: true, icon: '💰' },
  { id: 'cat_5', name: 'Thưởng', type: 'income', isDefault: true, icon: '🎁' },
];

interface AppState {
  // Data
  transactions: Transaction[];
  wallets: Wallet[];
  goldHoldings: GoldHolding[];
  categories: Category[];
  
  // Gold System
  currentGoldPrice: GoldPrice;
  goldApiKey: string | null;
  goldKeyObtainedDate: string | null;

  // Actions
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  addWallet: (w: Wallet) => void;
  deleteWallet: (id: string) => void;
  
  addGoldHolding: (g: GoldHolding) => void;
  updateGoldPrice: (price: GoldPrice) => void;
  setGoldApiKey: (key: string) => void;
  
  // Logic API
  fetchGoldData: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: [],
      wallets: [
        { id: 'w1', name: 'Tiền mặt', balance: 0, type: 'cash', color: '#3B82F6' } // Màu xanh default
      ],
      goldHoldings: [],
      categories: DEFAULT_CATEGORIES,
      
      currentGoldPrice: { buy: 0, sell: 0, updatedAt: new Date().toISOString() },
      goldApiKey: null,
      goldKeyObtainedDate: null,

      addTransaction: (t) => set((state) => ({ transactions: [t, ...state.transactions] })),
      deleteTransaction: (id) => set((state) => ({ 
        transactions: state.transactions.filter(t => t.id !== id) 
      })),

      addCategory: (c) => set((state) => ({ categories: [...state.categories, c] })),
      deleteCategory: (id) => set((state) => ({ 
        categories: state.categories.filter(c => c.id !== id) 
      })),

      addWallet: (w) => set((state) => ({ wallets: [...state.wallets, w] })),
      deleteWallet: (id) => set((state) => ({
        wallets: state.wallets.filter(w => w.id !== id)
      })),

      addGoldHolding: (g) => set((state) => ({ goldHoldings: [...state.goldHoldings, g] })),
      
      updateGoldPrice: (price) => set({ currentGoldPrice: price }),
      setGoldApiKey: (key) => set({ goldApiKey: key, goldKeyObtainedDate: new Date().toISOString() }),

      fetchGoldData: async () => {
        const state = get();
        let apiKey = state.goldApiKey;
        const keyDate = state.goldKeyObtainedDate;

        const needsNewKey = !apiKey || !keyDate || isAfter(new Date(), addDays(parseISO(keyDate), 10));

        if (needsNewKey) {
          try {
            console.log("Đang lấy API Key mới...");
            const res = await fetch('https://api.vnappmob.com/api/request_api_key?scope=gold');
            const data = await res.json();
            
            let newKey = "";
            if (typeof data === 'string') newKey = data;
            else if (data.results) newKey = data.results; 
            else if (data.key) newKey = data.key;
            else newKey = String(data);

            if (newKey) {
                apiKey = newKey;
                set({ goldApiKey: newKey, goldKeyObtainedDate: new Date().toISOString() });
            }
          } catch (e) {
            console.error("Lỗi lấy API Key:", e);
            return; 
          }
        }

        if (apiKey) {
          try {
            const res = await fetch(`https://api.vnappmob.com/api/v2/gold/sjc?api_key=${apiKey}`);
            const data = await res.json();
            
            if (data && data.results && data.results.length > 0) {
               const result = data.results[0];
               const buyPrice = parseFloat(result.buy_nutrang_9999);
               const sellPrice = parseFloat(result.sell_nutrang_9999);
               const apiTime = result.datetime ? new Date(parseInt(result.datetime) * 1000).toISOString() : new Date().toISOString();

               set({ 
                 currentGoldPrice: {
                   buy: buyPrice,
                   sell: sellPrice,
                   updatedAt: apiTime
                 }
               });
            }
          } catch (e) {
            console.error("Lỗi lấy giá vàng:", e);
          }
        }
      }
    }),
    {
      name: 'dinomoney-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          transactions: Array.isArray(persistedState?.transactions) ? persistedState.transactions : [],
          // Fix lỗi wallet bị undefined tại đây
          wallets: Array.isArray(persistedState?.wallets) ? persistedState.wallets : currentState.wallets,
          categories: Array.isArray(persistedState?.categories) && persistedState.categories.length > 0 
            ? persistedState.categories 
            : DEFAULT_CATEGORIES,
        };
      },
    }
  )
);