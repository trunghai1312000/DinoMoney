import { useState } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export default function GoldManager() {
  const { goldHoldings, currentGoldPrice, addGoldHolding, fetchGoldData } = useStore();
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [type, setType] = useState('SJC');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tính toán lãi lỗ
  const calculateProfit = (holding: any) => {
    // Giả sử giá trong store là đơn vị nghìn đồng/lượng
    // Cần chuẩn hóa đơn vị. Ở đây giả định tất cả nhập vào là Triệu VND/Lượng
    // currentGoldPrice.sell là giá tiệm bán ra (mình mua vào)
    // currentGoldPrice.buy là giá tiệm mua vào (mình bán ra) -> Dùng giá này để tính lãi
    
    // Nếu API chưa có giá, return 0
    if (currentGoldPrice.buy === 0) return 0;
    
    const currentVal = holding.quantity * currentGoldPrice.buy;
    const boughtVal = holding.quantity * holding.buyPrice;
    return currentVal - boughtVal;
  };

  const handleAddGold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || !buyPrice) return;

    addGoldHolding({
      id: Date.now().toString(),
      type,
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
      buyDate: new Date().toISOString(),
    });

    setQuantity('');
    setBuyPrice('');
  };

  const handleManualUpdate = async () => {
    setIsRefreshing(true);
    await fetchGoldData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
        Quản Lý Vàng 🌟
      </h2>

      {/* Live Price Card */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-50 text-6xl">🏆</div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h3 className="text-gray-400 mb-1">Giá Vàng SJC (Tự động cập nhật 2h/lần)</h3>
            <div className="flex items-end gap-4">
               <div>
                  <p className="text-sm text-gray-400">Giá mua vào (Tiệm)</p>
                  <p className="text-4xl font-bold text-yellow-400">
                    {currentGoldPrice.buy.toLocaleString()} <span className="text-sm">VND</span>
                  </p>
               </div>
               <div className="h-10 w-[1px] bg-white/10 mx-2"></div>
               <div>
                  <p className="text-sm text-gray-400">Giá bán ra (Tiệm)</p>
                  <p className="text-4xl font-bold text-red-400">
                    {currentGoldPrice.sell.toLocaleString()} <span className="text-sm">VND</span>
                  </p>
               </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Cập nhật lúc: {format(new Date(currentGoldPrice.updatedAt), 'HH:mm dd/MM/yyyy')}
            </p>
          </div>
          <button 
            onClick={handleManualUpdate}
            className={`p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="Cập nhật ngay"
          >
            🔄
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Mua Vàng */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Ghi nhận mua vàng</h3>
          <form onSubmit={handleAddGold} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Loại vàng</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 rounded-lg glass-input bg-slate-800"
              >
                <option value="SJC">Vàng miếng SJC</option>
                <option value="PNJ">Vàng PNJ</option>
                <option value="NHAN_TRON">Nhẫn trơn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Số lượng (Lượng/Chỉ)</label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-3 rounded-lg glass-input"
                placeholder="Ví dụ: 1.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Giá mua lúc đó (VND)</label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full p-3 rounded-lg glass-input"
                placeholder="Nhập giá lúc bạn mua"
                required
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-lg glass-button font-bold">
              Thêm vào két
            </button>
          </form>
        </div>

        {/* Danh sách tài sản vàng */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Kho vàng của bạn</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="pb-3">Ngày mua</th>
                  <th className="pb-3">Loại</th>
                  <th className="pb-3 text-right">Số lượng</th>
                  <th className="pb-3 text-right">Giá mua gốc</th>
                  <th className="pb-3 text-right">Hiện tại</th>
                  <th className="pb-3 text-right">Lãi/Lỗ</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {goldHoldings.map((gold) => {
                   const profit = calculateProfit(gold);
                   const isProfitable = profit >= 0;
                   return (
                    <tr key={gold.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 text-gray-300">
                        {format(new Date(gold.buyDate), 'dd/MM/yyyy')}
                      </td>
                      <td className="py-3 font-medium text-yellow-500">{gold.type}</td>
                      <td className="py-3 text-right">{gold.quantity}</td>
                      <td className="py-3 text-right text-gray-400">
                        {gold.buyPrice.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {(currentGoldPrice.buy * gold.quantity).toLocaleString()}
                      </td>
                      <td className={`py-3 text-right font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfitable ? '+' : ''}{profit.toLocaleString()}
                      </td>
                    </tr>
                   );
                })}
                {goldHoldings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                      Chưa có vàng trong két. Hãy mua ngay để tích trữ!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}