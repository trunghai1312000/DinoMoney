import React, { useState } from 'react';
import { Plus, Wallet as WalletIcon, Smartphone, Building2 } from 'lucide-react';
import { Wallet } from '../services/db';

interface WalletManagerProps {
  wallets: Wallet[];
  onAddWallet: (name: string, type: string, balance: number) => Promise<void>;
}

const WalletManager: React.FC<WalletManagerProps> = ({ wallets, onAddWallet }) => {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState("bank");

  const handleSubmit = async () => {
    if (!name || !balance) return;
    await onAddWallet(name, type, parseFloat(balance));
    setName("");
    setBalance("");
  };

  const getIcon = (type: string) => {
      if (type === 'cash') return <WalletIcon size={20} />;
      if (type === 'ewallet') return <Smartphone size={20} />;
      return <Building2 size={20} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
       {/* Danh sách ví */}
       <div className="space-y-3">
         {wallets.map(w => (
           <div key={w.id} className="bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-[#05df72]/40 transition-all">
             <div className="flex items-center gap-4">
               <div className={`p-3 rounded-xl ${w.type === 'cash' ? 'bg-[#05df72]/10 text-[#05df72]' : 'bg-sky-500/10 text-sky-400'}`}>
                   {getIcon(w.type)}
               </div>
               <div>
                 <h3 className="font-bold text-sm text-white group-hover:text-[#05df72] transition-colors">{w.name}</h3>
                 <span className="text-[9px] uppercase tracking-wider bg-white/5 text-gray-500 px-2 py-0.5 rounded border border-white/5">{w.type === 'cash' ? 'Tiền mặt' : w.type === 'ewallet' ? 'Ví điện tử' : 'Ngân hàng'}</span>
               </div>
             </div>
             <p className="text-lg font-bold font-mono text-white">{w.balance.toLocaleString()} đ</p>
           </div>
         ))}
       </div>
       
       {/* Form thêm ví */}
       <div className="bg-black/30 backdrop-blur-md p-8 rounded-3xl border border-white/5 h-fit shadow-lg">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Plus className="text-[#05df72]" size={16} /> Liên kết tài khoản
          </h3>
          <div className="space-y-5">
            <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block font-bold">Loại tài khoản</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setType('bank')} 
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'bank' ? 'border-[#05df72] bg-[#05df72]/10 text-white' : 'border-white/10 bg-black/20 text-gray-500 hover:border-white/20'}`}
                    >
                        <Building2 size={18} /> <span className="text-xs font-bold">Ngân hàng</span>
                    </button>
                    <button 
                        onClick={() => setType('ewallet')} 
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'ewallet' ? 'border-[#05df72] bg-[#05df72]/10 text-white' : 'border-white/10 bg-black/20 text-gray-500 hover:border-white/20'}`}
                    >
                        <Smartphone size={18} /> <span className="text-xs font-bold">Ví điện tử</span>
                    </button>
                </div>
            </div>

            <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block font-bold">Tên hiển thị</label>
                <input 
                    placeholder="VD: Techcombank, Momo..." 
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white focus:border-[#05df72] outline-none transition-all text-sm placeholder-gray-700"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />
            </div>
            
            <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block font-bold">Số dư hiện tại</label>
                <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white focus:border-[#05df72] outline-none transition-all font-mono text-sm placeholder-gray-700"
                    value={balance} 
                    onChange={(e) => setBalance(e.target.value)} 
                />
            </div>

            <button 
              onClick={handleSubmit} 
              className="w-full bg-[#05df72] hover:bg-[#04c463] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(5,223,114,0.4)] mt-4 text-xs"
            >
              Thêm tài khoản
            </button>
          </div>
       </div>
    </div>
  );
};

export default WalletManager;