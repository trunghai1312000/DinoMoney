import { useState, useEffect, useMemo } from 'react';
import { Task, UserProfile, FocusSession } from '../types';
import { CheckCircle2, Flame, Clock, Trophy, TrendingUp, Zap, Calendar, ArrowUpRight, ArrowDownRight, BarChart2 } from 'lucide-react';
import * as db from '../services/db'; // Import để fetch sessions

interface ProductivityReportProps {
  tasks: Task[];
  user: UserProfile | null;
  onClose: () => void;
}

const ProductivityReport = ({ tasks, user, onClose }: ProductivityReportProps) => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  // FETCH SESSIONS TỪ DB
  useEffect(() => {
    const fetchSessions = async () => {
        const data = await db.getFocusSessions();
        setSessions(data);
    };
    fetchSessions();
  }, []); // Chạy 1 lần khi mở báo cáo
  
  // --- TÍNH TOÁN REAL-TIME DỰA TRÊN SESSIONS THỰC TẾ ---
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // 1. TỔNG GIỜ FOCUS (Dựa trên sessions)
    const totalFocusMinutes = sessions.reduce((acc, curr) => acc + curr.duration, 0);

    // 2. HÔM NAY (Dựa trên sessions có completedAt trùng hôm nay)
    const todaySessions = sessions.filter(s => s.completedAt.split('T')[0] === todayStr);
    const todayFocusMinutes = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);

    // 3. STREAK (Chuỗi ngày)
    // Lấy danh sách ngày unique từ sessions
    const uniqueDays = [...new Set(sessions.map(s => s.completedAt.split('T')[0]))].sort();
    
    let currentStreak = 0;
    let checkDate = new Date();
    for (let i = 0; i < 30; i++) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (uniqueDays.includes(dStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0 && !uniqueDays.includes(dStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
            if (!uniqueDays.includes(checkDate.toISOString().split('T')[0])) break; 
        } else {
            break;
        }
    }

    // 4. BIỂU ĐỒ TUẦN
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay() || 7; 
    startOfWeek.setHours(0,0,0,0);
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1); // Về thứ 2

    const weekDataRaw = Array(7).fill(0);
    
    // Duyệt qua sessions để cộng dồn vào các ngày trong tuần
    sessions.forEach(s => {
        const d = new Date(s.completedAt);
        if (!isNaN(d.getTime()) && d >= startOfWeek) {
             const dayIdx = d.getDay(); 
             weekDataRaw[dayIdx] += s.duration; // Cộng số phút thực tế
        }
    });

    const chartOrder = [1, 2, 3, 4, 5, 6, 0]; // T2 -> CN
    const maxVal = Math.max(...weekDataRaw, 1);

    const weeklyFocusData = chartOrder.map(dayIdx => {
        const val = weekDataRaw[dayIdx];
        const percent = Math.round((val / maxVal) * 100);
        return {
            day: days[dayIdx],
            mins: val, 
            height: `${percent > 10 ? percent : 10}%`,
            active: dayIdx === now.getDay()
        };
    });

    // 5. PEAK HOURS (Khung giờ vàng)
    const hourBuckets = new Array(24).fill(0);
    sessions.forEach(s => {
        const d = new Date(s.completedAt);
        if (!isNaN(d.getTime())) {
            hourBuckets[d.getHours()]++; // Đếm số lần focus thành công vào giờ này
        }
    });

    const getBucketScore = (startH: number, endH: number) => {
        let sum = 0;
        for (let i = startH; i < endH; i++) sum += hourBuckets[i];
        return sum;
    };

    const peakRaw = [
        { label: '08:00', val: getBucketScore(5, 9) },
        { label: '10:00', val: getBucketScore(9, 12) },
        { label: '14:00', val: getBucketScore(12, 15) },
        { label: '16:00', val: getBucketScore(15, 18) },
        { label: '20:00', val: getBucketScore(18, 24) + getBucketScore(0, 5) } 
    ];

    const maxPeak = Math.max(...peakRaw.map(p => p.val), 1);
    const peakHoursData = peakRaw.map(p => ({
        hour: p.label,
        val: Math.round((p.val / maxPeak) * 100)
    }));
    
    const bestPeak = peakRaw.reduce((prev, current) => (prev.val > current.val) ? prev : current);
    let bestTimeRange = "Chưa đủ dữ liệu";
    if (bestPeak.val > 0) {
        if (bestPeak.label === '08:00') bestTimeRange = "06:00 - 09:00 (Sáng sớm)";
        else if (bestPeak.label === '10:00') bestTimeRange = "09:00 - 12:00 (Sáng)";
        else if (bestPeak.label === '14:00') bestTimeRange = "13:00 - 15:00 (Đầu chiều)";
        else if (bestPeak.label === '16:00') bestTimeRange = "15:00 - 18:00 (Chiều muộn)";
        else bestTimeRange = "19:00 - 23:00 (Tối muộn)";
    }

    // 6. SO SÁNH TUẦN (Growth)
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek); 

    let currentWeekMins = 0;
    let lastWeekMins = 0;

    sessions.forEach(s => {
        const d = new Date(s.completedAt);
        if (!isNaN(d.getTime())) {
            if (d >= startOfWeek) currentWeekMins += s.duration;
            else if (d >= startOfLastWeek && d < endOfLastWeek) lastWeekMins += s.duration;
        }
    });

    let growthPercent = 0;
    if (lastWeekMins === 0) {
        growthPercent = currentWeekMins > 0 ? 100 : 0;
    } else {
        growthPercent = Math.round(((currentWeekMins - lastWeekMins) / lastWeekMins) * 100);
    }

    // Insight
    const bestDayIdx = weekDataRaw.indexOf(Math.max(...weekDataRaw));
    const bestDayName = weekDataRaw[bestDayIdx] === 0 ? "Chưa có" : (days[bestDayIdx] === 'CN' ? 'Chủ Nhật' : `Thứ ${bestDayIdx === 0 ? '??' : days[bestDayIdx].replace('T', '')}`);
    const completedTasksCount = tasks.filter(t => t.status === 'done').length;

    return {
        totalFocusMinutes,
        todayFocusMinutes,
        currentStreak,
        weeklyFocusData,
        peakHoursData,
        bestDayName,
        bestTimeRange,
        growthPercent,
        currentWeekMins,
        lastWeekMins,
        completedTasksCount // Dùng để hiển thị riêng
    };
  }, [sessions, tasks]); 

  const weeklyGoalHours = user?.settings?.weeklyGoal || 40;
  const currentWeeklyHours = Math.round(stats.totalFocusMinutes / 60 * 10) / 10;
  const weeklyProgress = Math.min((currentWeeklyHours / weeklyGoalHours) * 100, 100);

  const formatHours = (mins: number) => {
     const h = Math.floor(mins / 60);
     const m = mins % 60;
     return h > 0 ? `${h}h${m}p` : `${m}p`;
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
            <p className="text-sm text-zinc-400 mt-1">Dữ liệu thực tế từ Focus Timer</p>
        </div>
      </div>

      <div className="p-6 overflow-y-auto scrollbar-hide space-y-8">
        
        {/* PHẦN 1: TOP STATS */}
        <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Tổng giờ Focus</span>
                <span className="text-2xl font-bold text-white">{Math.floor(stats.totalFocusMinutes/60)}h</span>
                <Clock size={16} className="text-blue-500 mt-1" />
            </div>
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Hôm nay</span>
                <span className="text-2xl font-bold text-green-400">{formatHours(stats.todayFocusMinutes)}</span>
                <Zap size={16} className="text-green-500 mt-1" fill="currentColor" />
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Ngày Active</span>
                <span className="text-2xl font-bold text-orange-400">{stats.currentStreak}</span>
                <Flame size={16} className="text-orange-500 mt-1" fill="currentColor" />
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Task đã xong</span>
                <span className="text-2xl font-bold text-yellow-400">{stats.completedTasksCount}</span>
                <Trophy size={16} className="text-yellow-500 mt-1" fill="currentColor" />
            </div>
        </div>

        {/* PHẦN 2: BIỂU ĐỒ */}
        <div className="grid grid-cols-2 gap-6">
            
            {/* Chart 1: Weekly */}
            <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart2 size={18} className="text-blue-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hoạt động trong tuần</h4>
                </div>
                
                <div className="h-[180px] flex items-end justify-between gap-3">
                    {stats.weeklyFocusData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <div className="relative w-full bg-zinc-800/50 rounded-lg flex items-end h-full overflow-hidden">
                                <div 
                                    className={`w-full rounded-t-lg transition-all duration-700 ease-out group-hover:opacity-80 ${d.active ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-zinc-600'}`} 
                                    style={{ height: d.height }}
                                ></div>
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
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Khung giờ vàng</h4>
                </div>

                <div className="h-[180px] flex items-end justify-between gap-3">
                    {stats.peakHoursData.map((d, i) => (
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
                         <div className="text-sm font-bold text-white">{stats.bestDayName}</div>
                     </div>
                 </div>
                 <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3">
                     <div className="p-2.5 bg-purple-500/20 rounded-lg text-purple-400"><Clock size={20}/></div>
                     <div>
                         <div className="text-[10px] text-zinc-500 uppercase font-bold">Khung giờ vàng</div>
                         <div className="text-sm font-bold text-white leading-tight">{stats.bestTimeRange}</div>
                     </div>
                 </div>
                 <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3">
                     <div className={`p-2.5 rounded-lg ${stats.growthPercent >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {stats.growthPercent >= 0 ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                     </div>
                     <div>
                         <div className="text-[10px] text-zinc-500 uppercase font-bold">So với tuần trước</div>
                         <div className={`text-base font-bold ${stats.growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                             {stats.growthPercent > 0 ? '+' : ''}{stats.growthPercent}%
                             <span className="text-[9px] text-zinc-500 font-normal ml-1">({Math.floor(stats.currentWeekMins/60)}h vs {Math.floor(stats.lastWeekMins/60)}h)</span>
                         </div>
                     </div>
                 </div>
            </div>
        </div>

      </div>
      
      {/* Footer */}
      <button onClick={onClose} className="w-full py-3 text-xs font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5">
          Đóng báo cáo
      </button>
    </div>
  );
};

export default ProductivityReport;