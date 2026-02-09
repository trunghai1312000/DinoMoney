import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Wallet } from '../types';
import { Trash2, Plus, CreditCard, Banknote, Wallet as WalletIcon } from 'lucide-react';

export default function WalletManager() {
  const { wallets = [], addWallet, deleteWallet } = useStore(); // Default wallets = []
  
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<Wallet['type']>('cash');

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addWallet({
      id: Date.now().toString(),
      name,
      balance: parseFloat(balance) || 0,
      type,
      color: '#3B82F6' // Default Blue
    });

    setName('');
    setBalance('');
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'bank': return <Banknote className="w-6 h-6" />;
      case 'credit': return <CreditCard className="w-6 h-6" />;
      default: return <WalletIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gradient-blue">
        Quản Lý Ví 💳
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form thêm ví - Giao diện tối */}
        <div className="glass-panel p-6 rounded-2xl h-fit">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Thêm ví mới</h3>
          <form onSubmit={handleAddWallet} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tên ví</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg glass-input"
                placeholder="Ví dụ: Techcombank"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Số dư ban đầu</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full p-3 rounded-lg glass-input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Loại ví</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-3 rounded-lg glass-input bg-gray-900"
              >
                <option value="cash">Tiền mặt</option>
                <option value="bank">Ngân hàng</option>
                <option value="credit">Thẻ tín dụng</option>
                <option value="savings">Tiết kiệm</option>
              </select>
            </div>
            <button type="submit" className="w-full py-3 rounded-lg glass-button font-bold flex items-center justify-center gap-2">
              <Plus size={18} /> Tạo ví
            </button>
          </form>
        </div>

        {/* Danh sách ví - Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* SAFE GUARD: (wallets || []) để tránh lỗi map undefined */}
          {(wallets || []).map((wallet) => (
            <div key={wallet.id} className="glass-panel p-6 rounded-2xl relative group hover:border-blue-500/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  {getIcon(wallet.type)}
                </div>
                {wallets.length > 1 && (
                  <button 
                    onClick={() => deleteWallet(wallet.id)}
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <h4 className="text-gray-400 font-medium mb-1">{wallet.name}</h4>
              <p className="text-2xl font-bold text-white">
                {wallet.balance.toLocaleString()} <span className="text-sm text-gray-500">VND</span>
              </p>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-50 rounded-b-2xl"></div>
            </div>
          ))}

          {(wallets || []).length === 0 && (
             <div className="col-span-2 text-center text-gray-500 py-10 glass-panel rounded-2xl border-dashed">
               Chưa có ví nào. Hãy tạo ví đầu tiên!
             </div>
          )}
        </div>
      </div>
    </div>
  );
}