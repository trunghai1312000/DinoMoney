import { useState } from 'react';
import { Plus, Trash2, CheckSquare, Settings, X, Edit2, LayoutList, Kanban as KanbanIcon, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, Palette, CheckCircle2, AlertCircle } from 'lucide-react';
import { Task, Board, Subtask } from '../types';
import MiniDatePicker from './MiniDatePicker';
import { DinoLogo } from './DinoIcon'; // Import Dino để làm branding cho cột trống

interface KanbanBoardProps {
  tasks: Task[];
  boards: Board[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddBoard: (title: string) => void;
  onDeleteBoard: (id: string) => void;
  onUpdateBoard?: (boardId: string, updates: Partial<Board>) => void; 
  onClose: () => void;
}

const TASK_COLORS = [
    { hex: '#71717a', name: 'Mặc định' },
    { hex: '#ef4444', name: 'Gấp' },
    { hex: '#eab308', name: 'Chờ' },
    { hex: '#3b82f6', name: 'Design' },
    { hex: '#a855f7', name: 'Dev' },
    { hex: '#22c55e', name: 'Xong' },
];

const COL_COLORS = [
    { class: 'bg-zinc-500', hex: '#71717a' },
    { class: 'bg-red-500', hex: '#ef4444' },
    { class: 'bg-orange-500', hex: '#f97316' },
    { class: 'bg-blue-500', hex: '#3b82f6' },
    { class: 'bg-purple-500', hex: '#a855f7' },
    { class: 'bg-green-500', hex: '#22c55e' },
];

const KanbanBoard = ({ tasks, boards, onAddTask, onUpdateTask, onDeleteTask, onAddBoard, onDeleteBoard, onUpdateBoard, onClose }: KanbanBoardProps) => {
  const [activeBoardId, setActiveBoardId] = useState<string>(boards[0].id);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskColor, setNewTaskColor] = useState(TASK_COLORS[0].hex);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [datePickerTarget, setDatePickerTarget] = useState<{ type: 'start' | 'due', taskId?: string, isModal?: boolean } | null>(null);

  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [tempColTitle, setTempColTitle] = useState("");
  const [newColName, setNewColName] = useState("");
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [openColMenuId, setOpenColMenuId] = useState<string | null>(null);

  const [editingBoardTitle, setEditingBoardTitle] = useState(false);
  const [tempBoardTitle, setTempBoardTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];
  const boardTasks = tasks.filter(t => t.boardId === activeBoardId);

  // --- LOGIC ---
  const getGlowColors = (colorClass: string) => {
      const colorMap: Record<string, { via: string, from: string }> = {
          'bg-zinc-500': { via: 'via-zinc-500', from: 'from-zinc-500/10' },
          'bg-red-500': { via: 'via-red-500', from: 'from-red-500/10' },
          'bg-orange-500': { via: 'via-orange-500', from: 'from-orange-500/10' },
          'bg-blue-500': { via: 'via-blue-500', from: 'from-blue-500/10' },
          'bg-purple-500': { via: 'via-purple-500', from: 'from-purple-500/10' },
          'bg-green-500': { via: 'via-green-500', from: 'from-green-500/10' },
      };
      return colorMap[colorClass] || { via: 'via-zinc-500', from: 'from-zinc-500/10' };
  };

  const handleCancelAddTask = () => {
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setNewTaskColor(TASK_COLORS[0].hex);
      setErrorMsg(null);
      setDatePickerTarget(null);
      setIsAddingTask(null);
  };

  const handleCreateTask = (status: string) => {
    if (!newTaskTitle.trim()) {
        setErrorMsg("Bạn chưa nhập nội dung!");
        setTimeout(() => setErrorMsg(null), 2000);
        return;
    }
    const now = new Date().toISOString();
    onAddTask({
      title: newTaskTitle, 
      status, 
      boardId: activeBoardId,
      startDate: now,
      dueDate: newTaskDueDate || undefined,
      color: newTaskColor,
      createdAt: now,
      subtasks: []
    });
    
    setNewTaskTitle(""); 
    setNewTaskDueDate(""); 
    setNewTaskColor(TASK_COLORS[0].hex); 
    setErrorMsg(null);
    setDatePickerTarget(null); 
  };

