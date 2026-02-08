import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { Transaction } from '../services/db';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, parseISO, isWithinInterval, subMonths 
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Filter, TrendingUp } from 'lucide-react';

const COLORS = ['#05df72', '#0ea5e9', '#eab308', '#f43f5e', '#8b5cf6', '#ec4899', '#f97316'];

interface StatisticsProps {
  transactions: Transaction[];
}

const Statistics: React.FC<StatisticsProps> = ({ transactions }) => {
  // --- STATE ---
  const [filterType, setFilterType] = useState<'week' | 'month' | 'custom'>('month');
  const [customStart, setCustomStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredTransactions = useMemo(() => {
    let start: Date, end: Date;

    if (filterType === 'week') {
      start = startOfWeek(new Date(), { weekStartsOn: 1 });
      end = endOfWeek(new Date(), { weekStartsOn: 1 });
    } else if (filterType === 'month') {
      start = startOfMonth(new Date());
      end = endOfMonth(new Date());
    } else {
      start = parseISO(customStart);
      end = parseISO(customEnd);
    }

    return transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start, end });
    });
  }, [transactions, filterType, customStart, customEnd]);

  // --- DỮ LIỆU TỔNG QUAN (MẶC ĐỊNH - THÁNG NÀY HOẶC THEO FILTER) ---
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Chart 1: Cơ cấu chi tiêu (Pie)
  const pieData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      groups[t.category] = (groups[t.category] || 0) + t.amount;
    });
    return Object.keys(groups).map(k => ({ name: k, value: groups[k] }));
  }, [filteredTransactions]);

  // Chart 2: Dòng tiền theo ngày (Bar Vertical)
  const barData = useMemo(() => {
      const groups: Record<string, {name: string, income: number, expense: number}> = {};
      filteredTransactions.forEach(t => {
          const d = format(parseISO(t.date), 'dd/MM');
          if (!groups[d]) groups[d] = { name: d, income: 0, expense: 0 };
          if (t.type === 'income') groups[d].income += t.amount;
          else groups[d].expense += t.amount;
      });
      // Sắp xếp theo ngày
      return Object.values(groups).sort((a,b) => {
          const [d1, m1] = a.name.split('/').map(Number);
          const [d2, m2] = b.name.split('/').map(Number);
          return m1 - m2 || d1 - d2;
      });
  }, [filteredTransactions]);

  // Chart 3: Xu hướng (Area Chart - Cho phân tích chuyên sâu)
  const trendData = useMemo(() => {
      let balance = 0;
      return barData.map(day => {
          balance += (day.income - day.expense);
          return { ...day, balance };
      });
  }, [barData]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* --- PHẦN 1: TỔNG QUAN (MẶC ĐỊNH) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Tổng Thu */}
          <div className="bg-[#05df72]/10 border border-[#05df72]/30 p-6 rounded-3xl flex flex-col justify-center items-center shadow-[0_0_30px_-10px_rgba(5,223,114,0.3)] backdrop-blur-md">
              <p className="text-[#05df72] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">TỔNG THU NHẬP</p>
              <p className="text-3xl font-black text-white font-mono drop-shadow-md">+{totalIncome.toLocaleString()}</p>
          </div>

          {/* Card Tổng Chi */}
          <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-3xl flex flex-col justify-center items-center shadow-[0_0_30px_-10px_rgba(244,63,94,0.3)] backdrop-blur-md">
              <p className="text-rose-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">TỔNG CHI TIÊU</p>
              <p className="text-3xl font-black text-white font-mono drop-shadow-md">-{totalExpense.toLocaleString()}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart: Cơ cấu */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-80 relative">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">CƠ CẤU CHI TIÊU</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                          {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} formatter={(val: number) => val.toLocaleString() + ' đ'} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', opacity: 0.8 }} />
                  </PieChart>
              </ResponsiveContainer>
              {pieData.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs italic">Chưa có dữ liệu chi tiêu</div>}
          </div>

          {/* Bar Chart: Dòng tiền */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-80 relative">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">DÒNG TIỀN THEO NGÀY</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="income" fill="#05df72" radius={[2,2,0,0]} barSize={8} name="Thu" />
                      <Bar dataKey="expense" fill="#f43f5e" radius={[2,2,0,0]} barSize={8} name="Chi" />
                  </BarChart>
              </ResponsiveContainer>
              {barData.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs italic">Chưa có giao dịch</div>}
          </div>
      </div>

      {/* --- PHẦN 2: PHÂN TÍCH CHUYÊN SÂU --- */}
      <div className="pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 mb-6">
             <TrendingUp className="text-[#05df72]" size={20} />
             <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">PHÂN TÍCH CHUYÊN SÂU</h3>
          </div>

          {/* Bộ lọc */}
          <div className="bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-white/5 flex flex-wrap gap-2 mb-6 w-fit">
              <button onClick={() => setFilterType('week')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${filterType === 'week' ? 'bg-[#05df72] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>Tuần Này</button>
              <button onClick={() => setFilterType('month')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${filterType === 'month' ? 'bg-[#05df72] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>Tháng Này</button>
              <button onClick={() => setFilterType('custom')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 ${filterType === 'custom' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                  <Calendar size={14}/> Tùy Chọn
              </button>
          </div>

          {filterType === 'custom' && (
              <div className="flex items-center gap-4 mb-6 animate-fade-in bg-black/40 p-4 rounded-xl border border-white/10 w-fit">
                  <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Từ ngày</span>
                      <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-[#05df72]" />
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Đến ngày</span>
                      <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-[#05df72]" />
                  </div>
              </div>
          )}

          {/* Biểu đồ xu hướng (Area Chart) */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-96 relative">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest text-center mb-6">XU HƯỚNG TÀI SẢN RÒNG (THU - CHI)</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                      <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="name" stroke="#555" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                      <YAxis stroke="#555" tick={{fontSize: 10}} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                      <Area type="monotone" dataKey="balance" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" name="Tích lũy ròng" />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default Statistics;