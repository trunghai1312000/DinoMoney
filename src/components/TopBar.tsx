import { useState, useEffect } from 'react';
import { BarChart3, Clock as ClockIcon, Lock, PanelLeft, Info, Power, AlertTriangle } from 'lucide-react';
import { UserProfile, Task } from '../types';
import ProductivityReport from './ProductivityReport';
import UserProfileModal from './UserProfile';
import AppInfo from './AppInfo'; 
import { DinoLogo } from './DinoIcon';

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
  const [activePopup, setActivePopup] = useState<'none' | 'report' | 'profile' | 'info'>('none');
  
  // State cho popup xác nhận thoát
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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

  // Hàm thực sự đóng ứng dụng sau khi xác nhận
  const confirmCloseApp = async () => {
      try {
          // Kiểm tra nếu đang chạy trong Tauri
          // @ts-ignore
          if (window.__TAURI__) {
              const { appWindow } = await import('@tauri-apps/api/window');
              await appWindow.close();
          } else {
              // Fallback cho trình duyệt
              window.close();
          }
      } catch (error) {
          console.error("Không thể đóng ứng dụng:", error);
      }
  };

  if (!user) return null;

  return (
    <>
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

      {/* INFO BUTTON */}
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
            className="p-2 rounded-full border border-white/5 bg-black/20 text-zinc-400 hover:text-white hover:bg-black/40 transition-all"
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
      
      {/* EXIT APP BUTTON (Kích hoạt popup xác nhận) */}
      <button 
        onClick={() => setShowExitConfirm(true)}
        className="p-2 rounded-full border border-white/5 bg-black/20 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
        title="Thoát ứng dụng"
      >
        <Power size={20} />
      </button>

      {activePopup !== 'none' && (
          <div className="fixed inset-0 z-[-1]" onClick={() => setActivePopup('none')}></div>
      )}
    </div>

    {/* EXIT CONFIRMATION MODAL */}
    {showExitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#18181b] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center space-y-4 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="relative w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2 border border-red-500/20">
                    <DinoLogo size={28} className="drop-shadow-lg" />
                </div>
                
                <div className="relative">
                    <h3 className="text-xl font-bold text-white mb-1">Nghỉ rồi sao????</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Mới vừa làm đã nghỉ rồi, <span className="text-green-400 font-bold">bỏ DinoFocus</span> thật sao?
                    </p>
                </div>

                <div className="flex gap-3 pt-2 relative z-10">
                    <button
                        onClick={() => setShowExitConfirm(false)}
                        className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all font-bold text-sm"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={confirmCloseApp}
                        className="flex-1 py-3 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-all font-bold text-sm shadow-lg shadow-red-900/20 hover:shadow-red-900/40 active:scale-95"
                    >
                        Đồng ý
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default TopBar;