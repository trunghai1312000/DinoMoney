import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction, Wallet, GoldHolding, Category, GoldPrice, GoldPriceRecord } from '../types';
import { addDays, isAfter, parseISO, format } from 'date-fns';
import { indexedDBStorage } from '../services/db'; // Import Adapter mới

const DEFAULT_CASH_WALLET: Wallet = {
  id: 'w_cash_default',
  name: 'Tiền mặt',
  balance: 0,
  type: 'cash',
  color: 'from-emerald-600 to-green-700',
  accountNumber: ''
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Ăn uống', type: 'expense', isDefault: true, icon: '🍔' },
  { id: 'cat_2', name: 'Di chuyển', type: 'expense', isDefault: true, icon: '🚗' },
  { id: 'cat_3', name: 'Mua sắm', type: 'expense', isDefault: true, icon: '🛍️' },
  { id: 'cat_4', name: 'Lương', type: 'income', isDefault: true, icon: '💰' },
  { id: 'cat_5', name: 'Thưởng', type: 'income', isDefault: true, icon: '🎁' },
];

interface AppState {
  // State Hydration Status
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  transactions: Transaction[];
  wallets: Wallet[];
  goldHoldings: GoldHolding[];
  categories: Category[];
  
  userPassword: string | null;
  setUserPassword: (pass: string | null) => void;

  currentGoldPrice: GoldPrice;
  goldPriceHistory: GoldPriceRecord[];
  goldApiKey: string | null;
  goldKeyObtainedDate: string | null;

  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  addWallet: (w: Wallet) => void;
  deleteWallet: (id: string) => void;
  
  addGoldHolding: (g: GoldHolding) => void;
  fetchGoldData: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      transactions: [],
      wallets: [DEFAULT_CASH_WALLET],
      goldHoldings: [],
      categories: DEFAULT_CATEGORIES,
      userPassword: null,
      
      currentGoldPrice: { buy: 0, sell: 0, updatedAt: new Date().toISOString() },
      goldPriceHistory: [],
      goldApiKey: null,
      goldKeyObtainedDate: null,

      setUserPassword: (pass) => set({ userPassword: pass }),

      addTransaction: (t) => set((state) => {
        const updatedWallets = state.wallets.map(w => {
            if (w.id === t.walletId) {
                const newBalance = t.type === 'income' ? w.balance + t.amount : w.balance - t.amount;
                return { ...w, balance: newBalance };
            }
            return w;
        });
        return { 
            transactions: [t, ...state.transactions],
            wallets: updatedWallets
        };
      }),

      deleteTransaction: (id) => set((state) => {
        const txToDelete = state.transactions.find(t => t.id === id);
        if (!txToDelete) return state;

        const updatedWallets = state.wallets.map(w => {
            if (w.id === txToDelete.walletId) {
                const newBalance = txToDelete.type === 'income' 
                    ? w.balance - txToDelete.amount 
                    : w.balance + txToDelete.amount;
                return { ...w, balance: newBalance };
            }
            return w;
        });

        return { 
            transactions: state.transactions.filter(t => t.id !== id),
            wallets: updatedWallets
        };
      }),

      addCategory: (c) => set((state) => ({ categories: [...state.categories, c] })),
      deleteCategory: (id) => set((state) => ({ 
        categories: state.categories.filter(c => c.id !== id) 
      })),

      addWallet: (w) => set((state) => {
          if (w.type === 'cash') return state;
          return { wallets: [...state.wallets, w] };
      }),

      deleteWallet: (id) => set((state) => {
        const walletToDelete = state.wallets.find(w => w.id === id);
        if (walletToDelete && walletToDelete.type === 'cash') {
            return state; 
        }
        return {
          wallets: state.wallets.filter(w => w.id !== id)
        };
      }),

      addGoldHolding: (g) => set((state) => ({ goldHoldings: [...state.goldHoldings, g] })),
      
      resetAllData: async () => {
          // Xóa IndexedDB
          await indexedDBStorage.removeItem('dinomoney-storage');
          window.location.reload();
      },

      fetchGoldData: async () => {
        const state = get();
        let apiKey = state.goldApiKey;
        const keyDate = state.goldKeyObtainedDate;

        const needsNewKey = !apiKey || !keyDate || isAfter(new Date(), addDays(parseISO(keyDate), 10));

        if (needsNewKey) {
          try {
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
            console.error("Error fetching API Key:", e);
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

               set((state) => {
                 const lastRecord = state.goldPriceHistory[state.goldPriceHistory.length - 1];
                 let newHistory = state.goldPriceHistory;
                 const isNewDay = !lastRecord || format(parseISO(lastRecord.timestamp), 'yyyy-MM-dd') !== format(parseISO(apiTime), 'yyyy-MM-dd');
                 
                 if (isNewDay) {
                    newHistory = [...state.goldPriceHistory, { timestamp: apiTime, buy: buyPrice, sell: sellPrice }];
                 }

                 return { 
                    currentGoldPrice: { buy: buyPrice, sell: sellPrice, updatedAt: apiTime },
                    goldPriceHistory: newHistory
                 };
               });
            }
          } catch (e) {
            console.error("Error fetching gold price:", e);
          }
        }
      }
    }),
    {
      name: 'dinomoney-storage',
      // Dùng Adapter Async mới
      storage: createJSONStorage(() => indexedDBStorage),
      // Khi load xong dữ liệu thì bật cờ này lên
      onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
      },
      merge: (persistedState: any, currentState) => {
        let mergedWallets = Array.isArray(persistedState?.wallets) ? persistedState.wallets : currentState.wallets;
        const hasCash = mergedWallets.some((w: Wallet) => w.type === 'cash');
        
        if (!hasCash) {
            mergedWallets = [DEFAULT_CASH_WALLET, ...mergedWallets];
        }

        return {
            ...currentState,
            ...persistedState,
            _hasHydrated: true, // Mark as hydrated after merge
            goldPriceHistory: Array.isArray(persistedState?.goldPriceHistory) ? persistedState.goldPriceHistory : [],
            transactions: Array.isArray(persistedState?.transactions) ? persistedState.transactions : [],
            wallets: mergedWallets,
            categories: Array.isArray(persistedState?.categories) && persistedState.categories.length > 0 
                ? persistedState.categories 
                : DEFAULT_CATEGORIES,
        };
      },
    }
  )
);