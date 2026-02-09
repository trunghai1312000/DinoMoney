import { useState } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export default function GoldManager() {
  const { goldHoldings, currentGoldPrice, addGoldHolding, fetchGoldData } = useStore();
  
  // Tab: '9999' or 'jewelry'
  const [tab, setTab] = useState<'9999' | 'jewelry'>('9999');

  // Form State
  const [unit9999, setUnit9999] = useState<'chi' | 'cay'>('chi');
  const [quantity9999, setQuantity9999] = useState('');
  
  const [jewelryName, setJewelryName] = useState('');
  const [jewelryWeight, setJewelryWeight] = useState('');
  const [jewelryPrice, setJewelryPrice] = useState(''); // Đơn giá

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualUpdate = async () => {
    setIsRefreshing(true);
    await fetchGoldData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalQty = 0; // Quy đổi ra chỉ
    let finalBuyPrice = 0; // Giá mua vào (tổng hoặc đơn giá quy đổi, ở đây lưu đơn giá / chỉ để thống nhất)
    let typeName = "";

    if (tab === '9999') {
        const qty = parseFloat(quantity9999);
        if (!qty) return;
        
        finalQty = unit9999 === 'cay' ? qty * 10 : qty;
        typeName = "Vàng 9999 (SJC/Nhẫn)";
        // Vàng 9999 tự lấy giá thị trường hiện tại làm giá mua (hoặc logic khác nếu muốn nhập tay)
        // Ở đây giả sử mua theo giá tiệm bán ra hiện tại
        finalBuyPrice = currentGoldPrice.sell; 
    } else {
        const qty = parseFloat(jewelryWeight);
        const price = parseFloat(jewelryPrice);
        if (!qty || !price || !jewelryName) return;

        finalQty = qty;
        typeName = jewelryName;
        finalBuyPrice = price; // Lưu đơn giá người dùng nhập
    }

    addGoldHolding({
      id: Date.now().toString(),
      type: typeName,
      quantity: finalQty, // Lưu thống nhất là 'chỉ'
      buyPrice: finalBuyPrice,
      buyDate: new Date().toISOString(),
    });

    // Reset
    setQuantity9999('');
    setJewelryName('');
    setJewelryWeight('');
    setJewelryPrice('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Giá Vàng Live */}
      <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex justify-between items-center">
         <div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">GIÁ VÀNG SJC HIỆN TẠI</h3>
            <div className="flex items-end gap-6">
               <div>
                  <p className="text-xs text-gray-400">Mua vào</p>
                  <p className="text-2xl font-bold font-mono text-[#05df72]">{currentGoldPrice.buy.toLocaleString()}</p>
               </div>
               <div className="h-8 w-[1px] bg-white/10"></div>
               <div>
                  <p className="text-xs text-gray-400">Bán ra</p>
                  <p className="text-2xl font-bold font-mono text-[#f43f5e]">{currentGoldPrice.sell.toLocaleString()}</p>
               </div>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 font-mono">
              Cập nhật: {format(new Date(currentGoldPrice.updatedAt), 'HH:mm dd/MM')}
            </p>
         </div>
         <button 
            onClick={handleManualUpdate}
            className={`p-3 rounded-full bg-white/5 hover:bg-white/10 text-[#0ea5e9] transition-all ${isRefreshing ? 'animate-spin' : ''}`}
         >
            🔄
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FORM MUA VÀNG - Giao diện cổ điển hơn */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 h-fit shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            GHI NHẬN MUA VÀNG
          </h3>

          <div className="flex mb-4 bg-black p-1 rounded-lg">
             <button 
                onClick={() => setTab('9999')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tab === '9999' ? 'bg-[#eab308] text-black' : 'text-gray-500 hover:text-white'}`}
             >
                VÀNG 9999
             </button>
             <button 
                onClick={() => setTab('jewelry')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tab === 'jewelry' ? 'bg-[#eab308] text-black' : 'text-gray-500 hover:text-white'}`}
             >
                NỮ TRANG
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === '9999' ? (
                <>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 mb-1">Số lượng</label>
                            <input
                                type="number"
                                step="0.01"
                                value={quantity9999}
                                onChange={e => setQuantity9999(e.target.value)}
                                className="w-full p-2 bg-black border border-white/20 rounded text-white text-sm outline-none focus:border-[#eab308]"
                                placeholder="0.0"
                            />
                        </div>
                        <div className="w-1/3">
                            <label className="block text-[10px] text-gray-400 mb-1">Đơn vị</label>
                            <select 
                                value={unit9999}
                                onChange={e => setUnit9999(e.target.value as any)}
                                className="w-full p-2 bg-black border border-white/20 rounded text-white text-sm outline-none"
                            >
                                <option value="chi">Chỉ</option>
                                <option value="cay">Cây</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-500">
                        * Giá mua sẽ được tự động lấy theo giá thị trường hiện tại ({currentGoldPrice.sell.toLocaleString()} đ/chỉ).
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Loại trang sức</label>
                        <input
                            type="text"
                            value={jewelryName}
                            onChange={e => setJewelryName(e.target.value)}
                            className="w-full p-2 bg-black border border-white/20 rounded text-white text-sm outline-none focus:border-[#eab308]"
                            placeholder="Dây chuyền, nhẫn..."
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Khối lượng (Chỉ)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={jewelryWeight}
                            onChange={e => setJewelryWeight(e.target.value)}
                            className="w-full p-2 bg-black border border-white/20 rounded text-white text-sm outline-none focus:border-[#eab308]"
                            placeholder="0.0"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Đơn giá mua (VND/Chỉ)</label>
                        <input
                            type="number"
                            value={jewelryPrice}
                            onChange={e => setJewelryPrice(e.target.value)}
                            className="w-full p-2 bg-black border border-white/20 rounded text-white text-sm outline-none focus:border-[#eab308]"
                            placeholder="Nhập giá lúc mua"
                        />
                    </div>
                </>
            )}

            <button type="submit" className="w-full py-2 bg-[#eab308] hover:bg-[#ca8a04] text-black font-bold text-sm rounded transition-all mt-2">
                XÁC NHẬN MUA
            </button>
          </form>
        </div>

        {/* LIST VÀNG */}
        <div className="md:col-span-2 bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl p-6">
           <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">KHO VÀNG CỦA TÔI</h3>
           <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-gray-500 border-b border-white/5 text-xs">
                        <th className="text-left pb-2 font-normal">Ngày mua</th>
                        <th className="text-left pb-2 font-normal">Loại</th>
                        <th className="text-right pb-2 font-normal">KL (Chỉ)</th>
                        <th className="text-right pb-2 font-normal">Giá gốc</th>
                        <th className="text-right pb-2 font-normal">Hiện tại</th>
                    </tr>
                </thead>
                <tbody className="text-gray-300">
                    {goldHoldings.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-600 italic">Chưa có vàng</td></tr>
                    ) : (
                        goldHoldings.map(g => (
                            <tr key={g.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                <td className="py-3 font-mono text-gray-500">{format(new Date(g.buyDate), 'dd/MM/yy')}</td>
                                <td className="py-3 font-bold text-[#eab308]">{g.type}</td>
                                <td className="py-3 text-right">{g.quantity}</td>
                                <td className="py-3 text-right text-gray-500">{g.buyPrice.toLocaleString()}</td>
                                <td className="py-3 text-right font-bold text-white">{(g.quantity * currentGoldPrice.buy).toLocaleString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
           </div>
        </div>
      </div>
    </div>
  );
}