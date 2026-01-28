import { useState, useEffect, useRef } from 'react';
import { Plus, X, Bold, Italic, Underline, Palette, Trash2, GripHorizontal, LayoutGrid } from 'lucide-react';
import * as db from '../services/db'; // Import Backend

interface Note {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorBg: string; 
  colorBorder: string;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  rotate: number;
}

interface StickyNotesProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAPER_THEMES = [
  { id: 'yellow', bg: 'bg-[#fff7b1]', border: 'border-[#ffe066]' },
  { id: 'green', bg: 'bg-[#d4f7d4]', border: 'border-[#9ceea0]' },
  { id: 'blue', bg: 'bg-[#d6eaff]', border: 'border-[#9dcaff]' },
  { id: 'pink', bg: 'bg-[#ffd6e7]', border: 'border-[#ff9dbc]' },
  { id: 'purple', bg: 'bg-[#ecdbf9]', border: 'border-[#d2aef0]' },
  { id: 'gray', bg: 'bg-[#f4f4f5]', border: 'border-[#d4d4d8]' },
  { id: 'dark', bg: 'bg-[#27272a]', border: 'border-[#3f3f46]' }, 
];

const TEXT_COLORS = [
  { id: 'black', class: 'text-zinc-900', label: 'Đen' },
  { id: 'gray', class: 'text-zinc-500', label: 'Xám' },
  { id: 'red', class: 'text-red-600', label: 'Đỏ' },
  { id: 'blue', class: 'text-blue-600', label: 'Xanh' },
  { id: 'purple', class: 'text-purple-600', label: 'Tím' },
  { id: 'white', class: 'text-zinc-100', label: 'Trắng' },
];

