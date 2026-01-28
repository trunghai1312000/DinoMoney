import { useState, useRef } from 'react';
import { Image as ImageIcon, Film, Plus, Trash2, Check, X, Play } from 'lucide-react';

interface WallpaperSelectorProps {
  currentBg: string;
  onSelect: (url: string, type: 'image' | 'video') => void;
  onClose: () => void;
}

const WallpaperSelector = ({ currentBg, onSelect, onClose }: WallpaperSelectorProps) => {
  const [activeTab, setActiveTab] = useState<'static' | 'live'>('static');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dữ liệu mẫu ban đầu
  const [staticWallpapers, setStaticWallpapers] = useState([
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2000&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2000&auto=format&fit=crop",
  ]);

  const [liveWallpapers, setLiveWallpapers] = useState([
    "https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-window-glass-1550-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-traffic-lights-in-a-city-street-at-night-12258-large.mp4",
  ]);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Tạo URL cục bộ cho file vừa chọn
    const localUrl = URL.createObjectURL(file);

    if (activeTab === 'static') {
        setStaticWallpapers([localUrl, ...staticWallpapers]);
        onSelect(localUrl, 'image'); // Tự động chọn luôn
    } else {
        setLiveWallpapers([localUrl, ...liveWallpapers]);
        onSelect(localUrl, 'video'); // Tự động chọn luôn
    }
    
    // Reset input để chọn lại file giống nhau nếu muốn
    event.target.value = '';
  };

  const handleDelete = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (confirm("Xóa hình nền này khỏi danh sách?")) {
        if (activeTab === 'static') setStaticWallpapers(staticWallpapers.filter(w => w !== url));
        else setLiveWallpapers(liveWallpapers.filter(w => w !== url));
        
        // Revoke URL nếu là blob (để giải phóng bộ nhớ - optional nhưng tốt)
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    }
  };

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
            {(activeTab === 'static' ? staticWallpapers : liveWallpapers).map((url, idx) => (
                <div 
                    key={idx}
                    // QUAN TRỌNG: Truyền đúng type
                    onClick={() => onSelect(url, activeTab === 'static' ? 'image' : 'video')}
                    className={`relative group aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${currentBg === url ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-transparent hover:border-white/30'}`}
                >
                    {activeTab === 'static' ? (
                        <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    ) : (
                        <>
                            {/* Preview video nhỏ */}
                            <video src={url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop />
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur rounded flex items-center gap-1">
                                <Play size={8} className="text-white fill-white" />
                                <span className="text-[8px] font-bold text-white uppercase">Live</span>
                            </div>
                        </>
                    )}

                    {/* Delete Button (Hover) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => handleDelete(e, url)}
                            className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md shadow-lg"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>

                    {/* Active Checkmark */}
                    {currentBg === url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                            <div className="bg-purple-500 p-1.5 rounded-full shadow-lg animate-in zoom-in duration-200">
                                <Check size={16} className="text-white" strokeWidth={3} />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WallpaperSelector;