import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, CloudRain, Wind, Trees, ListMusic, Waves, Repeat, Repeat1, Shuffle, Plus, Trash2, X, Volume1 } from 'lucide-react';
import * as db from '../services/db';

// IMPORT ASSETS
// @ts-ignore
import rain from '../assets/rain.m4a';
// @ts-ignore
import wind from '../assets/wind.mp3';
// @ts-ignore
import forest from '../assets/forest.mp3';
// @ts-ignore
import sea from '../assets/beach.mp3';

const AMBIENCE_URLS: { [key: string]: string } = {
  rain: rain,
  wind: wind,
  forest: forest, 
  sea: sea
};

// Định nghĩa kiểu dữ liệu bài hát
type Song = {
  id: string; 
  title: string;
  artist: string;
  duration: string;
  durationSec: number;
  url?: string;
};

const SoundMixer = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'playlist' | 'ambience'>('playlist');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // --- STATE PLAYLIST ---
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  
  // Controls States
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeatOne, setIsRepeatOne] = useState(false); // True = Lặp 1 bài, False = Phát theo list
  
  const [currentTime, setCurrentTime] = useState(0);
  const [masterVolume, setMasterVolume] = useState(100);

  // --- STATE AMBIENCE ---
  const [ambientSounds, setAmbientSounds] = useState([
    { id: 'rain', label: 'Rain Storm', icon: CloudRain, volume: 0, active: false },
    { id: 'wind', label: 'Windy Hill', icon: Wind, volume: 0, active: false },
    { id: 'forest', label: 'Night Forest', icon: Trees, volume: 0, active: false },
    { id: 'sea',  label: 'Ocean Waves',  icon: Waves, volume: 0,  active: false },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const playlistAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambienceAudioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // 1. Load Data
  useEffect(() => {
      const loadData = async () => {
          // Load Songs
          const dbSongs = await db.getSongs();
          if (dbSongs && dbSongs.length > 0) {
              // @ts-ignore
              setPlaylist(dbSongs);
          }

          // Load Ambience Settings
          const savedAmbience = await db.getAppSetting('ambience_state');
          if (savedAmbience) {
              try {
                const parsed = JSON.parse(savedAmbience);
                setAmbientSounds(prev => prev.map(s => {
                    const saved = parsed[s.id];
                    return saved ? { ...s, volume: saved.volume, active: saved.active } : s;
                }));
              } catch (e) {}
          }
      };
      loadData();
  }, []);

  // 2. Logic Ambience Player
  useEffect(() => {
      ambientSounds.forEach(sound => {
          if (!ambienceAudioRefs.current[sound.id] && AMBIENCE_URLS[sound.id]) {
              const audio = new Audio(AMBIENCE_URLS[sound.id]);
              audio.loop = true;
              ambienceAudioRefs.current[sound.id] = audio;
          }

          const audio = ambienceAudioRefs.current[sound.id];
          if (audio) {
              if (sound.active && sound.volume > 0) {
                  audio.volume = sound.volume / 100;
                  if (audio.paused) audio.play().catch(() => {});
              } else {
                  audio.pause();
              }
          }
      });
  }, [ambientSounds]);

  // Auto-save Ambience
  useEffect(() => {
      const timer = setTimeout(() => {
          const stateToSave = ambientSounds.reduce((acc: any, s) => {
              acc[s.id] = { volume: s.volume, active: s.active };
              return acc;
          }, {});
          db.saveAppSetting('ambience_state', JSON.stringify(stateToSave));
      }, 500);
      return () => clearTimeout(timer);
  }, [ambientSounds]);


  // 3. Logic Playlist Player & Controls
  const currentSong = playlist[currentSongIndex];

  // Initialize Audio
  useEffect(() => {
      if (!playlistAudioRef.current) {
          playlistAudioRef.current = new Audio();
          playlistAudioRef.current.ontimeupdate = () => {
              if (playlistAudioRef.current) {
                  setCurrentTime(playlistAudioRef.current.currentTime);
              }
          };
      }
  }, []);

  // Update Volume
  useEffect(() => {
      if (playlistAudioRef.current) {
          playlistAudioRef.current.volume = masterVolume / 100;
      }
  }, [masterVolume]);

  // Handle Song Change
  useEffect(() => {
      const audio = playlistAudioRef.current;
      if (!audio || !currentSong) {
          if (audio) { audio.pause(); audio.src = ""; }
          return;
      }

      const songSrc = currentSong.url || "";
      
      // Load bài mới nếu src khác
      if (songSrc && audio.src !== songSrc) {
          audio.src = songSrc;
          audio.load();
      }

      // Sync Play State
      if (songSrc) {
          if (isPlaying) {
            audio.play().catch(() => {});
          } else {
            audio.pause();
          }
      } else {
          audio.pause(); 
      }
  }, [currentSongIndex, playlist, isPlaying]);


  // --- PLAYER CONTROLS LOGIC (MUTUAL EXCLUSION UPDATE) ---
  
  // Hàm bật/tắt Shuffle (Nếu bật Shuffle -> Tắt Repeat One)
  const toggleShuffle = () => {
      const newState = !isShuffle;
      setIsShuffle(newState);
      if (newState) {
          setIsRepeatOne(false);
      }
  };

  // Hàm bật/tắt Repeat One (Nếu bật Repeat One -> Tắt Shuffle)
  const toggleRepeat = () => {
      const newState = !isRepeatOne;
      setIsRepeatOne(newState);
      if (newState) {
          setIsShuffle(false);
      }
  };
  
  // Xử lý Next bài (Logic cốt lõi)
  const handleNext = useCallback(() => {
    if (playlist.length === 0) return;

    // Chế độ 1: Repeat One (Lặp lại 1 bài)
    if (isRepeatOne) {
        if (playlistAudioRef.current) {
            playlistAudioRef.current.currentTime = 0;
            if(isPlaying) playlistAudioRef.current.play();
        }
        setCurrentTime(0);
        return;
    }

    // Chế độ 2: Shuffle (Phát lộn xộn)
    if (isShuffle) {
        let nextIndex;
        // Random bài khác bài hiện tại (nếu có > 1 bài)
        do { nextIndex = Math.floor(Math.random() * playlist.length); } 
        while (nextIndex === currentSongIndex && playlist.length > 1);
        setCurrentSongIndex(nextIndex);
    } 
    // Chế độ 3: Sequential (Phát theo danh sách - Mặc định)
    else {
        // Hết danh sách thì quay lại bài đầu (Loop All)
        setCurrentSongIndex(prev => (prev < playlist.length - 1 ? prev + 1 : 0));
    }
  }, [playlist.length, isRepeatOne, isShuffle, currentSongIndex, isPlaying]);

  const handlePrev = useCallback(() => {
     if (playlist.length === 0) return;
     // Nếu đang phát dở bài (>3s) thì replay lại bài đó
     if (currentTime > 3) {
         if (playlistAudioRef.current) playlistAudioRef.current.currentTime = 0;
         return;
     }
     setCurrentSongIndex(prev => (prev > 0 ? prev - 1 : playlist.length - 1));
  }, [playlist.length, currentTime]);

  // Gắn sự kiện onEnded để tự động Next khi hết bài
  useEffect(() => {
      if (playlistAudioRef.current) {
          playlistAudioRef.current.onended = handleNext;
      }
  }, [handleNext]);

  // Timer giả lập (cho bài không có file thật)
  useEffect(() => {
      let interval: any;
      if (currentSong && !currentSong.url && isPlaying && currentTime < currentSong.durationSec) {
          interval = setInterval(() => {
              setCurrentTime(prev => {
                  if (prev >= currentSong.durationSec) {
                      handleNext();
                      return 0;
                  }
                  return prev + 1;
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isPlaying, currentSong, currentTime, handleNext]);

  // --- UPLOAD HANDLERS ---
  const handleAddTrackClick = () => fileInputRef.current?.click();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          const tempAudio = new Audio(base64Data);
          tempAudio.onloadedmetadata = async () => {
              const duration = tempAudio.duration || 180;
              const mins = Math.floor(duration / 60);
              const secs = Math.floor(duration % 60);
              const newSong: Song = {
                  id: crypto.randomUUID(),
                  title: file.name.replace(/\.[^/.]+$/, ""),
                  artist: "User Upload",
                  duration: `${mins}:${secs.toString().padStart(2, '0')}`,
                  durationSec: Math.floor(duration),
                  url: base64Data
              };
              setPlaylist(prev => [...prev, newSong]);
              await db.saveSong(newSong);
          };
      };
      reader.readAsDataURL(file);
      event.target.value = '';
  };

  const handleDeleteSong = async (e: React.MouseEvent, id: string | number) => {
      e.stopPropagation();
      if (!window.confirm("Xóa bài hát này?")) return;
      const idStr = String(id);
      setPlaylist(prev => prev.filter(s => s.id !== idStr));
      if (currentSong && String(currentSong.id) === idStr) {
          setCurrentSongIndex(0); setCurrentTime(0); setIsPlaying(false);
          if (playlistAudioRef.current) { playlistAudioRef.current.pause(); playlistAudioRef.current.src = ""; }
      }
      await db.deleteSong(idStr);
  };

  // --- AMBIENCE UI HANDLERS ---
  const toggleAmbient = (id: string) => setAmbientSounds(s => s.map(x => x.id === id ? { ...x, active: !x.active } : x));
  const handleVolAmbience = (id: string, v: number) => setAmbientSounds(s => s.map(x => x.id === id ? { ...x, volume: v, active: v > 0 } : x));

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-zinc-100 font-sans relative">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />

      {/* Header */}
      <div className="p-6 pb-2 border-b border-white/5 flex justify-between items-center">
        <div>
           <h2 className="text-lg font-light tracking-wide mb-1 flex items-center gap-2 text-white">
            <Volume2 size={18} className="text-green-400" /> Soundscapes
           </h2>
           <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Mix your focus environment</p>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
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
        
        {/* PLAYLIST TAB */}
        {activeTab === 'playlist' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
             {playlist.length === 0 ? (
                 <div className="text-center text-zinc-500 py-10 flex flex-col items-center gap-2">
                    <ListMusic size={32} className="opacity-20" />
                    <span className="text-xs">Chưa có bài hát nào. Upload để nghe nhé!</span>
                 </div>
             ) : (
                playlist.map((song, idx) => (
               <div key={song.id} onClick={() => setCurrentSongIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all backdrop-blur-sm ${currentSongIndex === idx ? 'bg-white/10 border border-white/10 shadow-lg' : 'hover:bg-white/5 border border-transparent'}`}>
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
                     <button onClick={(e) => handleDeleteSong(e, song.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded text-zinc-600 transition-all"><Trash2 size={12} /></button>
                 </div>
               </div>
             )))}
             <button onClick={handleAddTrackClick} className="w-full py-3 mt-4 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:text-green-400 hover:border-green-500/50 hover:bg-green-500/5 transition-all group">
                 <Plus size={16} /> <span className="text-xs uppercase tracking-wider font-bold">Add Track (Upload)</span>
             </button>
          </div>
        )}

        {/* AMBIENCE TAB */}
        {activeTab === 'ambience' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {ambientSounds.map((sound) => (
                <div key={sound.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 hover:bg-black/30 transition-colors">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                         <sound.icon size={16} className={sound.active ? 'text-green-400' : 'text-zinc-600'} />
                         <span className={`text-sm ${sound.active ? 'text-white' : 'text-zinc-500'}`}>{sound.label}</span>
                      </div>
                      <button onClick={() => toggleAmbient(sound.id)} className={`w-8 h-4 rounded-full relative transition-colors ${sound.active ? 'bg-green-500/80' : 'bg-zinc-700/50'}`}>
                         <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${sound.active ? 'left-4.5' : 'left-0.5'}`}></div>
                      </button>
                   </div>
                   <input type="range" min="0" max="100" value={sound.volume} disabled={!sound.active} onChange={(e) => handleVolAmbience(sound.id, Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-400 hover:[&::-webkit-slider-thumb]:bg-white transition-all" />
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
         <div className="w-full flex flex-col gap-1.5 group">
            <input type="range" min="0" max={currentSong?.durationSec || 100} value={currentTime} onChange={(e) => { setCurrentTime(Number(e.target.value)); if(playlistAudioRef.current) playlistAudioRef.current.currentTime = Number(e.target.value); }} className="w-full h-1 bg-zinc-700/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 group-hover:[&::-webkit-slider-thumb]:w-2.5 group-hover:[&::-webkit-slider-thumb]:h-2.5 transition-all" style={{background: `linear-gradient(to right, #22c55e ${(currentTime / (currentSong?.durationSec || 1)) * 100}%, rgba(82, 82, 91, 0.3) 0%)`}} />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>{Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2,'0')}</span>
                <span>{currentSong?.duration || "0:00"}</span>
            </div>
         </div>
         
         {/* CONTROLS */}
         <div className="flex items-center justify-between">
            {/* Left: Shuffle & Repeat One */}
            <div className="flex gap-1">
                {/* Nút Shuffle */}
                <button 
                    onClick={toggleShuffle} 
                    className={`p-2 rounded-lg transition-colors ${isShuffle ? 'text-green-400 bg-green-500/10' : 'text-zinc-600 hover:text-zinc-400'}`} 
                    title="Phát lộn xộn"
                >
                    <Shuffle size={14} />
                </button>
                
                {/* Nút Repeat (Chuyển chế độ) */}
                <button 
                    onClick={toggleRepeat} 
                    className={`p-2 rounded-lg transition-colors ${isRepeatOne ? 'text-green-400 bg-green-500/10' : 'text-zinc-600 hover:text-zinc-400'}`} 
                    title={isRepeatOne ? "Đang lặp lại 1 bài" : "Đang phát theo danh sách"}
                >
                    {isRepeatOne ? <Repeat1 size={14} /> : <Repeat size={14} />}
                </button>
            </div>
            
            {/* Center: Play/Pause */}
            <div className="flex items-center gap-3">
               <button onClick={handlePrev} className="text-zinc-400 hover:text-white"><SkipBack size={18} fill="currentColor" /></button>
               <button onClick={() => setIsPlaying(!isPlaying)} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 hover:bg-zinc-200 transition-all shadow-lg">
                 {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
               </button>
               <button onClick={handleNext} className="text-zinc-400 hover:text-white"><SkipForward size={18} fill="currentColor" /></button>
            </div>
            
            {/* Right: Volume Control */}
            <div className="flex items-center gap-2 w-[60px] justify-end group">
                <Volume1 size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                <input 
                    type="range" min="0" max="100" 
                    value={masterVolume} 
                    onChange={(e) => setMasterVolume(Number(e.target.value))}
                    className="w-10 h-1 bg-zinc-700/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-400 hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                />
            </div>
         </div>
      </div>
    </div>
  );
};

export default SoundMixer;