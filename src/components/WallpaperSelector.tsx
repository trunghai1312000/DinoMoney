import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Film, Plus, Trash2, Check, X, Play } from 'lucide-react';
import * as db from '../services/db';

interface WallpaperSelectorProps {
  currentBg: string;
  onSelect: (url: string, type: 'image' | 'video') => void;
  onClose: () => void;
}

// Kiểu dữ liệu nội bộ cho Component này (để quản lý ID khi xóa)
interface WallpaperItem {
    id: string;
    url: string;
}

const WallpaperSelector = ({ currentBg, onSelect, onClose }: WallpaperSelectorProps) => {
  const [activeTab, setActiveTab] = useState<'static' | 'live'>('static');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Thay vì lưu mảng string URL, ta lưu mảng Object {id, url} để dễ xóa trong DB
  const [staticWallpapers, setStaticWallpapers] = useState<WallpaperItem[]>([]);
  const [liveWallpapers, setLiveWallpapers] = useState<WallpaperItem[]>([]);

  // Load Data từ DB
  useEffect(() => {
      const fetchWallpapers = async () => {
          const allWp = await db.getWallpapers();
          
          setStaticWallpapers(
              allWp.filter(w => w.type === 'image').map(w => ({ id: w.id, url: w.url }))
          );
          setLiveWallpapers(
              allWp.filter(w => w.type === 'video').map(w => ({ id: w.id, url: w.url }))
          );
      };
      fetchWallpapers();
  }, []);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Đọc file thành Base64 để lưu vào DB (Persistence)
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Url = e.target?.result as string;
        const newId = crypto.randomUUID();
        const type = activeTab === 'static' ? 'image' : 'video';

        // 1. Lưu vào DB
        await db.addWallpaper({
            id: newId,
            type: type,
            url: base64Url
        });

        // 2. Cập nhật UI ngay lập tức
        const newItem = { id: newId, url: base64Url };
        if (activeTab === 'static') {
            setStaticWallpapers([newItem, ...staticWallpapers]);
            onSelect(base64Url, 'image');
        } else {
            setLiveWallpapers([newItem, ...liveWallpapers]);
            onSelect(base64Url, 'video');
        }
    };

    if (activeTab === 'static') {
        reader.readAsDataURL(file);
    } else {
        // Với Video, base64 có thể rất nặng, nhưng với SQLite local thì vẫn ổn cho các clip ngắn.
        // Trong thực tế production app lớn, người ta sẽ lưu file vào FileSystem của OS (fs write) và lưu path vào DB.
        // Nhưng ở đây để đơn giản và đồng bộ logic Base64 như yêu cầu trước, ta dùng Base64.
        reader.readAsDataURL(file);
    }
    
    event.target.value = '';
  };

  const handleDelete = async (e: React.MouseEvent, item: WallpaperItem) => {
    e.stopPropagation();
    if (confirm("Xóa hình nền này khỏi thư viện?")) {
        // 1. Xóa khỏi DB
        await db.deleteWallpaper(item.id);

        // 2. Cập nhật UI
        if (activeTab === 'static') {
            setStaticWallpapers(prev => prev.filter(w => w.id !== item.id));
        } else {
            setLiveWallpapers(prev => prev.filter(w => w.id !== item.id));
        }
    }
  };

  // List Item đang hiển thị dựa trên Tab
  const displayItems = activeTab === 'static' ? staticWallpapers : liveWallpapers;

  return (
    <div className="flex flex-col h-full text-white font-sans">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={activeTab === 'static' ? "image/*" : "video/mp4,video/webm"} 
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <div>
            <h3 className="font-bold text-lg">Hình nền</h3>
            <p className="text-xs text-zinc-400">Chọn không gian của bạn</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="p-4 pb-0">
        <div className="flex p-1 gap-1 bg-black/40 rounded-xl border border-white/10">
            <button 
                onClick={() => setActiveTab('static')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'static' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
                <ImageIcon size={14} /> Ảnh tĩnh
            </button>
            <button 
                onClick={() => setActiveTab('live')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'live' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
                <Film size={14} /> Live Video
            </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="grid grid-cols-2 gap-3">
            
            {/* Add New Button */}
            <button 
                onClick={handleAddClick}
                className="aspect-video rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-white hover:border-purple-500/50 hover:bg-white/5 transition-all group"
                title={activeTab === 'static' ? "Thêm ảnh từ máy" : "Thêm video MP4 từ máy"}
            >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                    <Plus size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase">Thêm mới</span>
            </button>

            {/* List Wallpapers */}
            {displayItems.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-zinc-600 text-xs">
                    Đang tải thư viện...
                </div>
            ) : (
                displayItems.map((item) => (
                    <div 
                        key={item.id}
                        // QUAN TRỌNG: Truyền đúng type
                        onClick={() => onSelect(item.url, activeTab === 'static' ? 'image' : 'video')}
                        className={`relative group aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${currentBg === item.url ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-transparent hover:border-white/30'}`}
                    >
                        {activeTab === 'static' ? (
                            <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        ) : (
                            <>
                                {/* Preview video nhỏ */}
                                <video src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop />
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur rounded flex items-center gap-1">
                                    <Play size={8} className="text-white fill-white" />
                                    <span className="text-[8px] font-bold text-white uppercase">Live</span>
                                </div>
                            </>
                        )}

                        {/* Delete Button (Hover) */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => handleDelete(e, item)}
                                className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md shadow-lg"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>

                        {/* Active Checkmark */}
                        {currentBg === item.url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                <div className="bg-purple-500 p-1.5 rounded-full shadow-lg animate-in zoom-in duration-200">
                                    <Check size={16} className="text-white" strokeWidth={3} />
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default WallpaperSelector;