import { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { TransactionType } from '../types';
import { Plus, Trash2, Calendar, Search, X, Wallet } from 'lucide-react';

const EMOJI_LIST = ["🍔", "🚗", "🛍️", "💰", "🎁", "🏠", "💊", "🎓", "✈️", "🎮", "🐶", "🎉", "🔧", "⛽", "🧾"];

export default function TransactionManager() {
  const { transactions, wallets, addTransaction, deleteTransaction, categories, addCategory, deleteCategory } = useStore();
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(''); // Chọn ví
  
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterMode, setFilterMode] = useState<'day' | 'month'>('day');

  const [isManagingCats, setIsManagingCats] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🍔');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Bắt buộc chọn ví
    if (!amount || !selectedCategory || !selectedWallet) {
        alert("Vui lòng nhập đủ: Số tiền, Danh mục và Nguồn tiền!");
        return;
    }

    addTransaction({
      id: Date.now().toString(),
      amount: parseFloat(amount),
      type,
      category: selectedCategory,
      walletId: selectedWallet,
      date: new Date().toISOString(),
      note
    });

    setAmount('');
    setNote('');
  };

  const handleAddCategory = () => {
    if (!newCatName) return;
    addCategory({
      id: `cat_${Date.now()}`,
      name: newCatName,
      type: type, 
      isDefault: false,
      icon: newCatIcon
    });
    setNewCatName('');
    setIsManagingCats(false);
  };

  const filteredTransactions = (transactions || []).filter(t => {
    const tDate = parseISO(t.date);
    const fDate = parseISO(filterDate);
    if (activeTab === 'record') return isSameDay(tDate, new Date());
    return filterMode === 'day' ? isSameDay(tDate, fDate) : isSameMonth(tDate, fDate);
  });

  const currentCategories = (categories || []).filter(c => c.type === type);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex bg-black/30 p-1 rounded-2xl w-fit border border-white/5">
          <button 
            onClick={() => setActiveTab('record')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'record' ? 'bg-[#05df72] text-black' : 'text-gray-500 hover:text-white'}`}
          >
            GHI CHÉP
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-[#0ea5e9] text-white' : 'text-gray-500 hover:text-white'}`}
          >
            LỊCH SỬ
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'record' && (
          <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 h-fit">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6">GIAO DỊCH MỚI</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                <button type="button" onClick={() => setType('expense')} className={`py-2 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-white'}`}>CHI TIỀN</button>
                <button type="button" onClick={() => setType('income')} className={`py-2 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-green-500 text-black' : 'text-gray-500 hover:text-white'}`}>THU TIỀN</button>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Số tiền</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full p-4 rounded-xl bg-black/40 border border-white/10 text-2xl font-mono font-bold outline-none transition-colors placeholder-gray-700 ${type === 'expense' ? 'text-red-400 focus:border-red-500' : 'text-green-400 focus:border-green-500'}`} placeholder="0" />
              </div>

              {/* CHỌN NGUỒN TIỀN (VÍ) */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Nguồn tiền</label>
                <div className="relative">
                    <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0ea5e9]" />
                    <select
                        value={selectedWallet}
                        onChange={e => setSelectedWallet(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-[#0ea5e9] appearance-none"
                    >
                        <option value="">-- Chọn ví --</option>
                        {wallets.map(w => (
                            <option key={w.id} value={w.id}>
                                {w.name} ({w.balance.toLocaleString()}đ)
                            </option>
                        ))}
                    </select>
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                   <label className="block text-[10px] uppercase font-bold text-gray-500">Danh mục</label>
                   <button type="button" onClick={() => setIsManagingCats(!isManagingCats)} className="text-[10px] font-bold text-[#0ea5e9] hover:underline flex items-center gap-1">{isManagingCats ? 'ĐÓNG' : '+ THÊM MỚI'}</button>
                </div>
                
                {isManagingCats && (
                  <div className="mb-4 p-4 bg-[#1a1a1a] rounded-xl border border-white/10 animate-fade-in">
                    <div className="flex gap-2 mb-3">
                      <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Tên danh mục..." className="flex-1 p-2 rounded-lg bg-black/50 border border-white/10 text-white text-sm outline-none focus:border-[#0ea5e9]" />
                      <button type="button" onClick={handleAddCategory} className="bg-[#0ea5e9] px-3 rounded-lg text-white"><Plus size={18} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {EMOJI_LIST.map(emoji => (
                            <button key={emoji} type="button" onClick={() => setNewCatIcon(emoji)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${newCatIcon === emoji ? 'bg-[#0ea5e9]/20 border border-[#0ea5e9]' : 'bg-white/5 hover:bg-white/10'}`}>{emoji}</button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {currentCategories.map(c => (
                    <div key={c.id} className="relative group">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory(c.id)}
                            className={`w-full p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${selectedCategory === c.id ? 'bg-white/10 border-[#0ea5e9]' : 'bg-black/20 border-transparent hover:bg-white/5'}`}
                        >
                            <span className="text-xl">{c.icon}</span>
                            <span className="text-[10px] text-gray-400 font-bold truncate w-full text-center">{c.name}</span>
                        </button>
                        {/* Nút xóa danh mục khi hover */}
                        {!c.isDefault && (
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); deleteCategory(c.id); }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                title="Xóa danh mục"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Ghi chú</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-[#0ea5e9] outline-none text-sm" rows={2} placeholder="..." />
              </div>

              <button type="submit" className="w-full py-4 rounded-xl bg-[#05df72] hover:bg-[#04c263] text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#05df72]/20">LƯU GIAO DỊCH</button>
            </form>
          </div>
        )}

        <div className={`${activeTab === 'record' ? 'lg:col-span-2' : 'lg:col-span-3'} bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 min-h-[500px] flex flex-col`}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              {activeTab === 'record' ? 'GIAO DỊCH HÔM NAY' : 'LỊCH SỬ GIAO DỊCH'}
            </h3>
            
            {activeTab === 'history' && (
              <div className="flex gap-2">
                <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                    <input type={filterMode === 'day' ? 'date' : 'month'} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#0ea5e9]" />
                </div>
                <select value={filterMode} onChange={(e) => setFilterMode(e.target.value as 'day'|'month')} className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none">
                  <option value="day">Ngày</option>
                  <option value="month">Tháng</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600"><Search size={48} className="mb-4 opacity-20" /><p className="text-sm">Không tìm thấy giao dịch nào</p></div>
            ) : (
              filteredTransactions.map((t) => {
                const cat = (categories || []).find(c => c.id === t.category);
                const wallet = wallets.find(w => w.id === t.walletId);
                return (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#1a1a1a] border border-white/5`}>{cat?.icon || '📝'}</div>
                      <div>
                        <p className="font-bold text-sm text-gray-200">{cat?.name || 'Khác'}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                            <span>{format(parseISO(t.date), 'HH:mm dd/MM')}</span>
                            {wallet && <span className="bg-white/10 px-1 rounded text-gray-400">{wallet.name}</span>}
                            {t.note && <><span className="text-gray-600">•</span><span className="text-gray-400 italic max-w-[150px] truncate">{t.note}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className={`font-bold font-mono text-sm ${t.type === 'income' ? 'text-[#05df72]' : 'text-red-400'}`}>{t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}</p>
                      <button onClick={() => deleteTransaction(t.id)} className="p-2 rounded-full text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" title="Xóa"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}