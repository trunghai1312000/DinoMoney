import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, Cell, LineChart, Line, Legend, PieChart, Pie
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, ArrowRight, TrendingUp } from 'lucide-react';

const BAR_COLORS = ['#05df72', '#0ea5e9', '#eab308', '#f43f5e', '#8b5cf6', '#ec4899'];
const PIE_COLORS = ['#05df72', '#f43f5e'];

export default function Statistics() {
  const { transactions, categories, goldPriceHistory } = useStore();
  const [activeTab, setActiveTab] = useState<'today' | 'deep'>('today');
  
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // --- HÔM NAY ---
  const today = new Date();
  const todayTxs = transactions.filter(t => isSameDay(parseISO(t.date), today));
  const todayInc = todayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const todayExp = todayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // --- CHUYÊN SÂU ---
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  const txsInRange = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }));
  const rangeInc = txsInRange.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const rangeExp = txsInRange.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // 1. Chart Xu hướng (Area)
  const daysInterval = eachDayOfInterval({ start, end });
  const trendData = daysInterval.map(day => {
    const dayTxs = txsInRange.filter(t => isSameDay(parseISO(t.date), day));
    return {
      date: format(day, 'dd/MM'),
      income: dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    };
  });

  // 2. Chart Danh mục (Bar)
  const expenseTxs = txsInRange.filter(t => t.type === 'expense');
  const catMap: Record<string, number> = {};
  expenseTxs.forEach(t => {
    const c = categories.find(c => c.id === t.category);
    const name = c ? c.name : 'Khác';
    catMap[name] = (catMap[name] || 0) + t.amount;
  });
  const barData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  // 3. Chart Tỉ lệ Thu/Chi (Pie)
  const pieData = [
    { name: 'Thu nhập', value: rangeInc },
    { name: 'Chi tiêu', value: rangeExp },
  ].filter(i => i.value > 0);

  // 4. Chart Giá Vàng (Line)
  const goldChartData = goldPriceHistory
    .filter(h => isWithinInterval(parseISO(h.timestamp), { start, end }))
    .map(h => ({
        date: format(parseISO(h.timestamp), 'dd/MM'),
        buy: h.buy,
        sell: h.sell
    }));

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Tab Switcher */}
       <div className="flex bg-black/30 p-1 rounded-2xl w-fit border border-white/5 mx-auto mb-8">
          <button 
            onClick={() => setActiveTab('today')}
            className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'today' ? 'bg-[#05df72] text-black shadow-lg shadow-[#05df72]/20' : 'text-gray-500 hover:text-white'}`}
          >
            HÔM NAY
          </button>
          <button 
            onClick={() => setActiveTab('deep')}
            className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'deep' ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/20' : 'text-gray-500 hover:text-white'}`}
          >
            CHUYÊN SÂU
          </button>
       </div>

       {activeTab === 'today' ? (
         <div className="max-w-4xl mx-auto space-y-6">
            {/* Today Summary */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-black/30 border border-white/5 p-6 rounded-3xl text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Thu Nhập</p>
                    <p className="text-3xl font-mono font-bold text-[#05df72]">+{todayInc.toLocaleString()}</p>
                </div>
                <div className="bg-black/30 border border-white/5 p-6 rounded-3xl text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Chi Tiêu</p>
                    <p className="text-3xl font-mono font-bold text-[#f43f5e]">-{todayExp.toLocaleString()}</p>
                </div>
                <div className="bg-black/30 border border-white/5 p-6 rounded-3xl text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Cân Đối</p>
                    <p className={`text-3xl font-mono font-bold ${todayInc - todayExp >= 0 ? 'text-[#0ea5e9]' : 'text-red-500'}`}>
                        {(todayInc - todayExp).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-3xl p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">GIAO DỊCH TRONG NGÀY</h3>
                <div className="space-y-3">
                    {todayTxs.length === 0 ? (
                        <p className="text-center text-gray-600 italic py-4">Chưa có giao dịch nào hôm nay</p>
                    ) : (
                        todayTxs.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                <span className="text-sm text-gray-300">{t.note || categories.find(c => c.id === t.category)?.name}</span>
                                <span className={`font-mono font-bold ${t.type === 'income' ? 'text-[#05df72]' : 'text-[#f43f5e]'}`}>
                                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
         </div>
       ) : (
         <div className="space-y-6">
            {/* Date Range Picker */}
            <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
                    <CalendarIcon size={16} className="text-[#0ea5e9]" />
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent outline-none text-white text-sm font-mono" />
                </div>
                <ArrowRight size={16} className="text-gray-600" />
                <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
                    <CalendarIcon size={16} className="text-[#0ea5e9]" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent outline-none text-white text-sm font-mono" />
                </div>
            </div>

            {/* Total Summary Deep */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#05df72]/10 border border-[#05df72]/20 p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-[#05df72] font-bold text-sm uppercase">Tổng Thu</span>
                    <span className="text-2xl font-mono font-bold text-white">+{rangeInc.toLocaleString()}</span>
                 </div>
                 <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/20 p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-[#f43f5e] font-bold text-sm uppercase">Tổng Chi</span>
                    <span className="text-2xl font-mono font-bold text-white">-{rangeExp.toLocaleString()}</span>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Flow Chart */}
                <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 h-80">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">XU HƯỚNG DÒNG TIỀN</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#05df72" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#05df72" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                            <Area type="monotone" dataKey="income" stroke="#05df72" fill="url(#colorInc)" />
                            <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#colorExp)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Financial Health (Pie) */}
                <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 h-80">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">SỨC KHỎE TÀI CHÍNH</h3>
                    <div className="h-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie 
                                    data={pieData} 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Thu nhập' ? '#05df72' : '#f43f5e'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none -mt-4">
                             <TrendingUp size={24} className="text-[#0ea5e9] mx-auto mb-1" />
                        </div>
                    </div>
                </div>

                {/* Category Chart */}
                <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 h-80">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">TOP CHI TIÊU</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={barData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} stroke="#999" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {barData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Gold Price History Chart */}
                <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 h-80">
                    <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-6">BIẾN ĐỘNG GIÁ VÀNG</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={goldChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis domain={['auto', 'auto']} stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                            <Legend />
                            <Line type="monotone" dataKey="sell" name="Bán ra" stroke="#f43f5e" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="buy" name="Mua vào" stroke="#05df72" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
         </div>
       )}
    </div>
  );
}