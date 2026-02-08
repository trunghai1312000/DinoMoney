import React, { useState, useEffect } from 'react';
import { Coins, RefreshCw, Bell, Gem, Trash2 } from 'lucide-react';
import { GoldSettings, Jewelry, dbService } from '../services/db';
import { sendNotification } from '@tauri-apps/plugin-notification';

interface GoldManagerProps {
  gold: GoldSettings;
  jewelryList: Jewelry[]; // Nhận list từ App
  onUpdate9999: (qty: number, price: number) => Promise<void>;
  onAddJewelry: (name: string, weight: number, price: number) => Promise<void>;
  onDeleteJewelry: (id: number) => Promise<void>;
}

const GoldManager: React.FC<GoldManagerProps> = ({ gold, jewelryList, onUpdate9999, onAddJewelry, onDeleteJewelry }) => {
  const [tab, setTab] = useState<'9999' | 'jewelry'>('9999');
  
  // State 9999
  const [unit, setUnit] = useState<'CHI' | 'CAY'>('CHI');
  const [displayQty, setDisplayQty] = useState(gold.quantity);
  const [pricePerChi, setPricePerChi] = useState(gold.market_price);
  
  // State Jewelry Form
  const [jName, setJName] = useState("");
  const [jWeight, setJWeight] = useState("");
  const [jPrice, setJPrice] = useState("");

  // Logic 9999 Sync
  useEffect(() => {
    setDisplayQty(unit === 'CHI' ? gold.quantity : gold.quantity / 10);
    setPricePerChi(gold.market_price);
  }, [gold, unit]);

  // Logic Auto Update Price 9999
  useEffect(() => {
    const fetchPrice = () => {
      // Giả lập biến động giá
      const fluctuation = Math.floor(Math.random() * 50000) - 25000;
      const newPrice = pricePerChi + fluctuation;
      if (Math.abs(fluctuation) > 1000) {
          setPricePerChi(newPrice);
          onUpdate9999(gold.quantity, newPrice);
      }
    };
    const interval = setInterval(fetchPrice, 3600000); // 1h
    return () => clearInterval(interval);
  }, [pricePerChi, gold.quantity]);

  const handleSave9999 = async () => {
    const finalQty = unit === 'CHI' ? displayQty : displayQty * 10;
    await onUpdate9999(finalQty, pricePerChi);
  };

  const handleAddJewelryItem = async () => {
      if(!jName || !jWeight || !jPrice) return;
      await onAddJewelry(jName, parseFloat(jWeight), parseFloat(jPrice));
      setJName(""); setJWeight(""); setJPrice("");
  };

  const total9999 = gold.quantity * gold.market_price;
  const totalJewelry = jewelryList.reduce((sum, item) => sum + item.buy_price, 0);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
      
      {/* Tab Switcher */}
      <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-fit mx-auto backdrop-blur-md">
        <button onClick={() => setTab('9999')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tab === '9999' ? 'bg-[#05df72] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <Coins size={14} /> Vàng 9999
        </button>
        <button onClick={() => setTab('jewelry')} className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tab === 'jewelry' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <Gem size={14} /> Nữ Trang
        </button>
      </div>

      {tab === '9999' && (
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-lg">
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center">
                  <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-bold">Tổng Giá Trị (9999)</p>
                  <p className="text-2xl font-bold text-[#05df72] tracking-tight font-mono">{total9999.toLocaleString()} đ</p>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center">
                  <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-bold">Quy đổi ra Cây</p>
                  <p className="text-2xl font-bold text-white font-mono">{(gold.quantity / 10).toFixed(2)} <span className="text-sm text-gray-500">lượng</span></p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex gap-2 justify-center mb-4">
                    <button onClick={() => setUnit('CHI')} className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase ${unit === 'CHI' ? 'bg-[#05df72]/20 text-[#05df72] border border-[#05df72]' : 'text-gray-500 border border-transparent'}`}>Nhập Chỉ</button>
                    <button onClick={() => setUnit('CAY')} className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase ${unit === 'CAY' ? 'bg-[#05df72]/20 text-[#05df72] border border-[#05df72]' : 'text-gray-500 border border-transparent'}`}>Nhập Cây</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] text-[#05df72] mb-2 block font-bold uppercase tracking-wider">Số lượng ({unit})</label>
                        <input type="number" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#05df72] outline-none font-mono text-lg"
                            value={displayQty} onChange={(e) => setDisplayQty(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                        <label className="text-[10px] text-[#05df72] mb-2 block font-bold uppercase tracking-wider">Giá hiện tại (đ/Chỉ)</label>
                        <div className="relative">
                            <input type="number" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#05df72] outline-none font-mono text-lg"
                                value={pricePerChi} onChange={(e) => setPricePerChi(parseFloat(e.target.value) || 0)} />
                            <RefreshCw size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 animate-spin-slow" />
                        </div>
                    </div>
                </div>
                <button onClick={handleSave9999} className="w-full bg-[#05df72] hover:bg-[#04c463] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg text-xs">Cập nhật 9999</button>
             </div>
          </div>
      )}

      {tab === 'jewelry' && (
          <div className="space-y-6">
              {/* Form thêm nữ trang */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                  <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2"><PlusCircle size={14}/> Thêm Nữ Trang</h4>
                  <div className="grid grid-cols-3 gap-4">
                      <input placeholder="Tên (Nhẫn, Lắc...)" value={jName} onChange={e => setJName(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-purple-500"/>
                      <input placeholder="Khối lượng (Chỉ)" type="number" value={jWeight} onChange={e => setJWeight(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-purple-500"/>
                      <input placeholder="Giá trị (VNĐ)" type="number" value={jPrice} onChange={e => setJPrice(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-purple-500"/>
                  </div>
                  <button onClick={handleAddJewelryItem} className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest">Lưu vào bộ sưu tập</button>
              </div>

              {/* Danh sách */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jewelryList.map(item => (
                      <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-purple-500/50 transition-all">
                          <div>
                              <p className="font-bold text-white">{item.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase">{item.weight} chỉ • {new Date(item.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                              <p className="font-mono text-purple-400 font-bold">{item.buy_price.toLocaleString()} đ</p>
                              <button onClick={() => onDeleteJewelry(item.id)} className="text-gray-600 hover:text-red-500 transition-colors mt-1"><Trash2 size={14}/></button>
                          </div>
                      </div>
                  ))}
                  {jewelryList.length === 0 && <p className="text-gray-500 text-xs italic col-span-2 text-center">Chưa có nữ trang nào.</p>}
              </div>
          </div>
      )}
    </div>
  );
};
import { PlusCircle } from 'lucide-react'; // Bổ sung import thiếu
export default GoldManager;