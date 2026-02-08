import React, { useState } from 'react';
import { TrendingDown, TrendingUp, PlusCircle, List, Edit3, ArrowRight } from 'lucide-react';
import { Wallet, Transaction } from '../services/db';

interface TransactionManagerProps {
  wallets: Wallet[];
  transactions: Transaction[];
  onAddTransaction: (walletId: number, amount: number, type: 'income' | 'expense', category: string, desc: string) => Promise<void>;
}

const EXPENSE_CATEGORIES = ["Ăn uống", "Di chuyển", "Mua sắm", "Hóa đơn", "Giải trí", "Y tế", "Khác"];
const INCOME_CATEGORIES = ["Lương", "Thưởng", "Đầu tư", "Bán hàng", "Quà tặng", "Khác"];

const TransactionManager: React.FC<TransactionManagerProps> = ({ wallets, transactions, onAddTransaction }) => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Form State
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedWalletId, setSelectedWalletId] = useState<number | string>(wallets[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [desc, setDesc] = useState("");

  const handleSubmit = async () => {
    if (!selectedWalletId || !amount || !category) {
      alert("Vui lòng nhập đủ thông tin");
      return;
    }
    await onAddTransaction(Number(selectedWalletId), parseFloat(amount), type, category, desc || category);
    setAmount("");
    setDesc("");
    alert("Đã lưu giao dịch!");
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      
      {/* Tab Switcher */}
      <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-fit mx-auto mb-8 backdrop-blur-md">
        <button onClick={() => setActiveTab('form')} className={`px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'form' ? 'bg-[#05df72] text-black shadow-[0_0_15px_-5px_#05df72]' : 'text-gray-500 hover:text-white'}`}>
            <Edit3 size={14} /> Ghi Chép
        </button>
        <button onClick={() => setActiveTab('list')} className={`px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <List size={14} /> Lịch Sử GD
        </button>
      </div>

      {activeTab === 'form' && (
        <div className="bg-black/30 backdrop-blur-md p-10 rounded-3xl border border-white/5 shadow-2xl">
            {/* Type Selector */}
            <div className="flex bg-black/50 p-1.5 rounded-xl mb-8 border border-white/10">
                <button 
                    onClick={() => { setType('expense'); setCategory(EXPENSE_CATEGORIES[0]); }}
                    className={`flex-1 py-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <TrendingDown size={18} /> Khoản Chi
                </button>
                <button 
                    onClick={() => { setType('income'); setCategory(INCOME_CATEGORIES[0]); }}
                    className={`flex-1 py-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${type === 'income' ? 'bg-[#05df72] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <TrendingUp size={18} /> Khoản Thu
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block font-bold">Nguồn tiền</label>
                    <select 
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#05df72] outline-none appearance-none text-sm transition-all"
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    >
                    <option value="" disabled>-- Chọn ví --</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name} (Còn: {w.balance.toLocaleString()} đ)</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block font-bold">Số tiền (VNĐ)</label>
                        <input 
                            type="number" 
                            placeholder="0" 
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#05df72] outline-none transition-all font-mono text-lg placeholder-gray-700"
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block font-bold">Danh mục</label>
                        <select 
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#05df72] outline-none appearance-none text-sm transition-all"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block font-bold">Ghi chú (Tùy chọn)</label>
                    <input 
                        placeholder="VD: Ăn trưa, Lương tháng 10..." 
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#05df72] outline-none transition-all text-sm placeholder-gray-700"
                        value={desc} 
                        onChange={(e) => setDesc(e.target.value)} 
                    />
                </div>

                <button 
                    onClick={handleSubmit} 
                    className={`w-full font-black uppercase tracking-widest py-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-6 text-sm hover:scale-[1.01] active:scale-95 ${
                        type === 'expense' 
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20' 
                        : 'bg-[#05df72] hover:bg-[#04c463] text-black shadow-[#05df72]/20'
                    }`}
                >
                    <PlusCircle size={18}/> {type === 'expense' ? 'Xác Nhận Chi Tiêu' : 'Xác Nhận Thu Nhập'}
                </button>
            </div>
        </div>
      )}

      {activeTab === 'list' && (
          <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-lg h-[600px] flex flex-col">
             <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Danh sách giao dịch</h3>
                 <span className="text-[10px] text-gray-600 uppercase font-bold">{transactions.length} bản ghi</span>
             </div>
             <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
                 <table className="w-full text-left border-collapse">
                    <thead className="text-gray-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 bg-[#111] z-10">
                        <tr>
                        <th className="p-4 rounded-l-lg">Ngày</th>
                        <th className="p-4">Danh mục</th>
                        <th className="p-4">Nội dung</th>
                        <th className="p-4 text-right rounded-r-lg">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4 text-gray-500 font-mono text-xs w-32">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${t.type === 'income' ? 'bg-[#05df72]/10 border-[#05df72]/30 text-[#05df72]' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
                                    {t.category}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-300">{t.description}</td>
                            <td className={`p-4 font-bold text-right font-mono text-sm ${t.type === 'income' ? 'text-[#05df72]' : 'text-rose-500'}`}>
                                {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
          </div>
      )}
    </div>
  );
};

export default TransactionManager;