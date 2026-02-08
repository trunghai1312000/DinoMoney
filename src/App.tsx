import React, { useState, useEffect } from 'react';
import { dbService, Wallet, Transaction, GoldSettings, Jewelry } from './services/db';

import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WalletManager from './components/WalletManager';
import TransactionManager from './components/TransactionManager';
import GoldManager from './components/GoldManager';
import Statistics from './components/Statistics';

type ViewState = 'dashboard' | 'wallets' | 'transactions' | 'gold' | 'statistics';

function App() {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewState>('dashboard');

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gold, setGold] = useState<GoldSettings>({ quantity: 0, market_price: 0 });
  const [jewelry, setJewelry] = useState<Jewelry[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    dbService.checkSetup().then(setIsSetup);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          const [w, t, g, j] = await Promise.all([
            dbService.getWallets(),
            dbService.getTransactions(),
            dbService.getGoldSettings(),
            dbService.getJewelry()
          ]);
          setWallets(w);
          setTransactions(t);
          setGold(g);
          setJewelry(j);
        } catch (err) {
          console.error("Failed to load data", err);
        }
      };
      loadData();
    }
  }, [isAuthenticated, refreshTrigger]);

  const handleLogin = async (password: string) => {
    if (isSetup) {
      if (await dbService.verifyPassword(password)) setIsAuthenticated(true);
      else alert("Sai mật khẩu");
    } else {
      if (password.length < 4) return alert("Mật khẩu quá ngắn");
      await dbService.setupApp(password);
      setIsSetup(true);
      setIsAuthenticated(true);
    }
  };

  const handleLockApp = () => setIsAuthenticated(false);

  const handleAddWallet = async (name: string, type: string, balance: number) => {
    await dbService.addWallet(name, type, balance);
    setRefreshTrigger(p => p + 1);
  };

  const handleAddTransaction = async (walletId: number, amount: number, type: 'income' | 'expense', category: string, desc: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (type === 'expense' && wallet && wallet.balance < amount) {
        alert("Số dư ví không đủ!");
        return;
    }
    await dbService.addTransaction(walletId, amount, type, category, desc, new Date().toISOString());
    setRefreshTrigger(p => p + 1);
  };

  const handleUpdateGold9999 = async (qty: number, price: number) => {
    await dbService.updateGoldSettings(qty, price);
    setRefreshTrigger(p => p + 1);
  };

  const handleAddJewelry = async (name: string, weight: number, price: number) => {
      await dbService.addJewelry(name, weight, price, new Date().toISOString());
      setRefreshTrigger(p => p + 1);
  };
  
  const handleDeleteJewelry = async (id: number) => {
      await dbService.deleteJewelry(id);
      setRefreshTrigger(p => p + 1);
  };

  if (isSetup === null) return <div className="h-screen bg-transparent flex items-center justify-center text-[#05df72] font-mono animate-pulse">SYSTEM BOOTING...</div>;
  if (!isAuthenticated) return <LoginScreen isSetup={isSetup} onLogin={handleLogin} errorMsg="" />;

  const netWorth = wallets.reduce((s, w) => s + w.balance, 0) + 
                   (gold.quantity * gold.market_price) + 
                   jewelry.reduce((s, j) => s + j.buy_price, 0);

  return (
    // BG gần như trong suốt (black/10) để thấy desktop nếu tauri config đúng
    <div className="flex h-screen bg-black/40 text-gray-200 font-sans overflow-hidden selection:bg-[#05df72] selection:text-black backdrop-blur-sm rounded-xl border border-white/5">
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLock={handleLockApp} />

      <main className="flex-1 overflow-y-auto p-6 relative z-10 custom-scrollbar">
        {/* Header Siêu Nhỏ Gọn */}
        <header className="flex justify-between items-center mb-6 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-white uppercase italic tracking-tighter drop-shadow-md">
                {activeTab === 'dashboard' && 'Tổng quan'}
                {activeTab === 'wallets' && 'Ví & Tài khoản'}
                {activeTab === 'transactions' && 'Sổ Thu Chi'}
                {activeTab === 'gold' && 'Két Vàng & Trang sức'}
                {activeTab === 'statistics' && 'Phân tích tài chính'}
              </h2>
              <div className="h-4 w-0.5 bg-[#05df72] rotate-12 shadow-[0_0_5px_#05df72]"></div>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">SECURE TERMINAL</p>
          </div>
          
          <div className="flex items-center gap-3">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">NET WORTH</p>
              <div className="px-2 py-1 bg-[#05df72]/10 rounded border border-[#05df72]/30">
                  <p className="text-sm font-bold text-[#05df72] font-mono drop-shadow-[0_0_5px_rgba(5,223,114,0.5)]">
                      {netWorth.toLocaleString()} đ
                  </p>
              </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <Dashboard wallets={wallets} totalGoldValue={(gold.quantity * gold.market_price) + jewelry.reduce((s,j)=>s+j.buy_price,0)} expenses={transactions.filter(t => t.type === 'expense')} />
        )}

        {activeTab === 'wallets' && (
          <WalletManager wallets={wallets} onAddWallet={handleAddWallet} />
        )}

        {activeTab === 'transactions' && (
          <TransactionManager wallets={wallets} transactions={transactions} onAddTransaction={handleAddTransaction} />
        )}

        {activeTab === 'gold' && (
          <GoldManager gold={gold} jewelryList={jewelry} onUpdate9999={handleUpdateGold9999} onAddJewelry={handleAddJewelry} onDeleteJewelry={handleDeleteJewelry} />
        )}
        
        {activeTab === 'statistics' && (
          <Statistics transactions={transactions} />
        )}
      </main>
    </div>
  );
}

export default App;