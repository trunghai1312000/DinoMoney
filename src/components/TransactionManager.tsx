import { useState } from 'react';
import { useStore } from '../store/useStore';
import { format, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { TransactionType, Category } from '../types';
import { Plus, X, Trash2 } from 'lucide-react'; // Import icons

export default function TransactionManager() {
  const { transactions, addTransaction, deleteTransaction, categories, addCategory, deleteCategory } = useStore();
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  
  // State form nhập liệu
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // State filter history
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterMode, setFilterMode] = useState<'day' | 'month'>('day');

  // State Manage Categories Modal
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📝');

  // -- LOGIC --
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedCategory) return;

    addTransaction({
      id: Date.now().toString(),
      amount: parseFloat(amount),
      type,
      category: selectedCategory,
      date: new Date().toISOString(),
      note
    });

    // Reset form
    setAmount('');
    setNote('');
  };

  const handleAddCategory = () => {
    if (!newCatName) return;
    addCategory({
      id: `cat_${Date.now()}`,
      name: newCatName,
      type: type, // Thêm vào loại hình đang chọn (Thu hoặc Chi)
      isDefault: false,
      icon: newCatIcon
    });
    setNewCatName('');
  };

  const filteredTransactions = (transactions || []).filter(t => {
    const tDate = parseISO(t.date);
    const fDate = parseISO(filterDate);
    
    if (activeTab === 'record') {
      return isSameDay(tDate, new Date()); // Chỉ hiện hôm nay
    }
    
    if (filterMode === 'day') {
      return isSameDay(tDate, fDate);
    } else {
      return isSameMonth(tDate, fDate);
    }
  });

  // Lọc category theo loại đang chọn
  const currentCategories = (categories || []).filter(c => c.type === type);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Sổ Thu Chi 💸
        </h2>
        <div className="flex bg-white/10 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('record')}
            className={`px-4 py-2 rounded-md transition-all ${activeTab === 'record' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Ghi chép
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md transition-all ${activeTab === 'history' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Lịch sử
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột Trái: Form nhập liệu (Chỉ hiện ở Tab Record) */}
        {activeTab === 'record' && (
          <div className="glass-panel rounded-2xl p-6 h-fit relative">
            <h3 className="text-xl font-semibold text-white mb-4">Giao dịch mới</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Switch Thu/Chi */}
              <div className="flex gap-2 p-1 bg-black/20 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 rounded-md transition-all font-medium ${type === 'expense' ? 'bg-red-500/80 text-white shadow' : 'text-gray-400'}`}
                >
                  Chi tiền
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 rounded-md transition-all font-medium ${type === 'income' ? 'bg-green-500/80 text-white shadow' : 'text-gray-400'}`}
                >
                  Thu tiền
                </button>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Số tiền</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-lg glass-input text-lg font-bold text-green-400"
                  placeholder="0"
                />
              </div>

              {/* Phần Chọn Category với nút Quản lý */}
              <div>
                <label className="block text-sm text-gray-400 mb-1 flex justify-between">
                   Danh mục
                   <button 
                     type="button"
                     onClick={() => setIsManagingCats(!isManagingCats)}
                     className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                   >
                     {isManagingCats ? 'Đóng' : '+ Quản lý'}
                   </button>
                </label>
                
                {/* Khu vực thêm/xóa category */}
                {isManagingCats && (
                  <div className="mb-2 p-3 bg-white/5 rounded-lg border border-white/10 animate-fade-in">
                    <div className="flex gap-2 mb-3">
                      <input 
                         value={newCatName}
                         onChange={e => setNewCatName(e.target.value)}
                         placeholder="Tên danh mục mới..."
                         className="flex-1 p-2 rounded glass-input text-sm"
                      />
                      <button 
                         type="button" 
                         onClick={handleAddCategory}
                         className="bg-blue-600 hover:bg-blue-500 px-3 rounded text-white flex items-center"
                      >
                         <Plus size={16} />
                      </button>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {currentCategories.map(c => (
                        <div key={c.id} className="flex justify-between items-center bg-black/20 px-2 py-1 rounded text-sm">
                           <span>{c.icon} {c.name}</span>
                           {!c.isDefault && (
                             <button 
                               type="button" 
                               onClick={() => deleteCategory(c.id)}
                               className="text-red-400 hover:text-red-300"
                             >
                               <Trash2 size={14} />
                             </button>
                           )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 rounded-lg glass-input bg-slate-800 appearance-none"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {currentCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Ghi chú</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 rounded-lg glass-input"
                  rows={2}
                  placeholder="Mua gì đó..."
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-lg glass-button font-bold text-lg">
                Lưu giao dịch
              </button>
            </form>
          </div>
        )}

        {/* Cột Phải: Danh sách giao dịch */}
        <div className={`${activeTab === 'record' ? 'lg:col-span-2' : 'lg:col-span-3'} glass-panel rounded-2xl p-6 min-h-[500px] flex flex-col`}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white">
              {activeTab === 'record' ? 'Giao dịch hôm nay' : 'Lịch sử giao dịch'}
            </h3>
            
            {activeTab === 'history' && (
              <div className="flex gap-2">
                <select 
                  value={filterMode} 
                  onChange={(e) => setFilterMode(e.target.value as 'day'|'month')}
                  className="glass-input p-2 rounded-lg bg-slate-800 text-sm"
                >
                  <option value="day">Theo ngày</option>
                  <option value="month">Theo tháng</option>
                </select>
                <input 
                  type={filterMode === 'day' ? 'date' : 'month'}
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="glass-input p-2 rounded-lg bg-slate-800 text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredTransactions.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p className="text-6xl mb-4">💤</p>
                <p>Không có giao dịch nào {activeTab === 'record' ? 'hôm nay' : 'trong khoảng thời gian này'}</p>
              </div>
            ) : (
              filteredTransactions.map((t) => {
                const cat = (categories || []).find(c => c.id === t.category);
                return (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${t.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {cat?.icon || (t.type === 'income' ? '⬇️' : '⬆️')}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{cat?.name || 'Khác'}</p>
                        <p className="text-xs text-gray-400">{t.note} • {format(parseISO(t.date), 'HH:mm dd/MM')}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className={`font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                      </p>
                      <button 
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                        title="Xóa giao dịch"
                      >
                        <Trash2 size={16} />
                      </button>
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