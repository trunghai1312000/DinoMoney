import { Task, UserProfile } from '../types';
import { CheckCircle2, Flame, Clock, Trophy, TrendingUp, Zap, Calendar, ArrowUpRight, BarChart2 } from 'lucide-react';

interface ProductivityReportProps {
  tasks: Task[];
  user: UserProfile | null;
  onClose: () => void;
}

const ProductivityReport = ({ tasks, user, onClose }: ProductivityReportProps) => {
  // MOCK DATA
  const totalFocusMinutes = 12500;
  const todayFocusMinutes = 245;
  const currentStreak = 4;
  const longestStreak = 12;
  const weeklyGoalHours = user?.settings?.weeklyGoal || 40;
  
  const currentWeeklyHours = 28.5; 
  const weeklyProgress = Math.min((currentWeeklyHours / weeklyGoalHours) * 100, 100);

  // Dữ liệu biểu đồ 1: Số phút Focus trong tuần (T2 - CN)
  const weeklyFocusData = [
    { day: 'T2', mins: 120, height: '40%' },
    { day: 'T3', mins: 240, height: '80%' },
    { day: 'T4', mins: 180, height: '60%' },
    { day: 'T5', mins: 300, height: '100%' }, // Max
    { day: 'T6', mins: 150, height: '50%' },
    { day: 'T7', mins: 90, height: '30%' },
    { day: 'CN', mins: todayFocusMinutes, height: `${Math.min((todayFocusMinutes/300)*100, 100)}%`, active: true },
  ];

  // Dữ liệu biểu đồ 2: Giờ vàng (Most Active Hours)
  const peakHoursData = [
    { hour: '08:00', val: 30 }, 
    { hour: '10:00', val: 90 }, 
    { hour: '14:00', val: 65 }, 
    { hour: '16:00', val: 85 }, 
    { hour: '20:00', val: 40 }
  ];

  const formatHours = (mins: number) => {
     const h = Math.floor(mins / 60);
     const m = mins % 60;
     return `${h}h${m}p`;
  };

  return (
    <div className="w-[600px] bg-[#18181b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
      
      {/* HEADER */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-emerald-900/40 to-black flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-emerald-400" size={28} />
                Báo cáo hiệu suất
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Tổng quan dữ liệu tập trung của bạn</p>
        </div>
      </div>

      <div className="p-6 overflow-y-auto scrollbar-hide space-y-8">
        
        {/* PHẦN 1: TOP STATS (4 ô lớn) */}
        <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Tổng giờ Focus</span>
                <span className="text-2xl font-bold text-white">{Math.floor(totalFocusMinutes/60)}h</span>
                <Clock size={16} className="text-blue-500 mt-1" />
            </div>
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Hôm nay</span>
                <span className="text-2xl font-bold text-green-400">{formatHours(todayFocusMinutes)}</span>
                <Zap size={16} className="text-green-500 mt-1" fill="currentColor" />
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Chuỗi hiện tại</span>
                <span className="text-2xl font-bold text-orange-400">{currentStreak}</span>
                <Flame size={16} className="text-orange-500 mt-1" fill="currentColor" />
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Kỷ lục chuỗi</span>
                <span className="text-2xl font-bold text-yellow-400">{longestStreak}</span>
                <Trophy size={16} className="text-yellow-500 mt-1" fill="currentColor" />
            </div>
        </div>

        {/* PHẦN 2: BIỂU ĐỒ CỘT (To & Rõ) */}
        <div className="grid grid-cols-2 gap-6">
            
            {/* Chart 1: Weekly Focus Distribution */}
            <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart2 size={18} className="text-blue-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Thời gian Focus trong tuần</h4>
                </div>
                
                <div className="h-[180px] flex items-end justify-between gap-3">
                    {weeklyFocusData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <div className="relative w-full bg-zinc-800/50 rounded-lg flex items-end h-full overflow-hidden">
                                <div 
                                    className={`w-full rounded-t-lg transition-all duration-700 ease-out group-hover:opacity-80 ${d.active ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-zinc-600'}`} 
                                    style={{ height: d.height }}
                                ></div>
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {d.mins}p
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold ${d.active ? 'text-blue-400' : 'text-zinc-500'}`}>{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart 2: Peak Hours */}
            <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-6">
                    <Clock size={18} className="text-purple-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Khung giờ vàng (Most Active)</h4>
                </div>

                <div className="h-[180px] flex items-end justify-between gap-3">
                    {peakHoursData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <div className="w-full bg-zinc-800/50 rounded-lg relative h-full flex items-end overflow-hidden">
                                <div 
                                    className="w-full bg-purple-500 rounded-t-lg transition-all duration-700 ease-out group-hover:bg-purple-400" 
                                    style={{ height: `${d.val}%` }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500">{d.hour}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* PHẦN 3: GOAL & INSIGHTS */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-yellow-500" /> Mục tiêu & Phân tích
            </h4>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold text-white">{currentWeeklyHours}h <span className="text-sm text-zinc-500 font-normal">/ {weeklyGoalHours}h mục tiêu tuần</span></span>
                    <span className="text-xl font-bold text-green-400">{Math.round(weeklyProgress)}%</span>
                </div>
                <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]" style={{ width: `${weeklyProgress}%` }}></div>
                </div>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-3 gap-4">
                 <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3">
                     <div className="p-2.5 bg-blue-500/20 rounded-lg text-blue-400"><Calendar size={20}/></div>
                     <div>
                         <div className="text-[10px] text-zinc-500 uppercase font-bold">Ngày hiệu quả nhất</div>
                         <div className="text-base font-bold text-white">Thứ Năm</div>
                     </div>
                 </div>
                 <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3">
                     <div className="p-2.5 bg-purple-500/20 rounded-lg text-purple-400"><Clock size={20}/></div>
                     <div>
                         <div className="text-[10px] text-zinc-500 uppercase font-bold">Khung giờ vàng</div>
                         <div className="text-base font-bold text-white">10:00 - 12:00</div>
                     </div>
                 </div>
                 <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3">
                     <div className="p-2.5 bg-green-500/20 rounded-lg text-green-400"><ArrowUpRight size={20}/></div>
                     <div>
                         <div className="text-[10px] text-zinc-500 uppercase font-bold">So với tuần trước</div>
                         <div className="text-base font-bold text-green-400">+15%</div>
                     </div>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ProductivityReport;