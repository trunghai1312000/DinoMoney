import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Lock, User, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { DinoLogo } from './DinoIcon';

interface AuthOverlayProps {
  onLogin: (user: UserProfile) => void;
}

const AuthOverlay = ({ onLogin }: AuthOverlayProps) => {
  const [mode, setMode] = useState<'setup' | 'login'>('setup');
  const [formData, setFormData] = useState({ username: '', password: '', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' });
  const [error, setError] = useState('');
  const [savedUser, setSavedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('dino_user_profile');
    if (stored) {
      const user = JSON.parse(stored);
      setSavedUser(user);
      setMode('login');
      // Set default avatar if setup
      setFormData(prev => ({ ...prev, avatarUrl: user.avatarUrl || prev.avatarUrl, username: user.username }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'setup') {
      if (!formData.username.trim() || !formData.password.trim()) {
        setError('Vui lòng nhập đầy đủ tên và mật khẩu.');
        return;
      }
      const newUser: UserProfile = {
        username: formData.username,
        avatarUrl: formData.avatarUrl,
        password: formData.password,
        joinedAt: new Date().toISOString(), // Thêm ngày tham gia
        isSetup: true
      };
      localStorage.setItem('dino_user_profile', JSON.stringify(newUser));
      onLogin(newUser);
    } else {
      // Login mode
      if (savedUser && formData.password === savedUser.password) {
        onLogin(savedUser);
      } else {
        setError('Mật khẩu không đúng!');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center font-sans">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-sm"></div>
      
      <div className="relative w-full max-w-md p-8 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
             <DinoLogo size={48} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {mode === 'setup' ? 'Thiết lập hồ sơ' : `Xin chào, ${savedUser?.username}`}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {mode === 'setup' ? 'Tạo không gian làm việc của riêng bạn' : 'Nhập mật khẩu để truy cập'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {mode === 'setup' && (
            <>
              <div className="flex justify-center mb-2">
                 <div className="relative group cursor-pointer">
                    <img src={formData.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-white/10 object-cover" />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon size={20} className="text-white" />
                    </div>
                    {/* Fake input for demo - in real app user uploads image */}
                    <input 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={() => {
                            // Random avatar for demo when clicked
                            const seeds = ['Felix', 'Aneka', 'Zoe', 'Bear'];
                            const random = seeds[Math.floor(Math.random() * seeds.length)];
                            setFormData({...formData, avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${random}`})
                        }}
                    />
                 </div>
              </div>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Nickname của bạn" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-green-500 transition-colors placeholder:text-zinc-600"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </>
          )}

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-green-500 transition-colors placeholder:text-zinc-600"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && <div className="text-red-400 text-xs text-center">{error}</div>}

          <button className="mt-4 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all active:scale-95">
            {mode === 'setup' ? 'Bắt đầu ngay' : 'Mở khóa'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthOverlay;