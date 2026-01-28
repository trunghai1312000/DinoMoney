import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, Timer, Watch, Bell, Volume2 } from 'lucide-react';

interface FocusTimerProps {
  isMinimized: boolean;
  onToggleMinimize: (minimized: boolean) => void;
}

const FocusTimer = ({ isMinimized, onToggleMinimize }: FocusTimerProps) => {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false); // Trạng thái hết giờ

  // Sound ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request Notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
    // Preload sound
    audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
  }, []);

  useEffect(() => {
    let interval: number | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (mode === 'timer') {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // HẾT GIỜ
              handleTimeUp();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchTime((prev) => prev + 1);
        }
      }, 1000);
    } else if (interval) clearInterval(interval);

    return () => { if (interval) clearInterval(interval); };
  }, [isActive, mode]);

  const handleTimeUp = () => {
      setIsActive(false);
      setIsTimeUp(true);
      
      // Play Sound
      if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }

      // Show Notification
      if (Notification.permission === "granted") {
          new Notification("Hết giờ!", {
              body: "Bạn đã hoàn thành phiên tập trung!",
              icon: "/vite.svg" 
          });
      }
  };

  const toggleTimer = () => {
      if (isTimeUp) setIsTimeUp(false); // Reset trạng thái time up khi bấm lại
      setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsTimeUp(false);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    mode === 'timer' ? setTimeLeft(25 * 60) : setStopwatchTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const displayTime = mode === 'timer' ? formatTime(timeLeft) : formatTime(stopwatchTime);

  return (
    <div className="relative w-full h-full flex justify-center pointer-events-none">
      
      {/* FULL CENTER */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       w-[400px] h-[400px] flex flex-col items-center justify-center p-8 rounded-[3rem] 
                       transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                       bg-transparent backdrop-blur-sm pointer-events-auto
                       ${isMinimized ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100 z-50'}`}
      >
        <button 
          onClick={() => onToggleMinimize(true)}
          className="absolute top-6 right-6 p-2 rounded-full text-zinc-600 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronUp size={20} />
        </button>

        {/* Mode Switcher */}
        <div className="flex p-1 rounded-xl bg-black/10 hover:bg-black/20 transition-colors mb-10 border border-white/5">
          <button onClick={() => { setMode('timer'); setIsActive(false); setIsTimeUp(false); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mode === 'timer' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>Timer</button>
          <button onClick={() => { setMode('stopwatch'); setIsActive(false); setIsTimeUp(false); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mode === 'stopwatch' ? 'bg-blue-500 text-black shadow-lg shadow-blue-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>Stopwatch</button>
        </div>

        {/* TIME DISPLAY */}
        <div className="relative mb-12 group cursor-default">
          {/* Glow Effect */}
          <div className={`absolute inset-0 blur-3xl opacity-20 rounded-full transition-all duration-1000 
                ${isActive ? (mode === 'timer' ? 'bg-green-500 scale-125' : 'bg-blue-500 scale-125') : 
                  (isTimeUp ? 'bg-red-500 scale-150 opacity-50 animate-pulse' : 'bg-transparent scale-100')}`}>
          </div>
          
          <div className={`relative text-8xl font-thin font-mono tracking-tighter tabular-nums select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-colors duration-300 ${isTimeUp ? 'text-red-400 animate-bounce' : 'text-white'}`}>
            {displayTime}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-6">
          <button onClick={toggleTimer} className={`w-18 h-18 p-5 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-xl ${isActive ? 'bg-zinc-800/80 text-zinc-400 border border-white/5' : (isTimeUp ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-black hover:bg-zinc-200 hover:scale-105')}`}>
             {isActive ? <Pause size={32} fill="currentColor" /> : (isTimeUp ? <Bell size={32} /> : <Play size={32} fill="currentColor" className="ml-1" />)}
          </button>
          
          <button onClick={resetTimer} className="w-18 h-18 p-5 rounded-2xl flex items-center justify-center bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 backdrop-blur-md border border-white/5">
             <RotateCcw size={28} />
          </button>
        </div>

        {/* STATUS TEXT */}
        <div className={`absolute bottom-10 text-xs font-medium uppercase tracking-[0.4em] transition-colors duration-500 
          ${isActive 
            ? (mode === 'timer' 
                ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]' 
                : 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]') 
            : (isTimeUp ? 'text-red-500 font-bold animate-pulse' : 'text-zinc-600')}`}
        >
          {isActive ? (mode === 'timer' ? 'Focusing...' : 'Counting...') : (isTimeUp ? 'Time is Up!' : 'Ready')}
        </div>
      </div>

      {/* MINIMIZED PILL */}
      <div className={`absolute top-0 pointer-events-auto
                       flex items-center gap-4 px-6 py-2 rounded-full 
                       bg-black/40 backdrop-blur-2xl border border-white/10 shadow-xl hover:bg-black/50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                       ${isMinimized ? 'opacity-100 translate-y-6 z-20' : 'opacity-0 -translate-y-full pointer-events-none'}`}
      >
        {isTimeUp ? <Bell size={14} className="text-red-500 animate-pulse" /> : (mode === 'timer' ? <Timer size={14} className="text-green-400" /> : <Watch size={14} className="text-blue-400" />)}
        
        <span className={`text-xl font-mono font-medium tracking-widest tabular-nums ${isTimeUp ? 'text-red-400 animate-pulse' : 'text-white'}`}>{displayTime}</span>
        
        <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
        <button onClick={toggleTimer} className="text-zinc-400 hover:text-white">{isActive ? <Pause size={14} /> : <Play size={14} />}</button>
        <button onClick={() => onToggleMinimize(false)} className="ml-2 p-1 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"><ChevronDown size={16} /></button>
      </div>

    </div>
  );
};

export default FocusTimer;