const StickyNotes = ({ isOpen, onClose }: StickyNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Load from DB
  useEffect(() => {
    const loadNotes = async () => {
        const data = await db.getNotes();
        if (data.length > 0) setNotes(data);
        else {
             // Init demo note if empty
             const demo: Note = {
                id: crypto.randomUUID(), title: 'Hello!', content: 'Ghi chú của bạn ở đây.\nKéo thả thoải mái nhé!',
                x: 100, y: 100, width: 240, height: 260,
                colorBg: 'bg-[#fff7b1]', colorBorder: 'border-[#ffe066]',
                textColor: 'text-zinc-900', isBold: false, isItalic: false, isUnderline: false, rotate: -2
            };
            setNotes([demo]);
            await db.saveNote(demo);
        }
    };
    if (isOpen) loadNotes();
  }, [isOpen]);

  // Save to DB on Change (Debounce could be added for performance, but SQLite local is fast enough for now)
  const saveToDb = async (note: Note) => {
      await db.saveNote(note);
  };

  const addNote = async () => {
    const theme = PAPER_THEMES[Math.floor(Math.random() * (PAPER_THEMES.length - 1))];
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      x: window.innerWidth / 2 - 120 + (Math.random() * 40 - 20),
      y: window.innerHeight / 2 - 130 + (Math.random() * 40 - 20),
      width: 240,
      height: 260,
      colorBg: theme.bg,
      colorBorder: theme.border,
      textColor: 'text-zinc-900',
      isBold: false, isItalic: false, isUnderline: false,
      rotate: Math.random() * 4 - 2,
    };
    setNotes([...notes, newNote]);
    await saveToDb(newNote);
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    setNotes(prev => {
        const newNotes = prev.map(n => n.id === id ? { ...n, ...updates } : n);
        const updatedNote = newNotes.find(n => n.id === id);
        if (updatedNote) saveToDb(updatedNote);
        return newNotes;
    });
  };

  const deleteNoteState = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await db.deleteNote(id);
  };

  const arrangeNotes = () => {
      const padding = 20;
      const noteWidth = 240;
      const noteHeight = 260;
      const cols = Math.floor((window.innerWidth - 100) / (noteWidth + padding));
      
      const newNotes = notes.map((note, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const updated = {
              ...note,
              x: 50 + col * (noteWidth + padding),
              y: 100 + row * (noteHeight + padding),
              rotate: 0 
          };
          saveToDb(updated);
          return updated;
      });
      setNotes(newNotes);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string, x: number, y: number) => {
    e.stopPropagation();
    setDraggingId(id);
    setActiveMenuId(null);
    dragOffset.current = { x: e.clientX - x, y: e.clientY - y };
    
    // Bring to front
    setNotes(prev => {
        const note = prev.find(n => n.id === id);
        if (!note) return prev;
        const others = prev.filter(n => n.id !== id);
        return [...others, note];
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      // Update local state for smoothness, save on MouseUp
      setNotes(prev => prev.map(n => n.id === draggingId ? {...n, x: newX, y: newY} : n));
    }
  };

  const handleMouseUp = () => {
    if (draggingId) {
        const note = notes.find(n => n.id === draggingId);
        if (note) saveToDb(note);
    }
    setDraggingId(null);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-30 overflow-hidden pointer-events-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => setActiveMenuId(null)} 
    >
      {/* TOOLBAR */}
      {isOpen && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl animate-in slide-in-from-bottom-4 duration-500 z-50 pointer-events-auto">
            <button 
                onClick={(e) => { e.stopPropagation(); arrangeNotes(); }}
                className="pl-3 pr-3 py-2 text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider flex items-center gap-2 border-r border-white/10 hover:bg-white/5 rounded-l-full transition-colors"
                title="Sắp xếp gọn gàng"
            >
                <LayoutGrid size={16} /> Sắp xếp
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); addNote(); }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full shadow-lg hover:bg-zinc-200 transition-transform font-bold active:scale-95"
            >
                <Plus size={18} /> Thêm mới
            </button>
            <button 
                onClick={onClose}
                className="p-2.5 bg-white/10 text-zinc-400 hover:text-white rounded-full hover:bg-red-500/20 hover:border-red-500/50 border border-transparent transition-all"
                title="Đóng chế độ chỉnh sửa"
            >
                <X size={20} />
            </button>
        </div>
      )}

      {notes.map(note => {
          const isDark = note.colorBg.includes('zinc') || note.colorBg.includes('dark');
          const uiColor = isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black';

          return (
            <div
                key={note.id}
                style={{ 
                    left: note.x, top: note.y, width: note.width, minHeight: note.height,
                    transform: `rotate(${note.rotate}deg)`,
                    cursor: draggingId === note.id ? 'grabbing' : 'default',
                    transition: draggingId === note.id ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                }}
                className={`absolute flex flex-col shadow-[5px_5px_15px_rgba(0,0,0,0.15)] hover:shadow-[8px_8px_25px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-200 pointer-events-auto ${note.colorBg}`}
                onMouseDown={(e) => e.stopPropagation()} 
            >
                {/* HEADER */}
                <div 
                    className={`h-8 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing border-b ${note.colorBorder} ${isDark ? 'border-zinc-700' : ''}`}
                    onMouseDown={(e) => handleMouseDown(e, note.id, note.x, note.y)}
                >
                    <GripHorizontal size={16} className={`opacity-50 ${isDark ? 'text-white' : 'text-black'}`} />
                    
                    <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
                        <div className="relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === note.id ? null : note.id); }}
                                className={`p-1 rounded ${uiColor}`}
                            >
                                <Palette size={14} />
                            </button>
                            
                            {activeMenuId === note.id && (
                                <div className="absolute top-full right-0 mt-2 p-2 bg-white rounded-xl shadow-xl border border-zinc-200 grid grid-cols-4 gap-2 z-50 w-[140px] animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                                    {PAPER_THEMES.map(theme => (
                                        <button 
                                            key={theme.id}
                                            onClick={() => {
                                                updateNote(note.id, { 
                                                    colorBg: theme.bg, 
                                                    colorBorder: theme.border,
                                                    textColor: theme.id === 'dark' ? 'text-zinc-100' : (note.textColor === 'text-zinc-100' ? 'text-zinc-900' : note.textColor) 
                                                });
                                            }}
                                            className={`w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform ${theme.bg} ${note.colorBg === theme.bg ? 'ring-2 ring-blue-500' : ''}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={() => deleteNoteState(note.id)} className={`p-1 rounded hover:bg-red-500/10 hover:text-red-600 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="flex-1 flex flex-col p-4 pb-2" onClick={e => e.stopPropagation()}>
                    <input 
                        value={note.title}
                        onChange={(e) => updateNote(note.id, { title: e.target.value })}
                        placeholder="Tiêu đề..."
                        className={`bg-transparent text-lg font-bold outline-none w-full mb-2 placeholder:opacity-50 ${note.textColor} ${isDark ? 'placeholder:text-zinc-600' : 'placeholder:text-zinc-400'}`}
                    />
                    
                    <textarea
                        value={note.content}
                        onChange={(e) => updateNote(note.id, { content: e.target.value })}
                        className={`w-full flex-1 bg-transparent resize-none outline-none text-sm font-medium leading-relaxed font-sans scrollbar-hide placeholder:opacity-50 transition-all ${note.textColor} ${note.isBold ? '!font-black' : 'font-medium'} ${note.isItalic ? 'italic' : ''} ${note.isUnderline ? 'underline' : ''} ${isDark ? 'placeholder:text-zinc-600' : 'placeholder:text-zinc-400'}`}
                        placeholder="Viết ghi chú..."
                        spellCheck={false}
                    />
                </div>

                {/* FOOTER */}
                <div className={`h-9 border-t flex items-center justify-between px-3 ${note.colorBorder} ${isDark ? 'border-zinc-700' : ''}`} onClick={e => e.stopPropagation()}>
                     
                     <div className="flex items-center gap-1">
                         <button 
                            onMouseDown={(e) => { e.preventDefault(); updateNote(note.id, { isBold: !note.isBold }); }} 
                            className={`p-1 rounded transition-colors ${note.isBold ? 'bg-black/10 shadow-inner' : 'hover:bg-black/5'} ${uiColor}`}
                         >
                             <Bold size={14} />
                         </button>
                         <button 
                            onMouseDown={(e) => { e.preventDefault(); updateNote(note.id, { isItalic: !note.isItalic }); }} 
                            className={`p-1 rounded transition-colors ${note.isItalic ? 'bg-black/10 shadow-inner' : 'hover:bg-black/5'} ${uiColor}`}
                         >
                             <Italic size={14} />
                         </button>
                         <button 
                            onMouseDown={(e) => { e.preventDefault(); updateNote(note.id, { isUnderline: !note.isUnderline }); }} 
                            className={`p-1 rounded transition-colors ${note.isUnderline ? 'bg-black/10 shadow-inner' : 'hover:bg-black/5'} ${uiColor}`}
                         >
                             <Underline size={14} />
                         </button>
                     </div>

                     <div className="flex items-center gap-1">
                        {TEXT_COLORS.filter(c => !isDark || c.id !== 'black').slice(0, 4).map(c => (
                            <button 
                                key={c.id}
                                onMouseDown={(e) => { e.preventDefault(); updateNote(note.id, { textColor: c.class }); }}
                                className={`w-3.5 h-3.5 rounded-full border border-black/10 hover:scale-125 transition-transform ${c.id === 'white' ? 'bg-white' : c.class.replace('text-', 'bg-')}`}
                                title={c.label}
                            />
                        ))}
                     </div>
                </div>
            </div>
          );
      })}
    </div>
  );
};

export default StickyNotes;