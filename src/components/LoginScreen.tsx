import React, { useState } from 'react';
import { ArrowRight, Lock, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';
import { DinoIcon } from './DinoIcon';

interface LoginScreenProps {
  isSetup: boolean;
  onLogin: (password: string) => void;
  errorMsg: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ isSetup, onLogin, errorMsg }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#05df72]/10 rounded-full blur-[120px] animate-pulse-slow"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0ea5e9]/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
         {/* Grid lines */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="w-full max-w-5xl h-[600px] bg-black/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 shadow-2xl flex overflow-hidden relative z-10 animate-scale-up">
         
         {/* Left Side: Brand Area */}
         <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#111] to-black relative border-r border-white/5">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
             
             <div>
                <div className="w-16 h-16 bg-[#05df72]/10 rounded-2xl flex items-center justify-center text-[#05df72] mb-6 border border-[#05df72]/20">
                    <DinoIcon className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">DinoMoney</h1>
                <p className="text-gray-500 font-mono text-sm">Secure Financial Terminal v2.1</p>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-400 group">
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#05df72]/10 group-hover:text-[#05df72] transition-colors">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Local Encrypted</h3>
                        <p className="text-xs">Dữ liệu chỉ lưu trên thiết bị của bạn.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400 group">
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#0ea5e9]/10 group-hover:text-[#0ea5e9] transition-colors">
                        <Terminal size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Smart Analytics</h3>
                        <p className="text-xs">Phân tích dòng tiền thông minh.</p>
                    </div>
                </div>
             </div>

             <div className="text-[10px] text-gray-600 font-mono">
                System ID: {Math.random().toString(36).substring(7).toUpperCase()}
             </div>
         </div>

         {/* Right Side: Login Form */}
         <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center relative">
            <div className="max-w-xs mx-auto w-full">
                <div className="mb-8 text-center lg:text-left">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isSetup ? "Chào mừng trở lại" : "Thiết lập hệ thống"}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isSetup ? "Nhập mã khóa để truy cập két sắt." : "Tạo mã khóa bảo mật để bắt đầu."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={18} className={`transition-colors ${password ? 'text-[#05df72]' : 'text-gray-500'}`} />
                        </div>
                        <input 
                            type="password" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:border-[#05df72] focus:bg-black/50 focus:ring-1 focus:ring-[#05df72] outline-none transition-all font-mono text-lg tracking-[0.3em] shadow-inner"
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {errorMsg && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-shake">
                            <AlertCircle size={14} />
                            {errorMsg}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full group bg-white text-black font-bold py-4 rounded-2xl transition-all hover:bg-[#05df72] hover:shadow-[0_0_20px_rgba(5,223,114,0.4)] flex items-center justify-center gap-2"
                    >
                        <span>{isSetup ? "MỞ KHÓA" : "KHỞI TẠO"}</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                        Secured by DinoMoney Core
                    </p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LoginScreen;