  const moveTask = (taskId: string, direction: 'prev' | 'next') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const colIds = activeBoard.columns.map(c => c.id);
    const currentIndex = colIds.indexOf(task.status);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < colIds.length) {
      onUpdateTask(taskId, { status: colIds[newIndex] });
    }
  };

  const saveRenameBoard = () => { if (activeBoard.isDefault) return; if (tempBoardTitle.trim() && onUpdateBoard) onUpdateBoard(activeBoardId, { title: tempBoardTitle }); setEditingBoardTitle(false); };
  const saveRenameCol = (colId: string) => { if (activeBoard.isDefault) return; if (tempColTitle.trim() && onUpdateBoard) { const newCols = activeBoard.columns.map(c => c.id === colId ? { ...c, title: tempColTitle } : c); onUpdateBoard(activeBoardId, { columns: newCols }); } setEditingColId(null); };
  const changeColColor = (colId: string, colorClass: string) => { if (activeBoard.isDefault || !onUpdateBoard) return; const newCols = activeBoard.columns.map(c => c.id === colId ? { ...c, color: colorClass } : c); onUpdateBoard(activeBoardId, { columns: newCols }); setOpenColMenuId(null); };
  const handleAddColumn = () => { if (activeBoard.isDefault || !onUpdateBoard || !newColName.trim()) return; const newId = newColName.toLowerCase().replace(/\s+/g, '-'); const newCols = [...activeBoard.columns, { id: newId, title: newColName, color: 'bg-zinc-500' }]; onUpdateBoard(activeBoardId, { columns: newCols }); setNewColName(""); };
  const handleDeleteColumn = (colId: string) => { if (activeBoard.isDefault || !onUpdateBoard) return; const newCols = activeBoard.columns.filter(c => c.id !== colId); onUpdateBoard(activeBoardId, { columns: newCols }); };
  const handleAddSubtask = () => { if (!selectedTask || !newSubtaskTitle.trim()) return; const newSub: Subtask = { id: Date.now().toString(), title: newSubtaskTitle, completed: false }; const updatedSubtasks = [...(selectedTask.subtasks || []), newSub]; onUpdateTask(selectedTask.id, { subtasks: updatedSubtasks }); setSelectedTask({ ...selectedTask, subtasks: updatedSubtasks }); setNewSubtaskTitle(""); };
  const toggleSubtask = (subId: string) => { if (!selectedTask) return; const updatedSubtasks = (selectedTask.subtasks || []).map(s => s.id === subId ? { ...s, completed: !s.completed } : s); onUpdateTask(selectedTask.id, { subtasks: updatedSubtasks }); setSelectedTask({ ...selectedTask, subtasks: updatedSubtasks }); };
  const deleteSubtask = (subId: string) => { if (!selectedTask) return; const updatedSubtasks = (selectedTask.subtasks || []).filter(s => s.id !== subId); onUpdateTask(selectedTask.id, { subtasks: updatedSubtasks }); setSelectedTask({ ...selectedTask, subtasks: updatedSubtasks }); };
  const calculateProgress = (t: Task) => { if (!t.subtasks || t.subtasks.length === 0) return 0; const completed = t.subtasks.filter(s => s.completed).length; return Math.round((completed / t.subtasks.length) * 100); };
  
  const formatDateTime = (iso: string) => { 
      if (!iso) return ""; 
      const date = new Date(iso); 
      const d = String(date.getDate()).padStart(2, '0'); 
      const m = String(date.getMonth() + 1).padStart(2, '0'); 
      const hasTime = iso.includes('T') && iso.length > 10; 
      const time = hasTime ? iso.split('T')[1].slice(0, 5) : ""; 
      return time ? `${d}/${m} ${time}` : `${d}/${m}`; 
  };
  const getStatusColor = (colorClass?: string) => colorClass || 'bg-zinc-500';

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-zinc-100 font-sans relative">
      
      {errorMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300 font-medium border border-red-400">
              <AlertCircle size={18} />
              {errorMsg}
          </div>
      )}

      {/* HEADER */}
      <div className="p-6 pb-0 border-b border-white/5 bg-black/20">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3">
              <CheckSquare size={24} className="text-blue-400" />
              {editingBoardTitle && !activeBoard.isDefault ? (
                <input autoFocus className="text-xl font-light bg-black/40 border border-blue-500 rounded px-2 text-white min-w-[200px]" value={tempBoardTitle} onChange={e => setTempBoardTitle(e.target.value)} onBlur={saveRenameBoard} onKeyDown={e => e.key === 'Enter' && saveRenameBoard()} />
              ) : (
                <h2 className={`text-xl font-light tracking-wide text-white flex items-center gap-2 group ${!activeBoard.isDefault ? 'cursor-pointer hover:text-blue-200' : ''}`} onClick={() => !activeBoard.isDefault && (setTempBoardTitle(activeBoard.title), setEditingBoardTitle(true))}>
                  {activeBoard.title} {activeBoard.isDefault && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-zinc-400">Default</span>} {!activeBoard.isDefault && <Edit2 size={12} className="opacity-0 group-hover:opacity-50" />}
                </h2>
              )}
            </div>
             <div className="flex items-center gap-2 mt-1">
                <div className="relative">
                    <button onClick={() => setShowBoardMenu(!showBoardMenu)} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-white/5 px-2 py-1 rounded transition-colors">
                        Chọn Board <ChevronDown size={12} />
                    </button>
                    {showBoardMenu && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-[#18181b] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                            {boards.map(board => (
                                <div key={board.id} className="flex items-center justify-between p-2 hover:bg-white/5 cursor-pointer group" onClick={() => { setActiveBoardId(board.id); setShowBoardMenu(false); setIsEditingBoard(false); }}>
                                    <span className={`text-sm ${activeBoardId === board.id ? 'text-blue-400 font-bold' : 'text-zinc-300'}`}>{board.title}</span>
                                    {!board.isDefault && <button onClick={(e) => { e.stopPropagation(); onDeleteBoard(board.id); }} className="text-zinc-600 hover:text-red-400 p-1"><Trash2 size={12} /></button>}
                                </div>
                            ))}
                            <div className="border-t border-white/10 p-2">
                                <button onClick={() => { onAddBoard("Board mới"); setShowBoardMenu(false); }} className="w-full flex items-center gap-2 text-xs text-zinc-400 hover:text-blue-400 justify-center"><Plus size={12} /> Tạo Board mới</button>
                            </div>
                        </div>
                    )}
                </div>
                {!activeBoard.isDefault && (
                    <button onClick={() => setIsEditingBoard(!isEditingBoard)} className={`text-xs px-2 py-1 rounded transition-colors ${isEditingBoard ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                        {isEditingBoard ? 'Xong' : 'Sửa cột'}
                    </button>
                )}
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                <button onClick={() => setViewMode('board')} className={`p-1.5 rounded transition-all ${viewMode === 'board' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><KanbanIcon size={16} /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><LayoutList size={16} /></button>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white"><X size={20} /></button>
          </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="flex-1 overflow-hidden p-6 relative">
        {viewMode === 'board' && (
            <div className="flex h-full gap-4 overflow-x-auto scrollbar-hide pb-2">
                
                {activeBoard.columns.length === 0 && !isEditingBoard && (
                    <div className="w-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                        <p>Board trống.</p>
                        <button onClick={() => setIsEditingBoard(true)} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">+ Thêm cột</button>
                    </div>
                )}

                {activeBoard.columns.map((col) => {
                    const glow = getGlowColors(col.color);
                    const colTasks = boardTasks.filter(t => t.status === col.id);
                    
                    return (
                        <div key={col.id} className="min-w-[320px] w-[320px] flex flex-col h-full bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/5 relative overflow-hidden group/col">
                            
                            {/* SPOTLIGHT EFFECT */}
                            <div className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent ${glow.via} to-transparent opacity-80 z-10`}></div>
                            
                            {/* HEADER */}
                            <div className={`p-4 border-b border-white/5 flex items-center justify-between relative bg-gradient-to-b ${glow.from} to-transparent`}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(col.color)}`}></div>
                                    {editingColId === col.id && !activeBoard.isDefault ? (
                                        <input autoFocus className="bg-black/40 border border-blue-500/50 rounded px-1 text-sm font-bold uppercase text-white w-[140px]" value={tempColTitle} onChange={(e) => setTempColTitle(e.target.value)} onBlur={() => saveRenameCol(col.id)} onKeyDown={(e) => e.key === 'Enter' && saveRenameCol(col.id)} />
                                    ) : (
                                        <span className={`text-sm font-bold uppercase tracking-wider text-zinc-200 ${!activeBoard.isDefault ? 'cursor-pointer hover:text-blue-300' : ''}`} onClick={() => { if(!activeBoard.isDefault) { setEditingColId(col.id); setTempColTitle(col.title); }}}>
                                            {col.title}
                                        </span>
                                    )}
                                    <span className="text-xs text-zinc-500 font-mono">({colTasks.length})</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    {!activeBoard.isDefault && isEditingBoard && (
                                        <div className="relative">
                                            <button onClick={() => setOpenColMenuId(openColMenuId === col.id ? null : col.id)} className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/10"><Palette size={14} /></button>
                                            {openColMenuId === col.id && (
                                                <div className="absolute top-full right-0 mt-1 p-2 bg-[#1f1f22] border border-white/10 rounded-xl shadow-xl z-50 flex gap-1.5">
                                                    {COL_COLORS.map(c => (
                                                        <button key={c.hex} onClick={() => changeColColor(col.id, c.class)} className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${col.color === c.class ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: c.hex }} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {isEditingBoard && !activeBoard.isDefault && <button onClick={() => { if(onUpdateBoard) onUpdateBoard(activeBoardId, { columns: activeBoard.columns.filter(c => c.id !== col.id) }); }} className="text-zinc-600 hover:text-red-400"><X size={14} /></button>}
                                </div>
                            </div>

                            {/* TASK LIST */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide relative">
                                {/* BRANDING: Dino Empty State */}
                                {colTasks.length === 0 && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/col:opacity-10 transition-opacity duration-700 pointer-events-none">
                                        <DinoLogo size={64} className="text-zinc-500" />
                                        <p className="text-[10px] font-bold mt-2 uppercase tracking-widest text-zinc-500">Trống</p>
                                    </div>
                                )}

                                {colTasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        onClick={() => setSelectedTask(task)}
                                        className="group bg-black/40 hover:bg-black/60 backdrop-blur-sm p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all shadow-sm relative cursor-pointer" 
                                        style={{ borderLeft: `3px solid ${task.color || '#71717a'}` }}
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className="text-sm text-zinc-100 font-medium leading-relaxed">{task.title}</span>
                                            <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400"><Trash2 size={13} /></button>
                                        </div>

                                        {task.subtasks && task.subtasks.length > 0 && (
                                            <div className="w-full h-1 bg-white/10 rounded-full mb-2 overflow-hidden">
                                                <div className="h-full bg-blue-500/70" style={{ width: `${calculateProgress(task)}%` }}></div>
                                            </div>
                                        )}

                                        <div className="flex items-end justify-between mt-1 pt-1.5 border-t border-white/5">
                                            <div className="flex flex-col text-[9px] text-zinc-500 gap-0.5">
                                                <span className="font-mono text-zinc-500">{formatDateTime(task.createdAt)}</span>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mb-1" onClick={(e) => e.stopPropagation()}>
                                                    {activeBoard.columns.indexOf(col) > 0 && <button onClick={() => moveTask(task.id, 'prev')} className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"><ChevronLeft size={12} /></button>}
                                                    {activeBoard.columns.indexOf(col) < activeBoard.columns.length - 1 && <button onClick={() => moveTask(task.id, 'next')} className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"><ChevronRight size={12} /></button>}
                                                </div>

                                                {task.dueDate ? (
                                                    <div className={`flex flex-col items-end text-[9px] gap-0.5 ${new Date(task.dueDate) < new Date() && col.id !== 'done' ? 'text-red-400' : 'text-zinc-500'}`}>
                                                        <span className="font-mono flex items-center gap-1">{formatDateTime(task.dueDate)} <CalIcon size={9}/></span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] text-zinc-600 italic">--</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- NEW ADD TASK FORM --- */}
                            <div className="p-3 border-t border-white/5 bg-transparent rounded-b-2xl">
                                {!isAddingTask || isAddingTask !== col.id ? (
                                    <button 
                                        onClick={() => setIsAddingTask(col.id)}
                                        className="w-full flex items-center justify-between group py-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300">
                                            <Plus size={16} />
                                            <span className="text-sm font-medium">Thêm thẻ</span>
                                        </div>
                                        <div className="text-zinc-600 group-hover:text-zinc-400 p-1">
                                            <CalIcon size={14} />
                                        </div>
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-black/40 border border-blue-500/30 focus-within:border-blue-500 rounded-lg flex items-center px-2 transition-colors">
                                                <input 
                                                    autoFocus
                                                    className="bg-transparent w-full text-sm text-white py-2 outline-none placeholder:text-zinc-600"
                                                    placeholder="Nhập tên thẻ..."
                                                    value={newTaskTitle}
                                                    onChange={e => setNewTaskTitle(e.target.value)}
                                                    onKeyDown={e => {
                                                        if(e.key === 'Enter') handleCreateTask(col.id);
                                                        if(e.key === 'Escape') handleCancelAddTask();
                                                    }}
                                                />
                                            </div>
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setDatePickerTarget(datePickerTarget?.taskId === 'new' ? null : { type: 'due', taskId: 'new' })}
                                                    className={`h-full px-2.5 rounded-lg border flex items-center justify-center transition-colors ${newTaskDueDate ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    <CalIcon size={16} />
                                                </button>
                                                {datePickerTarget?.taskId === 'new' && (
                                                    <div className="absolute bottom-full right-0 mb-2 z-50">
                                                        <MiniDatePicker 
                                                                className="static shadow-xl bg-[#1f1f22]"
                                                                selectedDate={newTaskDueDate} 
                                                                includeTime={true} 
                                                                onSelect={(d) => { setNewTaskDueDate(d); setDatePickerTarget(null); }} 
                                                                onClose={() => setDatePickerTarget(null)} 
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                {TASK_COLORS.map(c => (
                                                    <button key={c.hex} onClick={() => setNewTaskColor(c.hex)} className={`w-3 h-3 rounded-full transition-transform ${newTaskColor === c.hex ? 'ring-1 ring-white scale-125' : 'opacity-30 hover:opacity-100'}`} style={{ backgroundColor: c.hex }} title={c.name} />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={handleCancelAddTask} className="text-xs text-zinc-500 hover:text-white px-2 py-1 transition-colors">Hủy</button>
                                                <button onClick={() => handleCreateTask(col.id)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all">Thêm</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })}

                {isEditingBoard && !activeBoard.isDefault && (
                    <div className="min-w-[300px] w-[300px] p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col gap-2">
                        <input placeholder="Tên cột mới" className="w-full bg-black/30 p-2 rounded-lg text-sm text-white outline-none border border-transparent focus:border-blue-500" value={newColName} onChange={(e) => setNewColName(e.target.value)} />
                        <button onClick={handleAddColumn} disabled={!newColName.trim()} className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold disabled:opacity-50">Thêm cột</button>
                    </div>
                )}
            </div>
        )}
        
        {viewMode === 'list' && (
             <div className="w-full h-full overflow-y-auto scrollbar-hide px-4">
                 {activeBoard.columns.map(col => {
                     const colTasks = boardTasks.filter(t => t.status === col.id);
                     if (colTasks.length === 0) return null;
                     return (
                        <div key={col.id} className="mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2 px-2 border-b border-white/5 pb-1">{col.title}</h3>
                            <div className="space-y-1">
                                {colTasks.map(task => (
                                    <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border-l-4 transition-colors cursor-pointer" style={{ borderLeftColor: task.color || '#71717a' }}>
                                        <span className={`text-sm ${col.id === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{task.title}</span>
                                        {task.dueDate && <span className="text-xs text-zinc-500 font-mono">{formatDateTime(task.dueDate)}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                     )
                 })}
             </div>
        )}

        {/* ... (Các phần DatePicker, Task Modal giữ nguyên) ... */}
        {datePickerTarget?.isModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDatePickerTarget(null)}>
                <div onClick={e => e.stopPropagation()} className="animate-in zoom-in-95 duration-200">
                    <MiniDatePicker 
                        selectedDate={datePickerTarget.type === 'start' ? selectedTask?.startDate : selectedTask?.dueDate} 
                        includeTime={true} 
                        className="static transform-none bg-[#1f1f22] border border-white/10 shadow-2xl rounded-xl p-3 ring-1 ring-white/5" 
                        onSelect={(d) => { 
                             if (selectedTask) {
                                 const updateField = datePickerTarget.type === 'start' ? 'startDate' : 'dueDate';
                                 onUpdateTask(selectedTask.id, { [updateField]: d }); 
                                 setSelectedTask(prev => prev ? {...prev, [updateField]: d} : null); 
                             }
                             setDatePickerTarget(null); 
                        }} 
                        onClose={() => setDatePickerTarget(null)} 
                    />
                </div>
            </div>
        )}

        {selectedTask && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedTask(null)}>
                <div className="w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90%]" onClick={e => e.stopPropagation()}>
                    
                    <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-start" style={{ borderTop: `4px solid ${selectedTask.color || '#71717a'}` }}>
                        <div className="flex-1">
                            <h2 className="text-xl font-medium text-white mb-1">{selectedTask.title}</h2>
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                <span>Trong: <span className="text-zinc-300 font-bold uppercase">{activeBoard.columns.find(c => c.id === selectedTask.status)?.title}</span></span>
                                <span>•</span>
                                <span>Tạo: {formatDateTime(selectedTask.createdAt)}</span>
                            </div>
                        </div>
                        <button onClick={() => setSelectedTask(null)} className="text-zinc-500 hover:text-white p-1 rounded hover:bg-white/10"><X size={20} /></button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                 onClick={() => setDatePickerTarget({ type: 'start', taskId: selectedTask.id, isModal: true })}
                            >
                                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">Bắt đầu</label>
                                <div className="text-sm text-zinc-300 font-mono flex items-center gap-2">
                                    <Clock size={14} className="text-blue-400" /> 
                                    {selectedTask.startDate ? formatDateTime(selectedTask.startDate) : formatDateTime(selectedTask.createdAt)}
                                </div>
                            </div>

                            <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                 onClick={() => setDatePickerTarget({ type: 'due', taskId: selectedTask.id, isModal: true })}
                            >
                                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">Hạn chót</label>
                                <div className="text-sm text-zinc-300 font-mono flex items-center gap-2">
                                    <CalIcon size={14} className="text-red-400" /> 
                                    {selectedTask.dueDate ? formatDateTime(selectedTask.dueDate) : 'Đặt hạn chót'}
                                </div>
                            </div>
                        </div>

                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2"><CheckSquare size={16} /> Danh sách công việc con</h3>
                                <span className="text-xs text-zinc-500">{calculateProgress(selectedTask)}% Hoàn thành</span>
                            </div>
                            
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-4 overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${calculateProgress(selectedTask)}%` }}></div>
                            </div>

                            <div className="space-y-2">
                                {(selectedTask.subtasks || []).map(sub => (
                                    <div key={sub.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg group">
                                        <button onClick={() => toggleSubtask(sub.id)} className={`flex-shrink-0 transition-colors ${sub.completed ? 'text-green-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
                                            {sub.completed ? <CheckCircle2 size={18} /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-current"></div>}
                                        </button>
                                        <span className={`flex-1 text-sm ${sub.completed ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>{sub.title}</span>
                                        <button onClick={() => deleteSubtask(sub.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <Plus size={16} className="text-zinc-500" />
                                <input 
                                    placeholder="Thêm công việc con..." 
                                    className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-zinc-600 border-b border-transparent focus:border-blue-500/50 py-1"
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                />
                                <button onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()} className="text-xs text-blue-400 hover:text-white disabled:opacity-0 font-bold px-2">Thêm</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default KanbanBoard;