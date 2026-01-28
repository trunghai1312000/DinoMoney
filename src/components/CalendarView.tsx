import { useState } from 'react';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Task, Board } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  boards: Board[];
  onClose: () => void;
}

const CalendarView = ({ tasks, boards, onClose }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const getTasksForDay = (day: number) => {
    const currentDayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayTasks = tasks.filter(t => {
      const startIso = t.startDate || t.createdAt || new Date().toISOString();
      const endIso = t.dueDate;
      if (!endIso) return false; 
      try {
        const startDayStr = startIso.split('T')[0];
        const endDayStr = endIso.split('T')[0];
        return currentDayStr >= startDayStr && currentDayStr <= endDayStr;
      } catch { return false; }
    });

    return dayTasks.sort((a, b) => a.id.localeCompare(b.id));
  };

  // FIX: Logic kiểm tra hoàn thành an toàn hơn
  const isTaskDone = (task: Task) => {
      const board = boards.find(b => b.id === task.boardId);
      if (!board) return false;
      
      // Nếu task có status cụ thể là 'done' -> Done
      if (task.status === 'done') return true;

      // Nếu Board chỉ có 1 cột -> Chưa Done (vì không có cột nào để chuyển tới)
      if (board.columns.length <= 1) return false;

      // Nếu Board > 1 cột -> Cột cuối cùng là Done
      const lastColId = board.columns[board.columns.length - 1].id;
      return task.status === lastColId;
  };

  const getTaskStyle = (task: Task, currentDay: number) => {
      try {
        const currentDayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
        const startDayStr = (task.startDate || task.createdAt || '').split('T')[0];
        const endDayStr = task.dueDate?.split('T')[0] || '';

        const isStart = currentDayStr === startDayStr;
        const isEnd = currentDayStr === endDayStr;
        const isDone = isTaskDone(task);

        // FIX: Thêm z-index và negative margins để nối liền
        let classes = "text-[10px] truncate px-2 py-0.5 text-white shadow-sm relative h-5 mb-0.5 z-10 ";
        
        if (isStart && isEnd) classes += "rounded mx-1 ";
        else if (isStart) classes += "rounded-l rounded-r-none ml-1 -mr-[1px] "; // Nối sang phải
        else if (isEnd) classes += "rounded-r rounded-l-none mr-1 -ml-[1px] ";   // Nối sang trái
        else classes += "rounded-none -mx-[1px] "; // Vuông góc, nối cả 2 bên

        if (isDone) classes += "opacity-50 grayscale decoration-zinc-400 line-through ";

        return classes;
      } catch {
          return "rounded text-[10px] px-2 py-0.5";
      }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-zinc-100 font-sans relative">
      <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-lg font-light tracking-wide flex items-center gap-2 text-white">
          <CalIcon size={18} className="text-orange-400" /> Lịch Công Việc
        </h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
         <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-white/10 rounded-full text-zinc-400"><ChevronLeft size={20} /></button>
         <span className="text-lg font-medium">{monthNames[currentDate.getMonth()]} <span className="text-zinc-500 font-light">{currentDate.getFullYear()}</span></span>
         <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-white/10 rounded-full text-zinc-400"><ChevronRight size={20} /></button>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto scrollbar-hide">
         <div className="grid grid-cols-7 mb-2">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-zinc-600 uppercase py-2">{d}</div>
            ))}
         </div>

         <div className="grid grid-cols-7 gap-0 border border-white/5 rounded-2xl overflow-hidden auto-rows-fr bg-white/5">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] bg-black/20 border-r border-b border-white/5 last:border-r-0" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayTasks = getTasksForDay(day);
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                const dayOfWeek = date.getDay(); 

                return (
                    <div key={day} className={`relative pt-8 pb-1 flex flex-col items-start min-h-[100px] hover:bg-white/5 transition-colors border-r border-b border-white/5 ${isToday ? 'bg-orange-500/5' : ''}`}>
                        <span className={`absolute top-2 left-2 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-orange-500 text-white' : 'text-zinc-500'}`}>{day}</span>
                        
                        <div className="w-full flex flex-col w-full">
                            {dayTasks.map(task => {
                                const startDayStr = (task.startDate || task.createdAt || '').split('T')[0];
                                const currentDayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const showLabel = startDayStr === currentDayStr || dayOfWeek === 0;

                                return (
                                    <div key={task.id} 
                                         className={getTaskStyle(task, day)}
                                         style={{ backgroundColor: task.color || '#71717a' }}
                                         title={`${task.title} - ${isTaskDone(task) ? 'Đã xong' : 'Đang làm'}`}
                                    >
                                        {showLabel ? (
                                            <span className="truncate block w-full font-medium">{task.title}</span>
                                        ) : (
                                            <span className="invisible">&nbsp;</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
         </div>
      </div>
    </div>
  );
};

export default CalendarView;