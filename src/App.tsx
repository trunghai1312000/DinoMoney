import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TransactionManager from "./components/TransactionManager";
import WalletManager from "./components/WalletManager";
import GoldManager from "./components/GoldManager";
import Statistics from "./components/Statistics";
import LoginScreen from "./components/LoginScreen";
import { useStore } from "./store/useStore";
import { format } from "date-fns";
import { Power, Info, Clock, X, Trash2} from "lucide-react";
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core'; // Import invoke để gọi Rust
import { DinoIcon } from './components/DinoIcon';

function App() {
  const _hasHydrated = useStore(state => state._hasHydrated);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAbout, setShowAbout] = useState(false);
  
  const { userPassword, setUserPassword, fetchGoldData, resetAllData } = useStore();
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (_hasHydrated) {
        fetchGoldData();
        const interval = setInterval(() => fetchGoldData(), 2 * 60 * 60 * 1000); 
        return () => clearInterval(interval);
    }
  }, [fetchGoldData, _hasHydrated]);

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // --- WINDOW CONTROLS ---

  // Thoát hẳn ứng dụng (Gọi xuống Rust)
  const handleQuitApp = async () => {
    try {
        await invoke('quit_app');
    } catch (e) {
        console.error("Quit failed", e);
        // Fallback nếu Rust command chưa sẵn sàng
        const win = getCurrentWindow();
        await win.close(); 
    }
  };


  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginError(""); 
    setActiveTab("dashboard");
  };

  const handleLogin = (password: string) => {
    if (!password) {
        setLoginError("Vui lòng nhập mật khẩu");
        return;
    }

    if (!userPassword) {
        if (password.length < 4) {
             setLoginError("Mật khẩu phải ít nhất 4 ký tự");
             return;
        }
        setUserPassword(password);
        setIsLoggedIn(true);
    } else {
        if (password === userPassword) {
            setIsLoggedIn(true);
            setLoginError("");
        } else {
            setLoginError("Mật khẩu không đúng");
        }
    }
  };

  if (!_hasHydrated) {
    return (
        <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute w-[500px] h-[500px] bg-[#05df72]/5 rounded-full blur-[100px] animate-pulse"></div>
             <div className="relative z-10 flex flex-col items-center">
                <DinoIcon className="w-16 h-16 text-[#05df72] animate-bounce" />
                <h2 className="mt-8 text-white font-bold text-xl tracking-widest animate-pulse">SYSTEM INITIALIZING...</h2>
                <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#05df72] w-1/2 animate-[shimmer_1s_infinite_linear]"></div>
                </div>
                <p className="mt-2 text-[#05df72] font-mono text-xs">Loading Secure Vault</p>
             </div>
        </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen isSetup={!!userPassword} onLogin={handleLogin} errorMsg={loginError} />;
  }

  return (
    <div className="flex h-screen w-full text-white overflow-hidden relative bg-[#0a0a0a]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLock={handleLogout} />
      
      <main className="flex-1 flex flex-col relative bg-gradient-to-br from-[#0a0a0a] to-[#111] overflow-hidden">
        {/* HEADER (Custom Titlebar) */}
        <div 
            className="h-14 flex items-center justify-end px-6 border-b border-white/5 bg-black/20 backdrop-blur-sm gap-4 shrink-0 z-50"
            data-tauri-drag-region // Cho phép kéo cửa sổ
        >
            <div className="flex items-center gap-2 text-gray-400 text-xs font-mono border-r border-white/10 pr-4 pointer-events-none">
                <Clock size={14} className="text-[#05df72]" />
                <span>{format(currentTime, "HH:mm:ss")}</span>
                <span className="text-gray-600">|</span>
                <span>{format(currentTime, "dd/MM/yyyy")}</span>
            </div>

            <div className="flex items-center gap-2">
                {/* Nút Thông tin */}
                <button onClick={() => setShowAbout(true)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-[#0ea5e9] transition-all" title="Thông tin">
                    <Info size={16} />
                </button>
        
                {/* Nút Thoát hẳn (Quit) */}
                <button onClick={handleQuitApp} className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-all" title="Thoát hẳn">
                    <Power size={16} />
                </button>
            </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
           <div className="max-w-7xl mx-auto">
              {(() => {
                switch (activeTab) {
                    case "dashboard": return <Dashboard />;
                    case "transactions": return <TransactionManager />;
                    case "wallets": return <WalletManager />;
                    case "gold": return <GoldManager />;
                    case "statistics": return <Statistics />;
                    default: return <Dashboard />;
                }
              })()}
           </div>
        </div>

        {/* ABOUT MODAL */}
        {showAbout && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
                <div className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-sm w-full relative shadow-2xl overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#05df72] to-transparent opacity-50"></div>
                    
                    <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                    
                    <div className="flex flex-col items-center text-center relative z-10">
                        {/* Logo Area */}
                        <div className="mb-6 relative group cursor-default">
                            <div className="absolute inset-0 bg-[#05df72] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <DinoIcon className="w-20 h-20 text-[#05df72] relative z-10 drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300" />
                        </div>

                        {/* Title & Version */}
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tighter italic">DinoMoney</h2>
                        
                        <div className="mb-6">
                             <span className="px-3 py-1 rounded-full bg-[#05df72]/10 border border-[#05df72]/20 text-[#05df72] text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(5,223,114,0.1)]">
                                v1.0 Beta Build
                            </span>
                        </div>

                        <p className="text-gray-400 text-sm mb-8 leading-relaxed px-4">
                            Tiết kiệm thôi
                        </p>

                        {/* Divider */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

                        {/* Credits */}
                        <div className="flex flex-col items-center gap-1 mb-8">
                            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">POWERED BY</span>
                            <span className="text-white font-bold tracking-wide flex items-center gap-2">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#05df72] to-[#0ea5e9]">SlenderIt</span>
                            </span>
                             <div className="text-[10px] text-gray-700 font-mono mt-1">&copy; 2026 NTH</div>
                        </div>
                        
                        {/* Factory Reset Button */}
                        <button 
                            onClick={() => {
                                if (window.confirm("CẢNH BÁO: Hành động này sẽ xóa TOÀN BỘ dữ liệu và không thể khôi phục. Bạn có chắc chắn không?")) {
                                    resetAllData();
                                }
                            }}
                            className="group w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-500 rounded-xl text-xs font-bold transition-all duration-300"
                        >
                            <Trash2 size={14} className="group-hover:scale-110 transition-transform" /> 
                            FACTORY RESET
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;