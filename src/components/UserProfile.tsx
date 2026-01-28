import { useState } from 'react';
import { UserProfile } from '../types';
import { User, Lock, Camera, Edit2, ShieldCheck, Volume2, Bell, Zap, Clock, Target, Info, Medal, Flame, CalendarCheck } from 'lucide-react';

interface UserProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onClose: () => void;
}

const UserProfileModal = ({ user, onUpdate, onClose }: UserProfileProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  
  const [settingsForm, setSettingsForm] = useState({
      username: user.username,
      bio: user.bio || '',
      currentPass: '',
      newPass: '',
      focusDuration: user.settings?.focusDuration || 25,
      weeklyGoal: user.settings?.weeklyGoal || 40,
      highPerformance: user.settings?.highPerformance || false,
      sound: user.settings?.sound ?? true,
      notifications: user.settings?.notifications ?? false
  });

  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSaveSettings = () => {
     let updatedPass = user.password;
     if (settingsForm.newPass) {
         if (settingsForm.currentPass !== user.password) {
             setMsg({ type: 'error', text: 'Mật khẩu cũ không đúng!' });
             return;
         }
         updatedPass = settingsForm.newPass;
     }

     const updatedUser: UserProfile = {
         ...user,
         username: settingsForm.username,
         bio: settingsForm.bio,
         password: updatedPass,
         settings: {
             focusDuration: settingsForm.focusDuration,
             weeklyGoal: settingsForm.weeklyGoal,
             highPerformance: settingsForm.highPerformance,
             sound: settingsForm.sound,
             notifications: settingsForm.notifications
         }
     };

     localStorage.setItem('dino_user_profile', JSON.stringify(updatedUser));
     onUpdate(updatedUser);
     setMsg({ type: 'success', text: 'Đã lưu cài đặt thành công!' });
     setSettingsForm(p => ({ ...p, currentPass: '', newPass: '' }));
  };

  const randomizeAvatar = () => {
      const seeds = ['Felix', 'Aneka', 'Zoe', 'Bear', 'Tiger', 'Loki', 'Bella'];
      const random = seeds[Math.floor(Math.random() * seeds.length)];
      const newAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${random}`;
      const updatedUser = { ...user, avatarUrl: newAvatar };
      localStorage.setItem('dino_user_profile', JSON.stringify(updatedUser));
      onUpdate(updatedUser);
  };

  return (
    <div className="w-[360px] bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 flex flex-col max-h-[80vh]">
      
      {/* HEADER */}
      <div className="relative h-28 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
      </div>

      <div className="px-5 relative mb-2">
         <div className="absolute -top-10 left-5">
            <div className="relative group cursor-pointer" onClick={randomizeAvatar}>
                <img src={user.avatarUrl} className="w-20 h-20 rounded-full border-4 border-[#18181b] bg-[#18181b] object-cover shadow-lg" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border-4 border-transparent">
                    <Camera size={18} className="text-white" />
                </div>
            </div>
         </div>
         <div className="pt-12">
             <h2 className="text-xl font-bold text-white">{user.username}</h2>
             <p className="text-xs text-zinc-400 italic mt-1">{user.bio || "Sẵn sàng tập trung..."}</p>
             <div className="mt-3 flex gap-2">
                 <div className="text-[10px] text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5 flex items-center gap-1">
                     <Clock size={10} /> Tham gia: {new Date(user.joinedAt || Date.now()).toLocaleDateString('vi-VN')}
                 </div>
             </div>
         </div>
      </div>

      {/* TABS */}
      <div className="px-5 border-b border-white/5 flex gap-6 mt-2">
        <button onClick={() => { setActiveTab('profile'); setMsg({type:'',text:''}) }} className={`pb-3 text-xs font-bold transition-colors border-b-2 uppercase tracking-wider ${activeTab === 'profile' ? 'text-green-400 border-green-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>Hồ sơ</button>
        <button onClick={() => { setActiveTab('settings'); setMsg({type:'',text:''}) }} className={`pb-3 text-xs font-bold transition-colors border-b-2 uppercase tracking-wider ${activeTab === 'settings' ? 'text-blue-400 border-blue-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>Cài đặt</button>
      </div>

      {/* CONTENT */}
      <div className="p-5 overflow-y-auto scrollbar-hide h-[320px]">
        
        {activeTab === 'profile' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                {/* ACHIEVEMENTS SECTION */}
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Thành tựu (Achievements)</h4>
                
                <div className="grid grid-cols-3 gap-2">
                    {/* Badge 1: Early Bird */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 group hover:bg-white/10 transition-colors cursor-default" title="Hoạt động trước 7h sáng">
                         <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-full group-hover:scale-110 transition-transform">
                             <Zap size={18} fill="currentColor" />
                         </div>
                         <span className="text-[10px] font-bold text-zinc-300">Dậy sớm</span>
                    </div>

                    {/* Badge 2: Focus Master */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 group hover:bg-white/10 transition-colors cursor-default" title="Đạt 100 giờ tập trung">
                         <div className="p-2 bg-blue-500/20 text-blue-400 rounded-full group-hover:scale-110 transition-transform">
                             <Medal size={18} />
                         </div>
                         <span className="text-[10px] font-bold text-zinc-300">Tập trung</span>
                    </div>

                     {/* Badge 3: Streak Keeper */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 group hover:bg-white/10 transition-colors cursor-default" title="Chuỗi 7 ngày liên tục">
                         <div className="p-2 bg-orange-500/20 text-orange-400 rounded-full group-hover:scale-110 transition-transform">
                             <Flame size={18} fill="currentColor" />
                         </div>
                         <span className="text-[10px] font-bold text-zinc-300">Chuỗi 7 ngày</span>
                    </div>

                    {/* Badge 4: Planner */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 group hover:bg-white/10 transition-colors cursor-default" title="Tạo hơn 50 task">
                         <div className="p-2 bg-green-500/20 text-green-400 rounded-full group-hover:scale-110 transition-transform">
                             <CalendarCheck size={18} />
                         </div>
                         <span className="text-[10px] font-bold text-zinc-300">Kế hoạch</span>
                    </div>
                    
                    {/* Locked Badge */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 opacity-50">
                         <div className="p-2 bg-zinc-700 rounded-full">
                             <Lock size={18} className="text-zinc-500" />
                         </div>
                         <span className="text-[10px] font-bold text-zinc-500">???</span>
                    </div>
                    
                     {/* Locked Badge */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 opacity-50">
                         <div className="p-2 bg-zinc-700 rounded-full">
                             <Lock size={18} className="text-zinc-500" />
                         </div>
                         <span className="text-[10px] font-bold text-zinc-500">???</span>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-2 duration-300">
                {/* Các phần cài đặt (Giữ nguyên logic cũ) */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Thông tin hiển thị</label>
                    <div className="space-y-2">
                         <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input 
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                                placeholder="Tên hiển thị"
                                value={settingsForm.username}
                                onChange={e => setSettingsForm({...settingsForm, username: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Edit2 size={14} className="absolute left-3 top-3 text-zinc-500" />
                            <textarea 
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-blue-500 transition-colors resize-none h-16"
                                placeholder="Bio / Châm ngôn sống..."
                                value={settingsForm.bio}
                                onChange={e => setSettingsForm({...settingsForm, bio: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Focus & Goal */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mục tiêu & Thời gian</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-zinc-400"><Clock size={12}/> Focus Session</div>
                            <input 
                                type="number" 
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-1 text-sm text-center text-white outline-none focus:border-blue-500"
                                value={settingsForm.focusDuration}
                                onChange={e => setSettingsForm({...settingsForm, focusDuration: Number(e.target.value)})}
                            />
                            <div className="text-[10px] text-zinc-600 text-center">phút / phiên</div>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-zinc-400"><Target size={12}/> Weekly Goal</div>
                            <input 
                                type="number" 
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-1 text-sm text-center text-white outline-none focus:border-blue-500"
                                value={settingsForm.weeklyGoal}
                                onChange={e => setSettingsForm({...settingsForm, weeklyGoal: Number(e.target.value)})}
                            />
                            <div className="text-[10px] text-zinc-600 text-center">giờ / tuần</div>
                        </div>
                    </div>
                </div>

                {/* System */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Hệ thống</label>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <Zap size={16} className={settingsForm.highPerformance ? "text-yellow-400" : "text-zinc-400"} />
                            <div className="flex flex-col">
                                <span className="text-sm text-zinc-200">Hiệu năng cao</span>
                                <span className="text-[10px] text-zinc-500">Tắt hiệu ứng mờ & video</span>
                            </div>
                        </div>
                        <button onClick={() => setSettingsForm(p => ({...p, highPerformance: !p.highPerformance}))} className={`w-10 h-5 rounded-full relative transition-colors ${settingsForm.highPerformance ? 'bg-green-500' : 'bg-zinc-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settingsForm.highPerformance ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <Volume2 size={16} className="text-zinc-400" />
                            <span className="text-sm text-zinc-200">Âm thanh</span>
                        </div>
                        <button onClick={() => setSettingsForm(p => ({...p, sound: !p.sound}))} className={`w-10 h-5 rounded-full relative transition-colors ${settingsForm.sound ? 'bg-green-500' : 'bg-zinc-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settingsForm.sound ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Lock size={12}/> Bảo mật</label>
                    <input 
                        type="password" placeholder="Mật khẩu cũ (nếu muốn đổi)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white outline-none focus:border-red-500 transition-colors"
                        value={settingsForm.currentPass} onChange={e => setSettingsForm({...settingsForm, currentPass: e.target.value})}
                    />
                    <input 
                        type="password" placeholder="Mật khẩu mới"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white outline-none focus:border-red-500 transition-colors"
                        value={settingsForm.newPass} onChange={e => setSettingsForm({...settingsForm, newPass: e.target.value})}
                    />
                </div>

                <button onClick={handleSaveSettings} className="sticky bottom-0 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95 z-10">
                    Lưu tất cả cài đặt
                </button>
            </div>
        )}

        {msg.text && (
            <div className={`mt-3 p-2 rounded-lg text-xs text-center border animate-in fade-in slide-in-from-bottom-2 ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {msg.text}
            </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;