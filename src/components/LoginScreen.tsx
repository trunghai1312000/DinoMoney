import React, { useState } from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import { DinoIcon } from './DinoIcon';

interface LoginScreenProps {
  isSetup: boolean;
  onLogin: (password: string) => void;
  errorMsg: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ isSetup, onLogin, errorMsg }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onLogin(password);
  };

  return (
    <div className="h-screen bg-[#020202] flex flex-col items-center justify-center p-4 font-sans text-white overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#05df72] rounded-full blur-[200px] opacity-[0.08] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-black/40 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <div className="flex justify-center mb-8">
            <div className="relative">
                <div className="absolute inset-0 bg-[#05df72] blur-xl opacity-30 animate-pulse"></div>
                <DinoIcon className="w-20 h-20 text-[#05df72] relative z-10" />
            </div>
            </div>
            
            <h1 className="text-3xl font-black text-center mb-2 italic tracking-tighter">
            {isSetup ? "SYSTEM LOCKED" : "INITIAL SETUP"}
            </h1>
            <p className="text-gray-500 text-center mb-8 text-xs uppercase tracking-widest font-mono">
            {isSetup ? "Secure Financial Terminal" : "Create Master Password"}
            </p>
            
            <div className="relative group mb-4">
                <input 
                type="password" 
                placeholder="ENTER PASSCODE..." 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-center text-white placeholder-gray-700 focus:border-[#05df72] focus:ring-1 focus:ring-[#05df72] outline-none transition-all font-mono text-lg tracking-[0.5em]"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoFocus
                />
            </div>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center py-2 rounded-lg mb-4 font-mono">
                    ERROR: {errorMsg}
                </div>
            )}
            
            <button 
            onClick={handleSubmit} 
            className="w-full bg-[#05df72] hover:bg-[#04c463] text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(5,223,114,0.4)] hover:shadow-[0_0_30px_-5px_rgba(5,223,114,0.6)] flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
            {isSetup ? <><Lock size={16}/> Unlock System</> : <><ChevronRight size={16}/> Initialize</>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;