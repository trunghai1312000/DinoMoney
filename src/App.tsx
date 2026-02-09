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
import { Power, Info, Clock, X, Trash2 } from "lucide-react";
import { getCurrentWindow } from '@tauri-apps/api/window';
import { DinoIcon } from './components/DinoIcon';

function App() {
  // Lấy trạng thái hydrated từ store
  const _hasHydrated = useStore(state => state._hasHydrated);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAbout, setShowAbout] = useState(false);
  
  const { userPassword, setUserPassword, fetchGoldData, resetAllData } = useStore();
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Chỉ fetch data khi đã hydrate xong để đảm bảo API key đúng
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

  const handleCloseApp = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch (err) {
      console.error("Close app failed:", err);
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

  // MÀN HÌNH CHỜ (LOADING SCREEN)
  if (!_hasHydrated) {
    return (
        <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background Pulse */}
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
      
      <main className="flex-1 flex flex-col relative bg-linear-to-br from-[#0a0a0a] to-[#111] overflow-hidden">
        {/* HEADER */}
        <div className="h-14 flex items-center justify-end px-6 border-b border-white/5 bg-black/20 backdrop-blur-sm gap-4 shrink-0 z-50">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-mono border-r border-white/10 pr-4">
                <Clock size={14} className="text-[#05df72]" />
                <span>{format(currentTime, "HH:mm:ss")}</span>
                <span className="text-gray-600">|</span>
                <span>{format(currentTime, "dd/MM/yyyy")}</span>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={() => setShowAbout(true)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-[#0ea5e9] transition-all" title="Thông tin">
                    <Info size={16} />
                </button>
                <button onClick={handleCloseApp} className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-all" title="Thoát hẳn">
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
                <div className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-sm w-full relative shadow-2xl">
                    <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                    <div className="flex flex-col items-center text-center">
                        <h2 className="text-2xl font-bold text-white mb-1">DinoMoney</h2>
                        <p className="text-[#05df72] text-xs font-mono mb-4">v2.2 Performance</p>
                        <p className="text-gray-400 text-sm mb-6">Quản lý tài chính cá nhân toàn diện.</p>
                        <div className="text-xs text-gray-600 font-mono mb-6">&copy; 2024 TrungHai</div>
                        
                        <button 
                            onClick={() => {
                                if (window.confirm("CẢNH BÁO: Hành động này sẽ xóa TOÀN BỘ dữ liệu và không thể khôi phục. Bạn có chắc chắn không?")) {
                                    resetAllData();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-500 hover:bg-red-900/50 rounded-lg text-xs font-bold transition-all"
                        >
                            <Trash2 size={12} /> FACTORY RESET
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