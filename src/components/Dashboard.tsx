import React from 'react';
import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, CreditCard, Banknote, Coins } from 'lucide-react';
import { format } from 'date-fns';

// Màu sắc bạn yêu cầu: Tối hơn, ngầu hơn
const COLORS = ['#05df72', '#0ea5e9', '#eab308', '#f43f5e'];

export default function Dashboard() {
  // 1. Lấy dữ liệu từ Store
  const { transactions = [], wallets = [], currentGoldPrice, goldHoldings = [], categories } = useStore();

  // 2. Xử lý logic tính toán (Thay vì nhận props)
  const cashWallets = wallets.filter(w => w.type === 'cash');
  const digitalWallets = wallets.filter(w => w.type !== 'cash');

  const totalCash = cashWallets.reduce((sum, w) => sum + w.balance, 0);
  const totalDigital = digitalWallets.reduce((sum, w) => sum + w.balance, 0);

  // Lọc ra danh sách chi tiêu (Expenses)
  const expenses = (transactions || []).filter(t => t.type === 'expense');
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  // Tính giá trị vàng
  const totalGoldValue = (goldHoldings || []).reduce((sum, g) => {
    const price = currentGoldPrice?.buy || 0;
    return sum + (g.quantity * price);
  }, 0);

  const chartData = [
    { name: 'Tiền mặt', value: totalCash },
    { name: 'Ngân hàng/Ví', value: totalDigital },
    { name: 'Vàng', value: totalGoldValue },
  ].filter(i => i.value > 0);

  const totalAssets = totalCash + totalDigital + totalGoldValue;

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard 
            title="TIỀN MẶT" 
            value={totalCash} 
            icon={<Banknote className="text-[#05df72]" />} 
            color="border-[#05df72]"
        />
        <SummaryCard 
            title="NGÂN HÀNG / VÍ" 
            value={totalDigital} 
            icon={<CreditCard className="text-sky-500" />} 
            color="border-sky-500"
        />
        <SummaryCard 
            title="VÀNG QUY ĐỔI" 
            value={totalGoldValue} 
            icon={<Coins className="text-yellow-500" />} 
            color="border-yellow-500"
        />
        <SummaryCard 
            title="ĐÃ CHI TIÊU" 
            value={totalSpent} 
            icon={<TrendingDown className="text-rose-500" />} 
            color="border-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transparent Chart Card */}
        <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 h-96 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#05df72] to-transparent opacity-50"></div>
          <h3 className="text-xs font-bold mb-4 text-gray-400 uppercase tracking-widest">CƠ CẤU TÀI SẢN</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                innerRadius={85} 
                outerRadius={105} 
                paddingAngle={5} 
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(5, 5, 5, 0.9)', borderColor: '#222', borderRadius: '8px', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', fontFamily: 'monospace' }}
                formatter={(value: number) => value.toLocaleString() + ' đ'}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-4">
             <span className="text-[10px] text-gray-500 uppercase tracking-wider">Tổng cộng</span>
             <p className="text-xl font-bold text-white font-mono">{totalAssets.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 h-96 overflow-y-auto custom-scrollbar hover:border-white/10 transition-colors">
          <h3 className="text-xs font-bold mb-6 text-gray-400 uppercase tracking-widest">GIAO DỊCH GẦN ĐÂY</h3>
          <div className="space-y-2">
            {expenses.length === 0 ? (
                <p className="text-gray-500 text-sm text-center mt-10">Chưa có chi tiêu nào gần đây</p>
            ) : (
                expenses.slice(0, 10).map(exp => {
                    const catName = categories.find(c => c.id === exp.category)?.name || 'Khác';
                    return (
                        <div key={exp.id} className="group flex justify-between items-center p-3.5 bg-white/[0.03] rounded-xl border border-white/5 hover:border-[#05df72]/30 hover:bg-[#05df72]/5 transition-all cursor-default">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <TrendingDown size={14} />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-200 group-hover:text-[#05df72] transition-colors">
                                    {exp.note || catName}
                                </p>
                                <p className="text-[10px] text-gray-600 font-mono">
                                    {format(new Date(exp.date), 'dd/MM/yyyy')}
                                </p>
                            </div>
                          </div>
                          <span className="text-rose-400 font-bold font-mono text-sm">-{exp.amount.toLocaleString()}</span>
                        </div>
                    );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color }: any) => (
  <div className={`bg-black/30 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-opacity-40 transition-all group relative overflow-hidden`}>
    <div className={`absolute left-0 top-0 w-[2px] h-full ${color.replace('border', 'bg')}`}></div>
    <div className="flex justify-between items-start">
        <div>
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
            <p className="text-xl font-bold text-white font-mono group-hover:translate-x-1 transition-transform">{value.toLocaleString()}</p>
        </div>
        <div className="opacity-40 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0 transform group-hover:scale-110 duration-300">
            {icon}
        </div>
    </div>
  </div>
);