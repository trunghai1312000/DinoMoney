import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, CloudRain, Wind, Trees, ListMusic, Waves, Repeat, Shuffle, Plus, Trash2, X } from 'lucide-react';

// Định nghĩa kiểu dữ liệu bài hát
type Song = {
  id: number | string;
  title: string;
  artist: string;
  duration: string; // Display string "MM:SS"
  durationSec: number; // Logic logic
};

const SoundMixer = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'playlist' | 'ambience'>('playlist');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // --- STATE PLAYLIST ---
  const [playlist, setPlaylist] = useState<Song[]>([
    { id: 1, title: "Lofi Study Beats", artist: "DinoFocus Radio", duration: "3:45", durationSec: 225 },
    { id: 2, title: "Deep Focus Alpha", artist: "Brain Power", duration: "5:20", durationSec: 320 },
    { id: 3, title: "Coffee Shop Jazz", artist: "Cafe Vibes", duration: "4:10", durationSec: 250 },
  ]);
  
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // --- STATE AMBIENCE (Đã khôi phục) ---
  const [ambientSounds, setAmbientSounds] = useState([
    { id: 'rain', label: 'Rain Storm', icon: CloudRain, volume: 0, active: false },
    { id: 'wind', label: 'Windy Hill', icon: Wind, volume: 40, active: true },
    { id: 'forest', label: 'Night Forest', icon: Trees, volume: 0, active: false },
  ]);

  // --- LOGIC PLAYER ---
  const currentSong = playlist[currentSongIndex];

  const handleNext = () => {
    if (isRepeat) {
        setCurrentTime(0);
        return;
    }
    if (isShuffle) {
        let nextIndex;
        do { nextIndex = Math.floor(Math.random() * playlist.length); } 
        while (nextIndex === currentSongIndex && playlist.length > 1);
        setCurrentSongIndex(nextIndex);
    } else {
        setCurrentSongIndex(prev => (prev < playlist.length - 1 ? prev + 1 : 0));
    }
  };

  const handlePrev = () => {
     setCurrentSongIndex(prev => (prev > 0 ? prev - 1 : playlist.length - 1));
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && currentTime < currentSong.durationSec) {
      interval = setInterval(() => setCurrentTime(p => p + 1), 1000);
    } else if (currentTime >= currentSong.durationSec) {
       handleNext();
       setCurrentTime(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, currentSongIndex, playlist]);

  useEffect(() => {
      setCurrentTime(0);
      setIsPlaying(true);
  }, [currentSongIndex]);

  // --- LOGIC ADD / DELETE SONG ---
  const handleAddSong = () => {
      const newSong: Song = {
          id: Date.now(),
          title: `New Song ${playlist.length + 1}`,
          artist: "Unknown Artist",
          duration: "3:00",
          durationSec: 180
      };
      setPlaylist([...playlist, newSong]);
  };

  const handleDeleteSong = (e: React.MouseEvent, id: number | string) => {
      e.stopPropagation();
      if (playlist.length <= 1) return;
      setPlaylist(prev => prev.filter(s => s.id !== id));
      if (playlist[currentSongIndex].id === id) {
          setCurrentSongIndex(0);
          setCurrentTime(0);
          setIsPlaying(false);
      }
  };

  // --- LOGIC AMBIENCE (Đã khôi phục) ---
  const toggleAmbient = (id: string) => {
    setAmbientSounds(sounds => sounds.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const handleVolumeChange = (id: string, val: number) => {
    setAmbientSounds(sounds => sounds.map(s => 
      s.id === id ? { ...s, volume: val, active: val > 0 } : s
    ));
  };

  // --- RENDER ---
  return (
    <div className="w-full h-full flex flex-col bg-transparent text-zinc-100 font-sans relative">
      
      {/* Header */}
      <div className="p-6 pb-2 border-b border-white/5 flex justify-between items-center">
        <div>
           <h2 className="text-lg font-light tracking-wide mb-1 flex items-center gap-2 text-white">
            <Volume2 size={18} className="text-green-400" /> Soundscapes
           </h2>
           <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Mix your focus environment</p>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-4 gap-6">
        <button onClick={() => setActiveTab('playlist')} className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'playlist' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
          Playlist {activeTab === 'playlist' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>}
        </button>
        <button onClick={() => setActiveTab('ambience')} className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'ambience' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
          Ambience {activeTab === 'ambience' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        
        {/* --- TAB 1: PLAYLIST --- */}
        {activeTab === 'playlist' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
             {playlist.map((song, idx) => (
               <div 
                  key={song.id} 
                  onClick={() => setCurrentSongIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all backdrop-blur-sm ${
                    currentSongIndex === idx ? 'bg-white/10 border border-white/10 shadow-lg' : 'hover:bg-white/5 border border-transparent'
                  }`}
               >
                 <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${currentSongIndex === idx && isPlaying ? 'text-green-400' : 'text-zinc-500'}`}>
                        {currentSongIndex === idx && isPlaying ? <Waves size={16} className="animate-pulse" /> : <ListMusic size={16} />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${currentSongIndex === idx ? 'text-green-400' : 'text-zinc-200'}`}>{song.title}</h4>
                      <p className="text-[10px] text-zinc-500">{song.artist}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                     <span className={`text-xs font-mono mr-2 ${currentSongIndex === idx ? 'text-green-400/70' : 'text-zinc-600'}`}>{song.duration}</span>
                     <button onClick={(e) => handleDeleteSong(e, song.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded text-zinc-600 transition-all">
                         <Trash2 size={12} />
                     </button>
                 </div>
               </div>
             ))}

             <button onClick={handleAddSong} className="w-full py-3 mt-4 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:text-green-400 hover:border-green-500/50 hover:bg-green-500/5 transition-all group">
                 <Plus size={16} />
                 <span className="text-xs uppercase tracking-wider font-bold">Add Track</span>
             </button>
          </div>
        )}

        {/* --- TAB 2: AMBIENCE (FULL) --- */}
        {activeTab === 'ambience' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {ambientSounds.map((sound) => (
                <div key={sound.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 hover:bg-black/30 transition-colors">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                         <sound.icon size={16} className={sound.active ? 'text-green-400' : 'text-zinc-600'} />
                         <span className={`text-sm ${sound.active ? 'text-white' : 'text-zinc-500'}`}>{sound.label}</span>
                      </div>
                      <button 
                        onClick={() => toggleAmbient(sound.id)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${sound.active ? 'bg-green-500/80' : 'bg-zinc-700/50'}`}
                      >
                         <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${sound.active ? 'left-4.5' : 'left-0.5'}`}></div>
                      </button>
                   </div>
                   <input 
                      type="range" min="0" max="100" value={sound.volume} disabled={!sound.active}
                      onChange={(e) => handleVolumeChange(sound.id, Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-400 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                   />
                </div>
              ))}
              
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                 <p className="text-[10px] text-zinc-500">Pro Tip: Ambience sounds play in background even when music is paused.</p>
              </div>
           </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="px-5 pb-5 pt-3 bg-black/20 backdrop-blur-md border-t border-white/5 rounded-b-[2rem] flex flex-col gap-3">
         {/* Progress */}
         <div className="w-full flex flex-col gap-1.5 group">
            <input type="range" min="0" max={currentSong?.durationSec || 100} value={currentTime} onChange={(e) => setCurrentTime(Number(e.target.value))} className="w-full h-1 bg-zinc-700/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 group-hover:[&::-webkit-slider-thumb]:w-2.5 group-hover:[&::-webkit-slider-thumb]:h-2.5 transition-all" style={{background: `linear-gradient(to right, #22c55e ${(currentTime / (currentSong?.durationSec || 1)) * 100}%, rgba(82, 82, 91, 0.3) 0%)`}} />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>{Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2,'0')}</span>
                <span>{currentSong?.duration || "0:00"}</span>
            </div>
         </div>

         {/* Buttons */}
         <div className="flex items-center justify-between">
            <div className="flex gap-1">
                <button onClick={() => setIsShuffle(!isShuffle)} className={`p-2 rounded-lg transition-colors ${isShuffle ? 'text-green-400 bg-green-500/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <Shuffle size={14} />
                </button>
                <button onClick={() => setIsRepeat(!isRepeat)} className={`p-2 rounded-lg transition-colors ${isRepeat ? 'text-green-400 bg-green-500/10' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    <Repeat size={14} />
                </button>
            </div>

            <div className="flex items-center gap-3">
               <button onClick={handlePrev} className="text-zinc-400 hover:text-white"><SkipBack size={18} fill="currentColor" /></button>
               <button onClick={() => setIsPlaying(!isPlaying)} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 hover:bg-zinc-200 transition-all shadow-lg">
                 {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
               </button>
               <button onClick={handleNext} className="text-zinc-400 hover:text-white"><SkipForward size={18} fill="currentColor" /></button>
            </div>

            <div className="w-[60px]"></div>
         </div>
      </div>
    </div>
  );
};

export default SoundMixer;