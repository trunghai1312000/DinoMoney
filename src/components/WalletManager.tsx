import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Wallet } from '../types';
import { Trash2, Plus, CreditCard, Banknote, PiggyBank, Smartphone, Wallet as WalletIcon, Layers, ShieldCheck, Wifi } from 'lucide-react';

export default function WalletManager() {
  const { wallets = [], addWallet, deleteWallet } = useStore(); 
  
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<Wallet['type']>('bank');
  const [accountNumber, setAccountNumber] = useState('');

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Chỉ lưu số tài khoản nếu là ngân hàng
    const finalAccountNumber = type === 'bank' || type === 'credit' ? accountNumber : '';

    addWallet({
      id: Date.now().toString(),
      name,
      balance: parseFloat(balance) || 0,
      type,
      color: getRandomColor(type),
      accountNumber: finalAccountNumber
    });

    setName('');
    setBalance('');
    setAccountNumber('');
  };

  const getRandomColor = (type: string) => {
     if (type === 'ewallet') return 'from-pink-600 to-rose-600';
     if (type === 'savings') return 'from-emerald-600 to-teal-700';
     if (type === 'credit') return 'from-slate-700 to-slate-900';
     const colors = ['from-blue-600 to-blue-800', 'from-indigo-600 to-indigo-800', 'from-violet-600 to-violet-800'];
     return colors[Math.floor(Math.random() * colors.length)];
  };

  const getTypeName = (type: string) => {
    switch(type) {
        case 'bank': return 'Ngân hàng';
        case 'credit': return 'Thẻ tín dụng';
        case 'savings': return 'Tiết kiệm';
        case 'ewallet': return 'Ví điện tử';
        case 'cash': return 'Tiền mặt';
        default: return 'Khác';
    }
  };

  const totalBalance = wallets.reduce((acc, cur) => acc + cur.balance, 0);

  // --- RENDER CARD COMPONENTS ---

  const BankCard = ({ wallet }: { wallet: Wallet }) => (
    <div className={`relative p-6 rounded-2xl overflow-hidden shadow-lg transform transition-transform hover:-translate-y-1 bg-linear-to-br ${wallet.color || 'from-blue-700 to-blue-900'} min-h-[180px] flex flex-col justify-between border border-white/10`}>
        <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard size={120} /></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{getTypeName(wallet.type)}</p>
                <h4 className="text-white text-lg font-bold tracking-wide">{wallet.name}</h4>
            </div>
            <div className="w-10 h-8 bg-yellow-200/20 rounded border border-yellow-200/30 backdrop-blur-sm flex items-center justify-center">
                 <div className="w-6 h-5 border border-yellow-500/30 rounded-sm"></div>
            </div>
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 font-mono text-sm tracking-[0.2em] mb-4">
                <span>****</span><span>****</span><span>****</span>
                <span className="text-white font-bold">{wallet.accountNumber || '8888'}</span>
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[9px] text-white/50 uppercase">Số dư khả dụng</p>
                    <p className="text-xl font-bold text-white font-mono">{wallet.balance.toLocaleString()} <span className="text-xs font-sans font-normal opacity-70">₫</span></p>
                </div>
                {wallet.type === 'credit' ? <CreditCard size={20} className="text-white/50"/> : <Banknote size={20} className="text-white/50"/>}
            </div>
        </div>
        <button onClick={() => deleteWallet(wallet.id)} className="absolute top-3 right-3 p-1.5 bg-black/20 text-white/30 hover:text-red-400 hover:bg-black/40 rounded-full transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
    </div>
  );

  const EWalletCard = ({ wallet }: { wallet: Wallet }) => (
    <div className="relative p-5 rounded-3xl overflow-hidden shadow-lg transform transition-transform hover:-translate-y-1 bg-linear-to-br from-pink-500 via-rose-500 to-orange-500 min-h-[180px] flex flex-col justify-between border border-white/10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex justify-between items-center">
             <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Smartphone size={20} className="text-white" />
             </div>
             <Wifi size={16} className="text-white/60" />
        </div>
        <div className="relative z-10 text-center my-2">
            <h4 className="text-white font-bold text-lg">{wallet.name}</h4>
            <p className="text-white/70 text-xs">Ví điện tử</p>
        </div>
        <div className="relative z-10 bg-black/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
             <p className="text-2xl font-bold text-white font-mono">{wallet.balance.toLocaleString()}</p>
        </div>
        <button onClick={() => deleteWallet(wallet.id)} className="absolute top-3 right-3 p-1.5 text-white/50 hover:text-white transition-all"><Trash2 size={14} /></button>
    </div>
  );

  const CashCard = ({ wallet }: { wallet: Wallet }) => (
    <div className="relative p-6 rounded-tl-none rounded-tr-3xl rounded-br-3xl rounded-bl-3xl overflow-hidden shadow-lg transform transition-transform hover:-translate-y-1 bg-linear-to-br from-[#1e293b] to-[#0f172a] border-l-4 border-[#05df72] min-h-[180px] flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-6 opacity-5"><WalletIcon size={100} /></div>
        <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-[#05df72]/20 rounded-full text-[#05df72]">
                <Banknote size={20} />
            </div>
            <div>
                <h4 className="text-[#05df72] font-bold text-lg uppercase tracking-wide">{wallet.name}</h4>
                <p className="text-gray-500 text-xs">Nguồn mặc định</p>
            </div>
        </div>
        <div className="relative z-10 border-t border-dashed border-gray-700 pt-4 mt-2">
            <div className="flex justify-between items-end">
                <p className="text-gray-400 text-xs">Tổng tiền</p>
                <p className="text-3xl font-bold text-white font-mono">{wallet.balance.toLocaleString()} <span className="text-sm text-gray-500 font-sans">VND</span></p>
            </div>
        </div>
        {/* KHÔNG CÓ NÚT XÓA CHO CASH */}
    </div>
  );

  const SavingsCard = ({ wallet }: { wallet: Wallet }) => (
    <div className="relative p-6 rounded-2xl overflow-hidden shadow-lg transform transition-transform hover:-translate-y-1 bg-linear-to-br from-emerald-600 to-teal-800 min-h-[180px] flex flex-col justify-between border border-white/10">
        <div className="absolute -right-6 -bottom-6 opacity-20"><PiggyBank size={120} className="text-white" /></div>
        <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                    <ShieldCheck size={20} className="text-white" />
                </div>
                <div className="px-2 py-1 bg-white/10 rounded text-[10px] text-white uppercase font-bold tracking-wider">Tiết kiệm</div>
             </div>
             <h4 className="text-white font-bold text-xl">{wallet.name}</h4>
        </div>
        <div className="relative z-10">
             <p className="text-emerald-200 text-xs mb-1">Giá trị hiện tại</p>
             <p className="text-2xl font-bold text-white font-mono border-b border-white/20 pb-2 inline-block w-full">{wallet.balance.toLocaleString()} ₫</p>
        </div>
        <button onClick={() => deleteWallet(wallet.id)} className="absolute top-3 right-3 p-1.5 text-white/30 hover:text-white transition-all"><Trash2 size={14} /></button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-black/30 backdrop-blur-md border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#0ea5e9]/10 rounded-lg text-[#0ea5e9]">
                        <Plus size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">THÊM TÀI KHOẢN</h3>
                </div>
                
                <form onSubmit={handleAddWallet} className="space-y-5">
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Loại tài khoản</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-[#0ea5e9] outline-none text-sm appearance-none"
                        >
                            <option value="bank">Ngân hàng</option>
                            <option value="ewallet">Ví điện tử</option>
                            <option value="credit">Thẻ tín dụng</option>
                            <option value="savings">Sổ tiết kiệm</option>
                            {/* ĐÃ ẨN TIỀN MẶT */}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Tên gợi nhớ</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-[#0ea5e9] outline-none text-sm"
                            placeholder={type === 'bank' ? "VD: Vietcombank" : type === 'ewallet' ? "VD: MoMo" : "Tên ví..."}
                        />
                    </div>

                    {(type === 'bank' || type === 'credit') && (
                        <div className="animate-fade-in">
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">4 Số cuối thẻ/TK</label>
                            <input
                                type="text"
                                maxLength={4}
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g,''))}
                                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-[#0ea5e9] outline-none text-sm font-mono tracking-widest text-center"
                                placeholder="8888"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Số dư ban đầu</label>
                        <input
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-[#0ea5e9] outline-none text-sm font-mono"
                            placeholder="0"
                        />
                    </div>
                
                    <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm transition-all shadow-lg shadow-[#0ea5e9]/20">
                        TẠO NGAY
                    </button>
                </form>
            </div>
            
            <div className="bg-linear-to-br from-[#1a1a1a] to-black border border-white/5 rounded-3xl p-6">
                <p className="text-gray-500 text-xs font-bold uppercase mb-2">Tổng tài sản</p>
                <p className="text-[#05df72] font-mono text-3xl font-bold break-words">
                    {totalBalance.toLocaleString()} ₫
                </p>
            </div>
        </div>

        <div className="lg:col-span-8">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 px-2">NGUỒN TIỀN CỦA TÔI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(wallets || []).map((wallet) => {
                    const CardComponent = () => {
                        switch(wallet.type) {
                            case 'cash': return <CashCard wallet={wallet} />;
                            case 'ewallet': return <EWalletCard wallet={wallet} />;
                            case 'savings': return <SavingsCard wallet={wallet} />;
                            case 'bank': 
                            case 'credit': 
                            default: return <BankCard wallet={wallet} />;
                        }
                    };
                    return (
                        <div key={wallet.id} className="group">
                           <CardComponent />
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
}