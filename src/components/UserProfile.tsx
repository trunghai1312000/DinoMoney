import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, Lock, Camera, Edit2, Zap, Clock, Target, Medal, Flame, CalendarCheck, Sun, Moon } from 'lucide-react';
import * as db from '../services/db';
import profileDefault from '../assets/image/profile.avif';

interface UserProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onClose: () => void;
}

const UserProfileModal = ({ user, onUpdate, onClose }: UserProfileProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  
  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
      username: user.username,
      bio: user.bio || '',
      currentPass: '',
      newPass: '',
      focusDuration: user.settings?.focusDuration || 25,
      weeklyGoal: user.settings?.weeklyGoal || 40,
      highPerformance: user.settings?.highPerformance || false,
      notifications: user.settings?.notifications ?? false
  });

  // Dummy state cho giao diện (chưa có logic backend)
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // Stats for Achievements
  const [stats, setStats] = useState({
      totalHours: 0,
      currentStreak: 0,
      taskCount: 0,
      earlyBirdCount: 0
  });

  // Load Real Data for Achievements
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [sessions, tasks] = await Promise.all([
                db.getFocusSessions(),
                db.getTasks()
            ]);

            // 1. Total Hours
            const totalMins = sessions.reduce((acc, s) => acc + s.duration, 0);
            
            // 2. Streak
            const uniqueDays = [...new Set(sessions.map(s => s.completedAt.split('T')[0]))].sort();
            let streak = 0;
            let checkDate = new Date();
            for (let i = 0; i < 30; i++) {
                const dStr = checkDate.toISOString().split('T')[0];
                if (uniqueDays.includes(dStr)) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else if (i === 0 && !uniqueDays.includes(dStr)) {
                    checkDate.setDate(checkDate.getDate() - 1); // Allow missing today
                    if (!uniqueDays.includes(checkDate.toISOString().split('T')[0])) break;
                } else {
                    break;
                }
            }

            // 3. Early Bird (Sessions completed between 4AM - 8AM)
            const earlyCount = sessions.filter(s => {
                const hour = new Date(s.completedAt).getHours();
                return hour >= 4 && hour < 8;
            }).length;

            setStats({
                totalHours: Math.floor(totalMins / 60),
                currentStreak: streak,
                taskCount: tasks.length,
                earlyBirdCount: earlyCount
            });
        } catch (e) {
            console.error("Error fetching stats", e);
        }
    };
    fetchData();
  }, []);

  // Save Settings Handler
  const handleSaveSettings = async () => {
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
             sound: user.settings?.sound ?? true, // Giữ nguyên giá trị cũ
             notifications: settingsForm.notifications
         }
     };

     await db.saveUser(updatedUser); // Save to DB
     onUpdate(updatedUser);
     setMsg({ type: 'success', text: 'Đã lưu cài đặt thành công!' });
     setSettingsForm(p => ({ ...p, currentPass: '', newPass: '' }));
  };

  // Upload Avatar Handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = async (ev) => {
              if (ev.target?.result) {
                  const newAvatarUrl = ev.target.result as string;
                  const updatedUser = { ...user, avatarUrl: newAvatarUrl };
                  await db.saveUser(updatedUser);
                  onUpdate(updatedUser);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  // Check Achievements Logic
  const hasEarlyBird = stats.earlyBirdCount > 0;
  const hasFocusMaster = stats.totalHours >= 100;
  const hasStreakKeeper = stats.currentStreak >= 7;
  const hasPlanner = stats.taskCount >= 50;

  return (
    <div className="w-[360px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
      
      {/* HEADER - CLEAN & DARK GLASSMOPHISM */}
      <div className="relative pt-8 pb-6 px-5 flex flex-col items-center bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
        
        {/* Avatar Container */}
        <div className="relative group cursor-pointer mb-4">
            {/* Glow effect behind avatar */}
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all duration-500"></div>
            
            <div className="relative w-24 h-24 p-1 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                <img 
                    src={user.avatarUrl || profileDefault} 
                    className="w-full h-full rounded-full object-cover bg-zinc-900" 
                    alt="User Avatar"
                />
            </div>

            {/* Camera Overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]">
                <Camera size={24} className="text-white drop-shadow-md" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
        </div>
        
        {/* User Info */}
        <h2 className="text-2xl font-bold text-white text-center tracking-tight drop-shadow-lg">{user.username}</h2>
        <p className="text-sm text-zinc-400 italic mt-1 text-center max-w-[250px] truncate">{user.bio || "Sẵn sàng tập trung..."}</p>
        
        {/* Join Date Pill */}
        <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] font-medium text-zinc-500 shadow-inner">
            <Clock size={12} className="text-zinc-400" /> 
            <span>Tham gia: {new Date(user.joinedAt || Date.now()).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* TABS */}
      <div className="px-6 pt-4 border-b border-white/5 flex justify-center gap-12">
        <button onClick={() => { setActiveTab('profile'); setMsg({type:'',text:''}) }} className={`pb-3 text-xs font-bold transition-all border-b-2 uppercase tracking-wider hover:text-white ${activeTab === 'profile' ? 'text-green-400 border-green-500' : 'text-zinc-500 border-transparent'}`}>Hồ sơ</button>
        <button onClick={() => { setActiveTab('settings'); setMsg({type:'',text:''}) }} className={`pb-3 text-xs font-bold transition-all border-b-2 uppercase tracking-wider hover:text-white ${activeTab === 'settings' ? 'text-blue-400 border-blue-500' : 'text-zinc-500 border-transparent'}`}>Cài đặt</button>
      </div>

      {/* CONTENT SCROLLABLE */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
        
        {activeTab === 'profile' && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* ACHIEVEMENTS SECTION */}
                <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 text-center">Thành tựu đã đạt</h4>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                        {/* Badge 1: Early Bird */}
                        <div className={`aspect-square bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${hasEarlyBird ? 'hover:bg-white/10 hover:border-white/20 hover:scale-105 shadow-lg shadow-black/20' : 'opacity-30 grayscale'}`} title="Hoạt động từ 4h - 8h sáng">
                             <div className="p-2.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                                 <Zap size={20} fill="currentColor" />
                             </div>
                             <span className="text-[10px] font-bold text-zinc-300">Dậy sớm</span>
                        </div>

                        {/* Badge 2: Focus Master */}
                        <div className={`aspect-square bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${hasFocusMaster ? 'hover:bg-white/10 hover:border-white/20 hover:scale-105 shadow-lg shadow-black/20' : 'opacity-30 grayscale'}`} title="Đạt 100 giờ tập trung">
                             <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-full">
                                 <Medal size={20} />
                             </div>
                             <span className="text-[10px] font-bold text-zinc-300">100 giờ</span>
                        </div>

                         {/* Badge 3: Streak Keeper */}
                        <div className={`aspect-square bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${hasStreakKeeper ? 'hover:bg-white/10 hover:border-white/20 hover:scale-105 shadow-lg shadow-black/20' : 'opacity-30 grayscale'}`} title="Chuỗi 7 ngày liên tục">
                             <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-full">
                                 <Flame size={20} fill="currentColor" />
                             </div>
                             <span className="text-[10px] font-bold text-zinc-300">7 ngày</span>
                        </div>

                        {/* Badge 4: Planner */}
                        <div className={`aspect-square bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${hasPlanner ? 'hover:bg-white/10 hover:border-white/20 hover:scale-105 shadow-lg shadow-black/20' : 'opacity-30 grayscale'}`} title="Tạo hơn 50 task">
                             <div className="p-2.5 bg-green-500/20 text-green-400 rounded-full">
                                 <CalendarCheck size={20} />
                             </div>
                             <span className="text-[10px] font-bold text-zinc-300">50 Task</span>
                        </div>
                        
                        {/* Locked Badge */}
                        <div className="aspect-square bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-20">
                             <div className="p-2.5 bg-zinc-800 rounded-full">
                                 <Lock size={20} className="text-zinc-500" />
                             </div>
                             <span className="text-[10px] font-bold text-zinc-500">???</span>
                        </div>
                        
                         {/* Locked Badge */}
                        <div className="aspect-square bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-20">
                             <div className="p-2.5 bg-zinc-800 rounded-full">
                                 <Lock size={20} className="text-zinc-500" />
                             </div>
                             <span className="text-[10px] font-bold text-zinc-500">???</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-2">
                
                {/* 1. PUBLIC INFO */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Thông tin hiển thị</label>
                    <div className="space-y-2">
                        <div className="relative group">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                            <input 
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all placeholder:text-zinc-700"
                                placeholder="Tên hiển thị"
                                value={settingsForm.username}
                                onChange={e => setSettingsForm({...settingsForm, username: e.target.value})}
                            />
                        </div>
                        <div className="relative group">
                            <Edit2 size={14} className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                            <textarea 
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all resize-none h-20 placeholder:text-zinc-700"
                                placeholder="Bio / Châm ngôn sống..."
                                value={settingsForm.bio}
                                onChange={e => setSettingsForm({...settingsForm, bio: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. GOAL & TIME */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mục tiêu & Thời gian</label>
                    
                    <div className="bg-white/5 rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                        {/* Focus Duration Input */}
                        <div className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform"><Clock size={18}/></div>
                                <div>
                                    <div className="text-sm font-medium text-zinc-200">Thời gian tập trung</div>
                                    <div className="text-[10px] text-zinc-500">Phút mỗi phiên</div>
                                </div>
                            </div>
                            <div className="relative w-20">
                                <input 
                                    type="number" min="5" max="180"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-right text-sm text-white font-mono focus:border-blue-500 outline-none transition-colors"
                                    value={settingsForm.focusDuration}
                                    onChange={e => setSettingsForm({...settingsForm, focusDuration: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        {/* Weekly Goal Input */}
                        <div className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-xl text-green-400 group-hover:scale-110 transition-transform"><Target size={18}/></div>
                                <div>
                                    <div className="text-sm font-medium text-zinc-200">Mục tiêu tuần</div>
                                    <div className="text-[10px] text-zinc-500">Giờ làm việc</div>
                                </div>
                            </div>
                            <div className="relative w-20">
                                <input 
                                    type="number" min="1" max="168"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-right text-sm text-white font-mono focus:border-blue-500 outline-none transition-colors"
                                    value={settingsForm.weeklyGoal}
                                    onChange={e => setSettingsForm({...settingsForm, weeklyGoal: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SYSTEM */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hệ thống</label>
                    
                    <div className="flex flex-col gap-2">
                        {/* High Performance */}
                        <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <Zap size={18} className={settingsForm.highPerformance ? "text-yellow-400 fill-yellow-400/20" : "text-zinc-500"} />
                                <div className="flex flex-col">
                                    <span className="text-sm text-zinc-200">Hiệu năng cao <span className="text-zinc-500 text-[10px] ml-1 px-1.5 py-0.5 bg-white/5 rounded border border-white/5">Dev</span></span>
                                    <span className="text-[10px] text-zinc-500">Giảm hiệu ứng để mượt hơn</span>
                                </div>
                            </div>
                            <button onClick={() => setSettingsForm(p => ({...p, highPerformance: !p.highPerformance}))} className={`w-11 h-6 rounded-full relative transition-colors ${settingsForm.highPerformance ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-zinc-800'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settingsForm.highPerformance ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                {isDarkMode ? <Moon size={18} className="text-purple-400 fill-purple-400/20" /> : <Sun size={18} className="text-orange-400 fill-orange-400/20" />}
                                <div className="flex flex-col">
                                    <span className="text-sm text-zinc-200">Giao diện <span className="text-zinc-500 text-[10px] ml-1 px-1.5 py-0.5 bg-white/5 rounded border border-white/5">Dev</span></span>
                                    <span className="text-[10px] text-zinc-500">{isDarkMode ? 'Chế độ Tối (Mặc định)' : 'Chế độ Sáng'}</span>
                                </div>
                            </div>
                            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-11 h-6 rounded-full relative transition-colors ${!isDarkMode ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-zinc-800'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${!isDarkMode ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. PASSWORD */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Lock size={12}/> Đổi mật khẩu</label>
                    <input 
                        type="password" placeholder="Mật khẩu cũ"
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-2.5 text-sm text-white outline-none focus:border-red-500/50 transition-colors placeholder:text-zinc-700"
                        value={settingsForm.currentPass} onChange={e => setSettingsForm({...settingsForm, currentPass: e.target.value})}
                    />
                    <input 
                        type="password" placeholder="Mật khẩu mới"
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-2.5 text-sm text-white outline-none focus:border-green-500/50 transition-colors placeholder:text-zinc-700"
                        value={settingsForm.newPass} onChange={e => setSettingsForm({...settingsForm, newPass: e.target.value})}
                    />
                </div>

                {/* SAVE BUTTON */}
                <div className="pt-2">
                    <button onClick={handleSaveSettings} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95 hover:shadow-blue-500/20">
                        Lưu cài đặt
                    </button>
                </div>
            </div>
        )}

        {msg.text && (
            <div className={`mt-3 p-2.5 rounded-xl text-xs text-center border font-medium animate-in fade-in slide-in-from-bottom-2 ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {msg.text}
            </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;