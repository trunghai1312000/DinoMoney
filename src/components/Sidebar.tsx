import React from 'react';
import { LayoutDashboard, Wallet, Receipt, Coins, BarChart3, Lock } from 'lucide-react';
import { DinoIcon } from './DinoIcon';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLock: () => void;
}


const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLock }) => {
  return (
    <aside className="w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col h-full relative z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
      <div className="p-8 flex items-center gap-4 select-none">
        <div className="relative group">
            <div className="absolute inset-0 bg-[#05df72] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <DinoIcon className="w-10 h-10 text-[#05df72] relative z-10 drop-shadow-[0_0_5px_rgba(5,223,114,0.8)]" />
        </div>
        <div>
            <span className="font-black text-xl tracking-tighter text-white italic">DINO<span className="text-[#05df72]">MONEY</span></span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-3 mt-4">
        <SidebarItem icon={<LayoutDashboard size={20}/>} label="Tổng quan" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <SidebarItem icon={<Wallet size={20}/>} label="Ví & Tài khoản" active={activeTab === 'wallets'} onClick={() => setActiveTab('wallets')} />
        <SidebarItem icon={<Receipt size={20}/>} label="Sổ Thu Chi" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
        <SidebarItem icon={<BarChart3 size={20}/>} label="Thống kê" active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} />
        <SidebarItem icon={<Coins size={20}/>} label="Đầu tư Vàng" active={activeTab === 'gold'} onClick={() => setActiveTab('gold')} />
      </nav>

      {/* Footer & Lock Button */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <button 
            onClick={onLock}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-xs font-bold uppercase tracking-widest border border-white/5 hover:border-rose-500/30"
        >
            <Lock size={14} /> Khóa Màn Hình
        </button>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
      active 
        ? 'text-white' 
        : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
    }`}
  >
    {active && (
      <>
        <div className="absolute inset-0 bg-[#05df72] opacity-10"></div>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#05df72] shadow-[0_0_15px_#05df72]"></div>
      </>
    )}
    
    <span className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110 text-[#05df72]' : 'group-hover:scale-110 group-hover:text-[#05df72]'}`}>
      {icon}
    </span>
    <span className="relative z-10 text-sm font-bold tracking-wide">{label}</span>
  </button>
);

export default Sidebar;