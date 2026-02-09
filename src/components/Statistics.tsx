import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Statistics() {
  const { transactions, categories, goldHoldings, currentGoldPrice } = useStore();
  const [analysisMode, setAnalysisMode] = useState<'today' | 'deep'>('deep');
  const [deepTimeRange, setDeepTimeRange] = useState<'week' | 'month'>('week');

  // --- LOGIC HÔM NAY ---
  const todayTransactions = transactions.filter(t => isSameDay(parseISO(t.date), new Date()));
  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // --- LOGIC CHUYÊN SÂU ---
  const getDeepData = () => {
    const now = new Date();
    let start, end;
    
    if (deepTimeRange === 'week') {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else {
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    const txsInRange = transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }));

    // 1. Biểu đồ Xu hướng tài sản ròng (Thu - Chi theo ngày)
    const trendData = eachDayOfInterval({ start, end }).map(day => {
      const dayTxs = txsInRange.filter(t => isSameDay(parseISO(t.date), day));
      const inc = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        date: format(day, 'dd/MM'),
        net: inc - exp,
        income: inc,
        expense: exp
      };
    });

    // 2. Biểu đồ tròn Chi tiêu theo danh mục
    const expenseTxs = txsInRange.filter(t => t.type === 'expense');
    const categoryDataMap: Record<string, number> = {};
    expenseTxs.forEach(t => {
      const catName = categories.find(c => c.id === t.category)?.name || 'Khác';
      categoryDataMap[catName] = (categoryDataMap[catName] || 0) + t.amount;
    });
    const pieData = Object.entries(categoryDataMap).map(([name, value]) => ({ name, value }));

    return { trendData, pieData };
  };

  const { trendData, pieData } = getDeepData();
  const totalGoldValue = goldHoldings.reduce((sum, g) => sum + (g.quantity * currentGoldPrice.buy), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Thống Kê 📈
        </h2>
        <div className="flex bg-white/10 rounded-lg p-1">
          <button 
             onClick={() => setAnalysisMode('today')}
             className={`px-4 py-2 rounded-md ${analysisMode === 'today' ? 'bg-purple-500' : 'text-gray-400'}`}
          >Hôm nay</button>
          <button 
             onClick={() => setAnalysisMode('deep')}
             className={`px-4 py-2 rounded-md ${analysisMode === 'deep' ? 'bg-pink-500' : 'text-gray-400'}`}
          >Chuyên sâu</button>
        </div>
      </div>

      {analysisMode === 'today' ? (
        <div className="animate-fade-in space-y-6">
           {/* Thẻ Summary Hôm nay */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-green-500">
                 <p className="text-gray-400">Thu nhập hôm nay</p>
                 <p className="text-3xl font-bold text-green-400">+{todayIncome.toLocaleString()}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-red-500">
                 <p className="text-gray-400">Chi tiêu hôm nay</p>
                 <p className="text-3xl font-bold text-red-400">-{todayExpense.toLocaleString()}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-blue-500">
                 <p className="text-gray-400">Cân đối ngày</p>
                 <p className="text-3xl font-bold text-blue-400">{(todayIncome - todayExpense).toLocaleString()}</p>
              </div>
           </div>
           
           <div className="glass-panel p-6 rounded-2xl">
             <h3 className="text-white font-semibold mb-4">Chi tiết hôm nay</h3>
             {todayTransactions.length > 0 ? (
               <ul className="space-y-2">
                 {todayTransactions.map(t => (
                   <li key={t.id} className="flex justify-between p-2 hover:bg-white/5 rounded">
                     <span>{t.note || categories.find(c => c.id === t.category)?.name}</span>
                     <span className={t.type === 'income' ? 'text-green-400' : 'text-red-400'}>
                       {t.amount.toLocaleString()}
                     </span>
                   </li>
                 ))}
               </ul>
             ) : <p className="text-gray-500 italic">Chưa có dữ liệu hôm nay.</p>}
           </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
           <div className="flex justify-end gap-2">
             <button onClick={() => setDeepTimeRange('week')} className={`px-3 py-1 rounded text-sm ${deepTimeRange === 'week' ? 'bg-white/20' : 'bg-transparent text-gray-400'}`}>Tuần này</button>
             <button onClick={() => setDeepTimeRange('month')} className={`px-3 py-1 rounded text-sm ${deepTimeRange === 'month' ? 'bg-white/20' : 'bg-transparent text-gray-400'}`}>Tháng này</button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Biểu đồ xu hướng */}
              <div className="glass-panel p-6 rounded-2xl">
                 <h3 className="text-lg font-semibold mb-6">Xu hướng Thu/Chi ({deepTimeRange === 'week' ? 'Tuần' : 'Tháng'})</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={trendData}>
                       <defs>
                         <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                         </linearGradient>
                         <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                       <YAxis stroke="#9CA3AF" fontSize={12} />
                       <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                       <Legend />
                       <Area type="monotone" dataKey="income" name="Thu" stroke="#10B981" fillOpacity={1} fill="url(#colorInc)" />
                       <Area type="monotone" dataKey="expense" name="Chi" stroke="#EF4444" fillOpacity={1} fill="url(#colorExp)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* Biểu đồ tròn Danh mục */}
              <div className="glass-panel p-6 rounded-2xl">
                 <h3 className="text-lg font-semibold mb-6">Cơ cấu chi tiêu</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={pieData}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         fill="#8884d8"
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                       <Legend layout="vertical" verticalAlign="middle" align="right" />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* Thẻ Vàng tích lũy */}
              <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex items-center justify-between bg-gradient-to-r from-yellow-900/30 to-yellow-600/10">
                 <div>
                    <h3 className="text-xl font-bold text-yellow-500">Tổng tài sản Vàng</h3>
                    <p className="text-gray-400 text-sm">Giá trị hiện tại ước tính</p>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-bold text-white">{totalGoldValue.toLocaleString()} <span className="text-base font-normal text-gray-400">VND</span></p>
                    <p className="text-sm text-green-400">Đã cập nhật theo giá thị trường</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}