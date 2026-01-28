import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Sun, Moon, Sunset, CalendarDays } from 'lucide-react';

interface MiniDatePickerProps {
  selectedDate?: string; 
  onSelect: (date: string) => void;
  onClose: () => void;
  includeTime?: boolean;
  className?: string;
}

const MiniDatePicker = ({ selectedDate, onSelect, onClose, includeTime = false, className }: MiniDatePickerProps) => {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewDate, setViewDate] = useState(initialDate);
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  
  const [time, setTime] = useState(() => {
    if (selectedDate && selectedDate.includes('T')) {
      return selectedDate.split('T')[1].slice(0, 5); 
    }
    return "09:00";
  });

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const getDateStr = (day: number) => {
      return `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleSelectDay = (day: number) => {
    if (!includeTime) {
        onSelect(getDateStr(day));
        onClose();
    } else {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
    }
  };

  const confirmWithTime = (timeStr?: string) => {
      const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(viewDate.getDate()).padStart(2, '0')}`;
      if (timeStr) {
          onSelect(`${dateStr}T${timeStr}`);
      } else {
          onSelect(dateStr); // All day
      }
      onClose();
  };

  return (
    <div className={`mt-2 z-50 bg-[#1f1f22] border border-white/10 rounded-xl p-3 shadow-2xl w-[280px] animate-in fade-in zoom-in-95 ring-1 ring-black/50 font-sans flex flex-col gap-3 ${className || 'absolute top-full left-0'}`}>
      
      {/* 1. PRESET BUTTONS */}
      {includeTime && (
          <div className="grid grid-cols-2 gap-2">
              <button onClick={() => confirmWithTime("09:00")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 transition-colors">
                  <Sun size={14} className="text-orange-400" /> Sáng <span className="text-zinc-500 ml-auto">9:00</span>
              </button>
              <button onClick={() => confirmWithTime("14:00")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 transition-colors">
                  <Sun size={14} className="text-yellow-500" /> Chiều <span className="text-zinc-500 ml-auto">14:00</span>
              </button>
              <button onClick={() => confirmWithTime("17:00")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 transition-colors">
                  <Sunset size={14} className="text-purple-400" /> Tối <span className="text-zinc-500 ml-auto">17:00</span>
              </button>
               <button onClick={() => confirmWithTime(undefined)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 transition-colors">
                  <CalendarDays size={14} className="text-blue-400" /> Cả ngày
              </button>
          </div>
      )}

      <div className="h-[1px] bg-white/5 w-full"></div>

      {/* 2. CALENDAR NAV */}
      <div className="flex justify-between items-center px-1">
        <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-white/10 rounded-full text-zinc-400">
            <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-zinc-200">
            Tháng {viewDate.getMonth() + 1}, {viewDate.getFullYear()}
        </span>
        <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-white/10 rounded-full text-zinc-400">
            <ChevronRight size={16} />
        </button>
      </div>

      {/* 3. CALENDAR GRID */}
      <div>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                <div key={d} className="text-[10px] text-zinc-500 font-bold">{d}</div>
            ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const currentMonthStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate ? selectedDate.startsWith(currentMonthStr) : false;
                const isToday = new Date().toISOString().split('T')[0] === currentMonthStr;
                const isViewing = viewDate.getDate() === day;

                return (
                    <button 
                        key={day} 
                        onClick={() => {
                            if (includeTime) setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
                            else handleSelectDay(day);
                        }} 
                        className={`h-7 w-7 rounded-md text-xs flex items-center justify-center transition-all ${
                            (includeTime && isViewing) || (!includeTime && isSelected)
                                ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20' 
                                : isToday 
                                    ? 'text-blue-400 font-bold bg-blue-500/10' 
                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        {day}
                    </button>
                )
            })}
        </div>
      </div>

      {/* 4. CUSTOM TIME */}
      {includeTime && (
          <div className="pt-2 border-t border-white/5">
              {mode === 'presets' ? (
                  <button onClick={() => setMode('custom')} className="w-full text-xs text-zinc-500 hover:text-white flex items-center justify-center gap-1 py-1">
                      <Clock size={12} /> Chọn giờ khác...
                  </button>
              ) : (
                  <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-lg border border-white/10 animate-in slide-in-from-top-1">
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-transparent text-xs text-white outline-none flex-1 font-mono text-center"/>
                      <button onClick={() => confirmWithTime(time)} className="text-[10px] bg-blue-600 px-2 py-1 rounded text-white font-bold">Lưu</button>
                  </div>
              )}
          </div>
      )}
      
      {!className && <div className="fixed inset-0 z-[-1]" onClick={onClose}></div>}
    </div>
  );
};

export default MiniDatePicker;