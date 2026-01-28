import { useState } from 'react';
import { Timer, CheckSquare, StickyNote, Image as ImageIcon, Volume2, Calendar as CalIcon } from 'lucide-react';
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

const INITIAL_BOARDS: Board[] = [
  {
    id: 'default',
    title: 'Main Focus',
    isDefault: true,
    columns: [
      { id: 'todo', title: 'To Do', color: 'bg-zinc-500' },
      { id: 'inprogress', title: 'Deep Work', color: 'bg-blue-500' },
      { id: 'waiting', title: 'Blocked', color: 'bg-orange-500' },
      { id: 'done', title: 'Done', color: 'bg-green-500' },
    ]
  }
];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Complete UI Design', status: 'inprogress', boardId: 'default', dueDate: new Date().toISOString().split('T')[0], color: '#3b82f6', createdAt: new Date().toISOString() },
];

function App() {
  const [panels, setPanels] = useState({ wallpaper: false, mixer: false, tasks: false, calendar: false, notes: false });
  
  const [bgState, setBgState] = useState<{ url: string; type: 'image' | 'video' }>({
      url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop",
      type: 'image'
  });

  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLock = () => setUser(null);

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

  const handleAddTask = (newTask: Omit<Task, 'id'>) => setTasks([...tasks, { ...newTask, id: Date.now().toString() }]);
  const handleUpdateTask = (id: string, updates: Partial<Task>) => setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  const handleDeleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  
  const handleAddBoard = (title: string) => { setBoards([...boards, { id: Date.now().toString(), title, isDefault: false, columns: [] }]); };
  const handleUpdateBoard = (boardId: string, updates: Partial<Board>) => setBoards(boards.map(b => b.id === boardId ? { ...b, ...updates } : b));
  const handleDeleteBoard = (id: string) => { setBoards(boards.filter(b => b.id !== id)); setTasks(tasks.filter(t => t.boardId !== id)); };

  const navItems = [
    { id: 'wallpaper', icon: ImageIcon, label: 'Backgrounds' },
    { id: 'mixer', icon: Volume2, label: 'Soundscapes' },
    { id: 'tasks', icon: CheckSquare, label: 'Task Board' },
    { id: 'calendar', icon: CalIcon, label: 'Calendar' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none text-zinc-100 bg-black">
      {!user && <AuthOverlay onLogin={setUser} />}

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
        onUpdateUser={setUser} 
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