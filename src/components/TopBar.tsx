import { useState, useEffect } from 'react';
import { BarChart3, Clock as ClockIcon, Lock, PanelLeft, Info } from 'lucide-react';
import { UserProfile, Task } from '../types';
import ProductivityReport from './ProductivityReport';
import UserProfileModal from './UserProfile';
import AppInfo from './AppInfo'; // Import mới

interface TopBarProps {
  user: UserProfile | null;
  tasks: Task[];
  onUpdateUser: (user: UserProfile) => void;
  onLock: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const TopBar = ({ user, tasks, onUpdateUser, onLock, isSidebarOpen, onToggleSidebar }: TopBarProps) => {
  const [time, setTime] = useState(new Date());
  // Thêm state 'info'
  const [activePopup, setActivePopup] = useState<'none' | 'report' | 'profile' | 'info'>('none');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const handleToggle = (popup: 'report' | 'profile' | 'info') => {
      setActivePopup(activePopup === popup ? 'none' : popup);
  };

  if (!user) return null;

  return (
    <div className="absolute top-6 right-6 z-50 flex items-start gap-3 pointer-events-auto">
      
      {/* SIDEBAR TOGGLE */}
      <button 
        onClick={onToggleSidebar}
        className={`p-2 rounded-full border transition-all ${!isSidebarOpen ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-black/20 text-zinc-400 border-white/5 hover:text-white hover:bg-black/40'}`}
        title={isSidebarOpen ? "Ẩn thanh bên" : "Hiện thanh bên"}
      >
        <PanelLeft size={20} />
      </button>

      {/* CLOCK */}
      <div className="flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/5 rounded-full shadow-lg select-none hover:bg-black/30 transition-colors cursor-default">
         <ClockIcon size={14} className="text-zinc-400" />
         <span className="text-sm font-mono font-bold text-zinc-200 tracking-widest">{formatTime(time)}</span>
      </div>

      {/* INFO BUTTON (New) */}
      <div className="relative">
         <button 
            onClick={() => handleToggle('info')}
            className={`p-2 rounded-full border transition-all ${activePopup === 'info' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-black/20 text-zinc-400 border-white/5 hover:text-white hover:bg-black/40'}`}
            title="Thông tin ứng dụng"
         >
            <Info size={20} />
         </button>
         {activePopup === 'info' && (
             <div className="absolute top-full right-0 mt-3">
                 <AppInfo onClose={() => setActivePopup('none')} />
             </div>
         )}
      </div>

      {/* REPORT */}
      <div className="relative">
         <button 
            onClick={() => handleToggle('report')}
            className={`p-2 rounded-full border transition-all ${activePopup === 'report' ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'bg-black/20 text-zinc-400 border-white/5 hover:text-white hover:bg-black/40'}`}
            title="Báo cáo năng suất"
         >
            <BarChart3 size={20} />
         </button>
         {activePopup === 'report' && (
             <div className="absolute top-full right-0 mt-3">
                 <ProductivityReport tasks={tasks} user={user} onClose={() => setActivePopup('none')} />
             </div>
         )}
      </div>

      {/* LOCK */}
       <button 
            onClick={onLock}
            className="p-2 rounded-full border border-white/5 bg-black/20 text-zinc-400 hover:text-red-400 hover:bg-black/40 transition-all"
            title="Khóa màn hình"
         >
            <Lock size={20} />
       </button>

      {/* PROFILE */}
      <div className="relative">
         <button 
            onClick={() => handleToggle('profile')}
            className={`w-9 h-9 rounded-full border overflow-hidden transition-all ${activePopup === 'profile' ? 'ring-2 ring-blue-500 border-transparent' : 'border-white/10 hover:border-white/30'}`}
         >
             <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
         </button>
         {activePopup === 'profile' && (
             <div className="absolute top-full right-0 mt-3">
                 <UserProfileModal user={user} onUpdate={onUpdateUser} onClose={() => setActivePopup('none')} />
             </div>
         )}
      </div>

      {activePopup !== 'none' && (
          <div className="fixed inset-0 z-[-1]" onClick={() => setActivePopup('none')}></div>
      )}

    </div>
  );
};

export default TopBar;