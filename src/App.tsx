import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TransactionManager from "./components/TransactionManager";
import WalletManager from "./components/WalletManager";
import GoldManager from "./components/GoldManager";
import Statistics from "./components/Statistics";
import LoginScreen from "./components/LoginScreen";
import { useStore } from "./store/useStore";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const fetchGoldData = useStore(state => state.fetchGoldData);

  useEffect(() => {
    fetchGoldData();
    const interval = setInterval(() => {
      fetchGoldData();
    }, 2 * 60 * 60 * 1000); // 2 giờ

    return () => clearInterval(interval);
  }, [fetchGoldData]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />;
      case "transactions": return <TransactionManager />;
      case "wallets": return <WalletManager />;
      case "gold": return <GoldManager />;
      case "statistics": return <Statistics />;
      default: return <Dashboard />;
    }
  };

  return (
    // Bỏ background decoration, giữ layout sạch
    <div className="flex h-screen w-full text-white overflow-hidden relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-7xl mx-auto animate-fade-in">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;