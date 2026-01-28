import { useState, useEffect } from 'react';
import { Timer, CheckSquare, StickyNote, Image as ImageIcon, Volume2, Calendar as CalIcon, Loader2, AlertCircle } from 'lucide-react';
import { DinoLogo } from './components/DinoIcon';
import SoundMixer from './components/SoundMixer';
import WallpaperSelector from './components/WallpaperSelector';
import FocusTimer from './components/FocusTimer';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import StickyNotes from './components/StickyNotes';
import AuthOverlay from './components/AuthOverlay'; 
import TopBar from './components/TopBar'; 
import { Task, Board, UserProfile } from './types';
import * as db from './services/db'; 

const DEFAULT_BOARD: Board = {
  id: 'default',
  title: 'Main Focus',
  isDefault: true,
  columns: [
    { id: 'todo', title: 'To Do', color: 'bg-zinc-500' },
    { id: 'inprogress', title: 'Deep Work', color: 'bg-blue-500' },
    { id: 'waiting', title: 'Blocked', color: 'bg-orange-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' },
  ]
};

function App() {
  const [panels, setPanels] = useState({ wallpaper: false, mixer: false, tasks: false, calendar: false, notes: false });
  const [bgState, setBgState] = useState<{ url: string; type: 'image' | 'video' }>({
      url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop",
      type: 'image'
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [boards, setBoards] = useState<Board[]>([DEFAULT_BOARD]);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // --- INIT DATABASE & LOAD DATA ---
  useEffect(() => {
    const initApp = async () => {
      try {
        const success = await db.initDB();
        if (!success) {
            setDbError("Không thể kết nối Database. Vui lòng kiểm tra quyền truy cập.");
            return;
        }
        
        const loadedUser = await db.getUser();
        if (loadedUser) {
            setUser(loadedUser);
            // Load Tasks & Boards
            const loadedBoards = await db.getBoards();
            if (loadedBoards.length > 0) setBoards(loadedBoards);
            else {
                await db.saveBoard(DEFAULT_BOARD);
                setBoards([DEFAULT_BOARD]);
            }

            const loadedTasks = await db.getTasks();
            setTasks(loadedTasks);
        }
      } catch (e: any) {
          console.error("Init Error:", e);
          setDbError(e.message || "Lỗi khởi tạo không xác định");
      } finally {
          setIsLoading(false); // QUAN TRỌNG: Luôn tắt loading
      }
    };
    initApp();
  }, []);

  // --- HANDLERS (Connect to DB) ---
  const handleUpdateUser = async (updatedUser: UserProfile) => {
      setUser(updatedUser);
      await db.saveUser(updatedUser);
  };

  const handleLogin = async (u: UserProfile) => {
      setUser(u);
      await db.saveUser(u);
      const currentBoards = await db.getBoards();
      if(currentBoards.length === 0) {
          await db.saveBoard(DEFAULT_BOARD);
          setBoards([DEFAULT_BOARD]);
      }
  };

  const handleLock = () => setUser(null);

  const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
      const task: Task = { ...newTask, id: crypto.randomUUID() };
      setTasks(prev => [...prev, task]);
      await db.saveTask(task);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
      setTasks(prev => {
          const updatedTasks = prev.map(t => t.id === id ? { ...t, ...updates } : t);
          const task = updatedTasks.find(t => t.id === id);
          if (task) db.saveTask(task); // Save to DB
          return updatedTasks;
      });
  };

  const handleDeleteTask = async (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
      await db.deleteTask(id);
  };

  const handleAddBoard = async (title: string) => {
      const newBoard: Board = { id: crypto.randomUUID(), title, isDefault: false, columns: [] };
      setBoards(prev => [...prev, newBoard]);
      await db.saveBoard(newBoard);
  };

  const handleUpdateBoard = async (boardId: string, updates: Partial<Board>) => {
      setBoards(prev => {
        const updatedBoards = prev.map(b => b.id === boardId ? { ...b, ...updates } : b);
        const board = updatedBoards.find(b => b.id === boardId);
        if(board) db.saveBoard(board);
        return updatedBoards;
      });
  };

  const handleDeleteBoard = async (id: string) => {
      setBoards(prev => prev.filter(b => b.id !== id));
      setTasks(prev => prev.filter(t => t.boardId !== id));
      await db.deleteBoard(id);
  };

  const togglePanel = (key: keyof typeof panels) => {
    setPanels(prev => {
      const isOpening = !prev[key];
      const newState = { ...prev, [key]: isOpening };
      if (isOpening) {
        if (key === 'tasks' || key === 'calendar' || key === 'wallpaper' || key === 'mixer') {
             if (key === 'tasks' || key === 'calendar') setIsTimerMinimized(true);
             if (key === 'tasks') newState.calendar = false;
             if (key === 'calendar') newState.tasks = false;
             if (key === 'wallpaper' || key === 'mixer') { newState.tasks = false; newState.calendar = false; }
             newState.notes = false;
             if (key === 'tasks' || key === 'calendar') { newState.wallpaper = false; newState.mixer = false; }
        }
      }
      return newState;
    });
  };

  const handleToggleTimerMinimize = (minimized: boolean) => {
      setIsTimerMinimized(minimized);
      if (!minimized) setPanels(prev => ({ ...prev, tasks: false, calendar: false }));
  };

  const navItems = [
    { id: 'wallpaper', icon: ImageIcon, label: 'Backgrounds' },
    { id: 'mixer', icon: Volume2, label: 'Soundscapes' },
    { id: 'tasks', icon: CheckSquare, label: 'Task Board' },
    { id: 'calendar', icon: CalIcon, label: 'Calendar' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
  ];

  // Loading Screen
  if (isLoading) {
      return (
          <div className="w-screen h-screen bg-[#0f0f11] flex flex-col items-center justify-center text-green-500 gap-4">
              <Loader2 size={40} className="animate-spin" />
              <p className="text-xs font-mono text-zinc-500 animate-pulse">Initializing Local Database...</p>
          </div>
      );
  }

  // Error Screen
  if (dbError) {
      return (
          <div className="w-screen h-screen bg-[#0f0f11] flex flex-col items-center justify-center text-red-500 gap-4 p-8 text-center">
              <AlertCircle size={48} />
              <h2 className="text-xl font-bold">Lỗi Hệ Thống</h2>
              <p className="text-zinc-400 text-sm max-w-md">{dbError}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/10 rounded hover:bg-white/20 text-white text-sm">Thử lại</button>
          </div>
      );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none text-zinc-100 bg-black">
      {!user && <AuthOverlay onLogin={handleLogin} />}

      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          {bgState.type === 'image' ? (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out" 
                style={{ backgroundImage: `url('${bgState.url}')`, opacity: 0.7 }} 
              />
          ) : (
              <video 
                key={bgState.url}
                src={bgState.url} 
                autoPlay loop muted playsInline 
                className="absolute inset-0 w-full h-full object-cover opacity-70 transition-opacity duration-700"
              />
          )}
          <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <TopBar 
        user={user} 
        tasks={tasks} 
        onUpdateUser={handleUpdateUser} 
        onLock={handleLock} 
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <nav 
        className={`absolute left-6 top-1/2 -translate-y-1/2 w-[64px] py-6 rounded-2xl z-50 flex flex-col items-center gap-6 bg-black/20 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[200%] opacity-0 pointer-events-none'}
        `}
      >
        <div className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)] hover:scale-110 transition-transform cursor-pointer">
            <DinoLogo size={28} />
        </div>
        
        <div className="flex flex-col gap-4 w-full px-2">
          <button onClick={() => { setPanels({ wallpaper: false, mixer: false, tasks: false, calendar: false, notes: false }); setIsTimerMinimized(false); }} className="group relative flex items-center justify-center w-full">
               <div className="absolute -left-1 w-1 h-1 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,1)]"></div>
               <div className="p-3 rounded-xl bg-white/10 text-white shadow-inner border border-white/5"><Timer size={20} /></div>
          </button>
          <div className="h-[1px] w-8 bg-white/10 mx-auto"></div>
          {navItems.map((item) => {
            const isActive = panels[item.id as keyof typeof panels];
            return (
              <button key={item.id} onClick={() => togglePanel(item.id as keyof typeof panels)} className="group relative flex items-center justify-center w-full">
                {isActive && (<div className="absolute -left-1 w-1 h-1 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,1)]"></div>)}
                <div className={`p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}`}>
                  <item.icon size={20} strokeWidth={1.5} />
                </div>
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/60 backdrop-blur-md text-xs text-white rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">{item.label}</div>
              </button>
            )
          })}
        </div>
      </nav>

      <main className="relative w-full h-full z-10 pointer-events-none">
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500 relative">
                 <FocusTimer isMinimized={isTimerMinimized} onToggleMinimize={handleToggleTimerMinimize} />
             </div>
         </div>

         <StickyNotes isOpen={panels.notes} onClose={() => togglePanel('notes')} />

         {panels.wallpaper && (
             <div className="absolute left-32 top-1/2 -translate-y-1/2 animate-in fade-in slide-in-from-left-8 duration-500 pointer-events-auto z-20">
                <div className="w-[340px] h-[550px] rounded-[2rem] overflow-hidden border border-white/10 bg-black/30 backdrop-blur-2xl shadow-2xl shadow-black/80 ring-1 ring-white/5">
                   <WallpaperSelector 
                        currentBg={bgState.url} 
                        onSelect={(url, type) => setBgState({ url, type })} 
                        onClose={() => togglePanel('wallpaper')} 
                   />
                </div>
             </div>
         )}
         
         {panels.tasks && (
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-500 pointer-events-auto z-40">
                <div className="w-[90vw] max-w-[1400px] h-[85vh] rounded-[2rem] overflow-hidden border border-white/10 bg-black/75 backdrop-blur-xl shadow-2xl shadow-black/90 ring-1 ring-white/5">
                   <KanbanBoard tasks={tasks} boards={boards} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onAddBoard={handleAddBoard} onDeleteBoard={handleDeleteBoard} onUpdateBoard={handleUpdateBoard} onClose={() => togglePanel('tasks')} />
                </div>
             </div>
         )}
         
         {panels.mixer && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 animate-in fade-in slide-in-from-right-8 duration-500 pointer-events-auto z-20">
               <div className="w-[380px] h-[600px] rounded-[2rem] overflow-hidden border border-white/10 bg-black/30 backdrop-blur-2xl shadow-2xl shadow-black/80 ring-1 ring-white/5">
                  <SoundMixer onClose={() => togglePanel('mixer')} />
               </div>
            </div>
         )}
         
         {panels.calendar && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-500 pointer-events-auto z-40">
               <div className="w-[70vw] max-w-[1000px] h-[80vh] rounded-[2rem] overflow-hidden border border-white/10 bg-black/75 backdrop-blur-xl shadow-2xl shadow-black/90 ring-1 ring-white/5">
                  <CalendarView tasks={tasks} boards={boards} onClose={() => togglePanel('calendar')} />
               </div>
            </div>
         )}
      </main>
    </div>
  );
}

export default App;