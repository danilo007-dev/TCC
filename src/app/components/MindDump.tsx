import { useState, useRef, useEffect, useCallback } from "react";
import {
  Brain, Plus, Folder, FileText, Trash2,
  CheckSquare, X, FolderOpen, ArrowRight, Save,
  FolderPlus, FilePlus, Wind, ChevronLeft,
  MoreVertical, Pencil, Bold, Italic, Underline,
  Strikethrough, AlignLeft, AlignCenter, AlignRight,
  Type, Palette, Highlighter, List, ListOrdered,
  AlertTriangle, CheckSquare as CheckIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { taskStore } from "../store";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type BlockType = "paragraph" | "bullet" | "ordered" | "checkbox";
type Align     = "left" | "center" | "right";

interface TextFormat {
  bold:      boolean;
  italic:    boolean;
  underline: boolean;
  strike:    boolean;
  color:     string;
  bg:        string;
  size:      string;
  align:     Align;
}

interface Block {
  id:       string;
  type:     BlockType;
  text:     string;
  format:   TextFormat;
  checked?: boolean;
}

interface Note {
  id:        string;
  title:     string;
  blocks:    Block[];
  createdAt: Date;
  folderId:  string | null;
}

interface NoteFolder {
  id:    string;
  name:  string;
  color: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mkFormat = (p?: Partial<TextFormat>): TextFormat => ({
  bold: false, italic: false, underline: false, strike: false,
  color: "#1f2937", bg: "transparent", size: "16px", align: "left", ...p,
});

const mkBlock = (p?: Partial<Block>): Block => ({
  id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: "paragraph", text: "", format: mkFormat(), ...p,
});

const blocksPreview = (blocks: Block[]) =>
  blocks.map((b) => b.text).filter(Boolean).join(" ").slice(0, 120);

function analyzeThought(text: string) {
  const lower = text.toLowerCase();
  let sub = ["Começar", "Continuar", "Finalizar"];
  if (lower.includes("estudar") || lower.includes("aprender"))
    sub = ["Separar material", "Ler o conteúdo", "Fazer anotações"];
  else if (lower.includes("trabalho") || lower.includes("projeto"))
    sub = ["Abrir o documento", "Escrever introdução", "Revisar"];
  else if (lower.includes("comprar") || lower.includes("loja"))
    sub = ["Fazer lista", "Verificar preços", "Finalizar compra"];
  return { suggestedTitle: text.slice(0, 40), suggestedSubtasks: sub };
}

// ─── Paleta ───────────────────────────────────────────────────────────────────

const FOLDER_COLORS = [
  { key: "blue",   bar: "bg-blue-500",   bg: "bg-blue-100",   text: "text-blue-700"   },
  { key: "pink",   bar: "bg-pink-400",   bg: "bg-pink-100",   text: "text-pink-700"   },
  { key: "orange", bar: "bg-orange-500", bg: "bg-orange-100", text: "text-orange-700" },
  { key: "green",  bar: "bg-green-500",  bg: "bg-green-100",  text: "text-green-700"  },
  { key: "purple", bar: "bg-purple-500", bg: "bg-purple-100", text: "text-purple-700" },
  { key: "yellow", bar: "bg-yellow-400", bg: "bg-yellow-100", text: "text-yellow-700" },
  { key: "teal",   bar: "bg-teal-500",   bg: "bg-teal-100",   text: "text-teal-700"   },
  { key: "red",    bar: "bg-red-500",    bg: "bg-red-100",    text: "text-red-700"    },
];
const getColor = (key: string) => FOLDER_COLORS.find((c) => c.key === key) ?? FOLDER_COLORS[0];
const fmtDate  = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

const FONT_SIZES  = ["10px","12px","14px","16px","18px","20px","24px","28px","32px"];
const FONT_COLORS = ["#1f2937","#6b7280","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899"];
const BG_COLORS   = [
  { l: "Sem fundo", v: "transparent" }, { l: "Amarelo",  v: "#fef08a" },
  { l: "Verde",     v: "#bbf7d0"     }, { l: "Azul",     v: "#bfdbfe" },
  { l: "Rosa",      v: "#fbcfe8"     }, { l: "Laranja",  v: "#fed7aa" },
  { l: "Roxo",      v: "#e9d5ff"     }, { l: "Vermelho", v: "#fecaca" },
  { l: "Ciano",     v: "#a5f3fc"     },
];

type View = "home" | "capture" | "decide";

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════

export function MindDump() {
  const [view, setView]               = useState<View>("home");
  const [captureText, setCaptureText] = useState("");
  const [taskAdded, setTaskAdded]     = useState(false);

  const [notes, setNotes] = useState<Note[]>([
    { id: "d1", title: "Ideias para o TCC",
      blocks: ["Implementar modo escuro","Melhorar animações","Testar com usuários reais"].map((t) => mkBlock({ text: t })),
      createdAt: new Date(Date.now() - 86400000), folderId: null },
    { id: "d2", title: "Lista de compras",
      blocks: ["Café, pão, leite","Caderno novo","Canetas coloridas"].map((t) => mkBlock({ text: t })),
      createdAt: new Date(Date.now() - 172800000), folderId: "f2" },
  ]);

  const [folders, setFolders] = useState<NoteFolder[]>([
    { id: "f1", name: "Trabalho", color: "blue"   },
    { id: "f2", name: "Pessoal",  color: "pink"   },
    { id: "f3", name: "Estudos",  color: "orange" },
    { id: "f4", name: "Ideias",   color: "green"  },
  ]);

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [editingNote, setEditingNote]       = useState<Note | null>(null);
  const [showFab, setShowFab]               = useState(false);
  const [showNewFolder, setShowNewFolder]   = useState(false);
  const [editingFolder, setEditingFolder]   = useState<NoteFolder | null>(null);
  const [deleteConfirm, setDeleteConfirm]   = useState<{ type: "note"|"folder"; id: string }|null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (view === "capture") setTimeout(() => taRef.current?.focus(), 150); }, [view]);

  const handleTransformToTask = () => {
    if (!captureText.trim()) return;
    const { suggestedTitle, suggestedSubtasks } = analyzeThought(captureText);
    const cols = ["#A8E6CF","#FFD3B6","#FFAAA5","#B4A7D6"];
    taskStore.addTask({
      title: suggestedTitle, duration: 15, estimatedTime: "15 min",
      completed: false, progress: 0, color: cols[Math.floor(Math.random()*cols.length)],
      subtasks: suggestedSubtasks.map((t,i) => ({ id:`${Date.now()}-${i}`, title:t, completed:false })),
    });
    setTaskAdded(true);
    setTimeout(() => { setCaptureText(""); setTaskAdded(false); setView("home"); }, 1800);
  };

  const handleSaveNote = (folderId: string|null = null) => {
    if (!captureText.trim()) return;
    const lines = captureText.split("\n");
    const title = lines[0]?.trim() || "Nova nota";
    const bodyLines = lines.slice(1).filter((l) => l.trim());
    setNotes((prev) => [{
      id: Date.now().toString(), title,
      blocks: bodyLines.length ? bodyLines.map((t) => mkBlock({ text:t })) : [mkBlock()],
      createdAt: new Date(), folderId,
    }, ...prev]);
    setCaptureText(""); setView("home");
  };

  const confirmDelete = (type: "note"|"folder", id: string) => setDeleteConfirm({ type, id });

  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "folder") {
      setFolders((p) => p.filter((f) => f.id !== deleteConfirm.id));
      // FIX: apaga todas as notas da pasta (não manda para soltas)
      setNotes((p) => p.filter((n) => n.folderId !== deleteConfirm.id));
      if (activeFolderId === deleteConfirm.id) setActiveFolderId(null);
    } else {
      setNotes((p) => p.filter((n) => n.id !== deleteConfirm.id));
      if (editingNote?.id === deleteConfirm.id) setEditingNote(null);
    }
    setDeleteConfirm(null);
  };

  const saveNote = (id: string, title: string, blocks: Block[]) => {
    setNotes((p) => p.map((n) => n.id === id ? { ...n, title, blocks } : n));
    setEditingNote(null);
  };

  const moveNote = (noteId: string, folderId: string|null) =>
    setNotes((p) => p.map((n) => n.id === noteId ? { ...n, folderId } : n));

  const createNote = (folderId: string|null = null) => {
    const n: Note = { id: Date.now().toString(), title: "", blocks: [mkBlock()], createdAt: new Date(), folderId };
    setNotes((p) => [n, ...p]);
    setEditingNote(n);
    setShowFab(false);
  };

  const looseNotes   = notes.filter((n) => n.folderId === null);
  const folderNotes  = (fid: string) => notes.filter((n) => n.folderId === fid);
  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const currentNotes = activeFolderId ? folderNotes(activeFolderId) : looseNotes;

  // ── CAPTURA ────────────────────────────────────────────────────────────────
  if (view === "capture") return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="max-w-2xl mx-auto min-h-[80vh] flex flex-col">
      <button onClick={() => setView("home")} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 mb-8 font-medium text-sm">
        <ChevronLeft className="size-4" /> Voltar
      </button>
      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="px-7 pt-6 pb-2"><p className="text-xs font-semibold text-gray-300 uppercase tracking-widest flex items-center gap-2"><Wind className="size-3.5"/>Esvazie a sua mente</p></div>
        <textarea ref={taRef} value={captureText} onChange={(e) => setCaptureText(e.target.value)}
          placeholder="Escreva qualquer coisa... pensamentos, ideias, preocupações. Não precisa fazer sentido."
          className="flex-1 w-full px-7 py-4 text-lg text-gray-800 placeholder-gray-300 resize-none focus:outline-none leading-relaxed min-h-[280px]" />
        <div className="px-7 pb-6 flex items-center justify-between">
          <p className="text-xs text-gray-300">{captureText.length > 0 ? `${captureText.length} caracteres` : "Sem pressão. Só escreva."}</p>
          <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}}
            onClick={() => { if (captureText.trim()) setView("decide"); }} disabled={!captureText.trim()}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
            Pronto <ArrowRight className="size-4"/>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // ── DECISÃO ────────────────────────────────────────────────────────────────
  if (view === "decide") return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="max-w-2xl mx-auto space-y-5">
      <div className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
        <p className="text-xs font-medium text-gray-400 mb-1">Você escreveu:</p>
        <p className="text-gray-800 leading-relaxed line-clamp-4 text-sm">{captureText}</p>
        <button onClick={() => setView("capture")} className="mt-2 text-xs text-purple-500 hover:text-purple-700 font-medium">← Editar</button>
      </div>
      <div className="text-center py-1"><p className="text-base font-semibold text-gray-700">O que você quer fazer com isso?</p></div>
      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence>
          {taskAdded ? (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
              className="flex items-center justify-center gap-2 bg-green-50 border-2 border-green-200 rounded-2xl py-4 text-green-700 font-semibold">
              <CheckSquare className="size-5"/> Tarefa criada com sucesso!
            </motion.div>
          ) : (
            <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.99}} onClick={handleTransformToTask}
              className="flex items-center gap-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-colors text-left shadow-lg shadow-purple-100">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><CheckSquare className="size-5"/></div>
              <div><p className="font-semibold">Transformar em tarefa</p><p className="text-xs text-purple-200 mt-0.5">Vai para sua lista de hoje</p></div>
            </motion.button>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.99}} onClick={() => handleSaveNote(null)}
            className="w-full flex items-center gap-4 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-200 px-6 py-4 rounded-2xl font-semibold transition-all text-left">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0"><Save className="size-5 text-gray-500"/></div>
            <div><p className="font-semibold text-gray-800">Guardar como nota</p><p className="text-xs text-gray-400 mt-0.5">Salva na Central de Pensamentos</p></div>
          </motion.button>
          {folders.length > 0 && (
            <div className="pl-4 flex flex-wrap gap-2">
              {folders.map((f) => { const c = getColor(f.color); return (
                <button key={f.id} onClick={() => handleSaveNote(f.id)}
                  className={`flex items-center gap-1.5 ${c.bg} ${c.text} px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80`}>
                  <Folder className="size-3"/>{f.name}
                </button>
              ); })}
            </div>
          )}
        </div>
        <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.99}} onClick={() => { setCaptureText(""); setView("home"); }}
          className="flex items-center gap-4 bg-white hover:bg-gray-50 border-2 border-gray-200 px-6 py-4 rounded-2xl transition-all text-left">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0"><X className="size-5 text-gray-400"/></div>
          <div><p className="font-semibold text-gray-500">Ignorar</p><p className="text-xs text-gray-300 mt-0.5">Já tirei da cabeça, não preciso guardar</p></div>
        </motion.button>
      </div>
    </motion.div>
  );

  // ── HOME ───────────────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={`h-${activeFolderId}`}
          initial={{opacity:0,x:activeFolderId?40:-40}} animate={{opacity:1,x:0}} exit={{opacity:0}}
          transition={{type:"spring",stiffness:300,damping:30}} className="space-y-8 pb-24">

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {activeFolderId && <button onClick={() => setActiveFolderId(null)} className="text-gray-400 hover:text-gray-700"><ChevronLeft className="size-5"/></button>}
              {activeFolderId && activeFolder ? (() => { const c = getColor(activeFolder.color); return <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center`}><FolderOpen className={`size-5 ${c.text}`}/></div>; })() : (
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center"><Brain className="size-5 text-purple-600"/></div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{activeFolderId ? activeFolder?.name : "Mente Livre"}</h1>
                <p className="text-xs text-gray-400 mt-0.5">{activeFolderId ? `${currentNotes.length} ${currentNotes.length===1?"nota":"notas"}` : "Central de Pensamentos"}</p>
              </div>
            </div>
            {!activeFolderId && (
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={() => setView("capture")}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-100">
                <Wind className="size-4"/> Esvazie a mente
              </motion.button>
            )}
          </div>

          {!activeFolderId && folders.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Pastas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {folders.map((f,i) => (
                  <FolderCard key={f.id} folder={f} count={folderNotes(f.id).length} preview={folderNotes(f.id)[0]?.title} index={i}
                    onClick={() => setActiveFolderId(f.id)} onEdit={() => setEditingFolder(f)}
                    onDelete={() => confirmDelete("folder",f.id)}
                    onNewNote={() => { createNote(f.id); setActiveFolderId(f.id); }}/>
                ))}
              </div>
            </div>
          )}

          {currentNotes.length > 0 && (
            <div className="space-y-3">
              {!activeFolderId && <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Notas soltas</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {currentNotes.map((n,i) => (
                    <NoteCard key={n.id} note={n} folders={folders} index={i}
                      onClick={() => setEditingNote(n)} onDelete={() => confirmDelete("note",n.id)}
                      onMoveToFolder={(fid) => moveNote(n.id,fid)}/>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {currentNotes.length === 0 && activeFolderId && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="size-12 text-gray-200 mb-3"/>
              <p className="text-gray-400 text-sm">Esta pasta está vazia.</p>
              <button onClick={() => createNote(activeFolderId)} className="mt-3 text-purple-500 hover:text-purple-700 text-sm font-medium">+ Criar nota aqui</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-40">
        <AnimatePresence>
          {showFab && (
            <motion.div initial={{opacity:0,y:8,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:0.95}}
              className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-52">
              <button onClick={() => createNote(activeFolderId)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 text-left">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><FilePlus className="size-4 text-purple-600"/></div>
                <span className="text-sm font-medium text-gray-700">Nova nota</span>
              </button>
              <div className="h-px bg-gray-100"/>
              <button onClick={() => { setShowFab(false); setShowNewFolder(true); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 text-left">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><FolderPlus className="size-4 text-blue-600"/></div>
                <span className="text-sm font-medium text-gray-700">Nova pasta</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.95}} onClick={() => setShowFab(!showFab)}
          className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-xl flex items-center justify-center">
          <motion.div animate={{rotate:showFab?45:0}} transition={{duration:0.2}}><Plus className="size-6"/></motion.div>
        </motion.button>
      </div>
      {showFab && <div className="fixed inset-0 z-30" onClick={() => setShowFab(false)}/>}

      <AnimatePresence>
        {(showNewFolder||editingFolder) && (
          <FolderModal title={editingFolder?"Editar Pasta":"Nova Pasta"}
            initialName={editingFolder?.name??""} initialColor={editingFolder?.color??"blue"}
            onClose={() => { setShowNewFolder(false); setEditingFolder(null); }}
            onSave={(name,color) => {
              if (editingFolder) { setFolders((p) => p.map((f) => f.id===editingFolder.id?{...f,name,color}:f)); setEditingFolder(null); }
              else { setFolders((p) => [...p,{id:Date.now().toString(),name,color}]); setShowNewFolder(false); }
            }}/>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingNote && <EditNoteModal note={editingNote} folders={folders} onClose={() => setEditingNote(null)} onSave={saveNote} onDelete={(id) => confirmDelete("note",id)}/>}
      </AnimatePresence>
      <AnimatePresence>
        {deleteConfirm && <ConfirmDeleteModal type={deleteConfirm.type} onCancel={() => setDeleteConfirm(null)} onConfirm={executeDelete}/>}
      </AnimatePresence>
    </>
  );
}

// ─── ConfirmDeleteModal ───────────────────────────────────────────────────────

function ConfirmDeleteModal({ type, onCancel, onConfirm }: { type:"note"|"folder"; onCancel:()=>void; onConfirm:()=>void }) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onCancel}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:0.9,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9,y:12}}
        transition={{type:"spring",stiffness:350,damping:28}} onClick={(e)=>e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="size-7 text-red-500"/></div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{type==="note"?"Excluir nota?":"Excluir pasta?"}</h3>
        <p className="text-sm text-gray-500 mb-6">
          {type==="note" ? "Esta nota será excluída permanentemente." : "A pasta e todas as suas notas serão excluídas permanentemente."}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm">Excluir</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── FolderCard ───────────────────────────────────────────────────────────────

function FolderCard({ folder, count, preview, index, onClick, onEdit, onDelete, onNewNote }: {
  folder:NoteFolder; count:number; preview?:string; index:number;
  onClick:()=>void; onEdit:()=>void; onDelete:()=>void; onNewNote:()=>void;
}) {
  const cfg = getColor(folder.color);
  const [menu, setMenu] = useState(false);
  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:index*0.05}} className="group relative">
      <button onClick={onClick} className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden text-left">
        <div className={`h-2 w-full ${cfg.bar}`}/>
        <div className="p-4">
          <p className="text-2xl font-bold text-gray-900 mb-1">{count}</p>
          {preview && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{preview}</p>}
          <p className="text-sm font-semibold text-gray-700">{folder.name}</p>
        </div>
      </button>
      <div className="absolute top-3 right-3 z-10">
        <button onClick={(e) => { e.stopPropagation(); setMenu(!menu); }}
          className="w-7 h-7 bg-white/90 border border-gray-200 rounded-full hidden group-hover:flex items-center justify-center shadow-sm text-gray-400 hover:text-gray-700">
          <MoreVertical className="size-3.5"/>
        </button>
        <AnimatePresence>
          {menu && (<>
            <div className="fixed inset-0 z-10" onClick={() => setMenu(false)}/>
            <motion.div initial={{opacity:0,scale:0.95,y:-4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:-4}}
              className="absolute top-8 right-0 z-20 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden w-40">
              <button onClick={() => { onEdit(); setMenu(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-gray-50 text-sm text-gray-700 text-left"><Pencil className="size-3.5 text-gray-400"/>Editar</button>
              <button onClick={() => { onNewNote(); setMenu(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-gray-50 text-sm text-gray-700 text-left"><FilePlus className="size-3.5 text-gray-400"/>Nova nota</button>
              <div className="h-px bg-gray-100"/>
              <button onClick={() => { onDelete(); setMenu(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-red-50 text-sm text-red-500 text-left"><Trash2 className="size-3.5"/>Excluir</button>
            </motion.div>
          </>)}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── NoteCard ─────────────────────────────────────────────────────────────────

function NoteCard({ note, folders, index, onClick, onDelete, onMoveToFolder }: {
  note:Note; folders:NoteFolder[]; index:number;
  onClick:()=>void; onDelete:()=>void; onMoveToFolder:(f:string|null)=>void;
}) {
  const [menu, setMenu] = useState(false);
  const fn = folders.find((f) => f.id === note.folderId);
  const cfg = fn ? getColor(fn.color) : null;
  return (
    <motion.div layout initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.95}} transition={{delay:index*0.04}}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      <div className="p-5 min-h-[140px] flex flex-col">
        <p className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{note.title||"Nota sem título"}</p>
        {blocksPreview(note.blocks) && <p className="text-xs text-gray-400 line-clamp-4 leading-relaxed flex-1">{blocksPreview(note.blocks)}</p>}
      </div>
      <div className="px-5 pb-4 flex items-center justify-between">
        <span className="text-xs text-gray-300">{fmtDate(note.createdAt)}</span>
        {fn && cfg && <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{fn.name}</span>}
      </div>
      <div className="absolute top-3 right-3 z-20">
        <button onClick={(e) => { e.stopPropagation(); setMenu(!menu); }}
          className="w-7 h-7 bg-white/95 border border-gray-200 rounded-full hidden group-hover:flex items-center justify-center shadow-sm text-gray-400 hover:text-gray-700">
          <MoreVertical className="size-3.5"/>
        </button>
        <AnimatePresence>
          {menu && (<>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenu(false); }}/>
            <motion.div initial={{opacity:0,scale:0.95,y:-4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:-4}}
              className="absolute top-8 right-0 z-[100] bg-white rounded-xl shadow-2xl border border-gray-100 w-48" onClick={(e)=>e.stopPropagation()}>
              <div className="px-3 pt-3 pb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Mover para pasta</p>
                <div className="space-y-0.5">
                  {note.folderId && (
                    <button onClick={(e) => { e.stopPropagation(); onMoveToFolder(null); setMenu(false); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg text-xs text-gray-600 text-left">
                      <FileText className="size-3 text-gray-400 flex-shrink-0"/><span>Remover da pasta</span>
                    </button>
                  )}
                  {folders.filter((f) => f.id!==note.folderId).map((f) => { const fc=getColor(f.color); return (
                    <button key={f.id} onClick={(e) => { e.stopPropagation(); onMoveToFolder(f.id); setMenu(false); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg text-xs text-gray-700 text-left">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${fc.bar}`}/><span>{f.name}</span>
                    </button>
                  ); })}
                </div>
              </div>
              <div className="h-px bg-gray-100"/>
              <div className="p-1.5">
                <button onClick={(e) => { e.stopPropagation(); onDelete(); setMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 text-sm text-red-500 rounded-lg text-left">
                  <Trash2 className="size-3.5 flex-shrink-0"/><span>Excluir nota</span>
                </button>
              </div>
            </motion.div>
          </>)}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── FolderModal ──────────────────────────────────────────────────────────────

function FolderModal({ title, initialName, initialColor, onClose, onSave }: {
  title:string; initialName:string; initialColor:string; onClose:()=>void; onSave:(n:string,c:string)=>void;
}) {
  const [name,setName]=useState(initialName); const [color,setColor]=useState(initialColor);
  useEffect(() => { const fn=(e:any)=>{if(e.key==="Escape")onClose();}; window.addEventListener("keydown",fn); return ()=>window.removeEventListener("keydown",fn); },[onClose]);
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:0.95,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:12}}
        transition={{type:"spring",stiffness:320,damping:28}} onClick={(e)=>e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400"><X className="size-5"/></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <input autoFocus value={name} onChange={(e)=>setName(e.target.value)}
            onKeyDown={(e)=>{if(e.key==="Enter"&&name.trim())onSave(name,color);}}
            placeholder="Nome da pasta" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm"/>
          <div><p className="text-xs font-semibold text-gray-500 mb-2">Cor</p>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map((c)=>(
                <button key={c.key} onClick={()=>setColor(c.key)}
                  className={`w-8 h-8 rounded-full ${c.bar} transition-transform ${color===c.key?"scale-125 ring-2 ring-offset-2 ring-gray-400":"hover:scale-110"}`}/>
              ))}
            </div>
          </div>
          {name && <div className={`flex items-center gap-3 px-4 py-3 ${getColor(color).bg} rounded-xl`}>
            <div className={`w-2 h-8 rounded-full ${getColor(color).bar}`}/>
            <p className={`font-semibold text-sm ${getColor(color).text}`}>{name}</p>
          </div>}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
          <button onClick={()=>{if(name.trim())onSave(name,color);}} disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm disabled:opacity-40">Salvar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EDITOR BASEADO EM BLOCOS — sem contentEditable, sem bugs
// ═════════════════════════════════════════════════════════════════════════════

function EditNoteModal({ note, folders, onClose, onSave, onDelete }: {
  note:Note; folders:NoteFolder[];
  onClose:()=>void; onSave:(id:string,title:string,blocks:Block[])=>void; onDelete:(id:string)=>void;
}) {
  const [title, setTitle]     = useState(note.title);
  const [blocks, setBlocks]   = useState<Block[]>(note.blocks.length ? note.blocks : [mkBlock()]);
  const [focusId, setFocusId] = useState<string|null>(note.blocks[0]?.id ?? null);
  const [openMenu, setOpenMenu] = useState<"size"|"color"|"bg"|null>(null);

  const activeFmt = blocks.find((b) => b.id === focusId)?.format ?? mkFormat();
  const activeType = blocks.find((b) => b.id === focusId)?.type ?? "paragraph";

  const folder = folders.find((f) => f.id === note.folderId);
  const cfg    = folder ? getColor(folder.color) : null;

  useEffect(() => {
    const fn = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") handleSave(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [blocks, title]);

  const handleSave = () => onSave(note.id, title, blocks.filter((b) => b.text.trim() !== "" || b.type === "checkbox"));

  // Atualiza texto de um bloco
  const updateText = useCallback((id: string, text: string) => {
    setBlocks((p) => p.map((b) => b.id === id ? { ...b, text } : b));
  }, []);

  // Aplica formato apenas ao bloco focado
  const applyFmt = (fmt: Partial<TextFormat>) => {
    if (!focusId) return;
    setBlocks((p) => p.map((b) => b.id === focusId ? { ...b, format: { ...b.format, ...fmt } } : b));
    setOpenMenu(null);
  };

  // Muda tipo do bloco focado
  const applyType = (type: BlockType) => {
    if (!focusId) return;
    setBlocks((p) => p.map((b) => b.id === focusId ? { ...b, type, checked: false } : b));
  };

  // Insere novo bloco após o atual
  const insertAfter = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      const cur = prev[idx];
      const nb  = mkBlock({ type: cur.type === "checkbox" ? "checkbox" : cur.type, format: { ...cur.format } });
      const next = [...prev.slice(0, idx+1), nb, ...prev.slice(idx+1)];
      setFocusId(nb.id);
      return next;
    });
  }, []);

  // Remove bloco (se vazio e não único)
  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      if (prev.length <= 1) { return prev.map((b) => b.id === id ? { ...b, text: "" } : b); }
      const idx   = prev.findIndex((b) => b.id === id);
      const prevId = prev[idx-1]?.id ?? prev[idx+1]?.id;
      setFocusId(prevId ?? null);
      return prev.filter((b) => b.id !== id);
    });
  }, []);

  // Toggle checkbox — reordena pendentes antes de concluídos
  const toggleCheck = useCallback((id: string) => {
    setBlocks((prev) => {
      const updated = prev.map((b) => b.id === id ? { ...b, checked: !b.checked } : b);
      // Separa checkboxes dos outros blocos mantendo posição relativa
      const result: Block[] = [];
      const pending:  Block[] = [];
      const done:     Block[] = [];
      updated.forEach((b) => {
        if (b.type !== "checkbox") result.push(b);
        else if (!b.checked)       pending.push(b);
        else                       done.push(b);
      });
      // Reconstrói: não-checkbox na posição original, checkboxes reordenados no final
      const checkboxResult = [...pending, ...done];
      const final: Block[] = [];
      let ci = 0;
      updated.forEach((b) => {
        if (b.type !== "checkbox") final.push(b);
        else final.push(checkboxResult[ci++]);
      });
      return final;
    });
  }, []);

  const ToolBtn = ({ active, onClick, children, t }: { active?:boolean; onClick:()=>void; children:React.ReactNode; t?:string }) => (
    <button onMouseDown={(e) => { e.preventDefault(); onClick(); }} title={t}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 text-sm
        ${active ? "bg-purple-100 text-purple-700 ring-1 ring-purple-200" : "hover:bg-gray-100 text-gray-500"}`}>
      {children}
    </button>
  );

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={handleSave}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:0.95,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:12}}
        transition={{type:"spring",stiffness:320,damping:28}} onClick={(e)=>e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col" style={{height:"80vh"}}>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Título da nota"
            className="flex-1 text-base font-bold text-gray-900 focus:outline-none placeholder-gray-300"/>
          <div className="flex items-center gap-1">
            {folder&&cfg&&<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text} mr-1`}>{folder.name}</span>}
            <button onMouseDown={(e)=>{e.preventDefault();onDelete(note.id);}} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-400"><Trash2 className="size-4"/></button>
            <button onClick={handleSave} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400"><X className="size-5"/></button>
          </div>
        </div>

        {/* Toolbar centralizada */}
        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-center gap-0.5 flex-wrap flex-shrink-0">

          {/* Tamanho da fonte */}
          <div className="relative">
            <button onMouseDown={(e)=>{e.preventDefault();setOpenMenu(openMenu==="size"?null:"size");}}
              className="flex items-center gap-1 px-2 h-8 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 flex-shrink-0">
              <Type className="size-3.5"/><span className="w-8">{activeFmt.size}</span>
            </button>
            <AnimatePresence>
              {openMenu==="size"&&(<>
                <div className="fixed inset-0 z-10" onMouseDown={()=>setOpenMenu(null)}/>
                <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
                  className="absolute top-10 left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-24 max-h-56 overflow-y-auto">
                  {FONT_SIZES.map((s)=>(
                    <button key={s} onMouseDown={(e)=>{e.preventDefault();applyFmt({size:s});}}
                      className={`w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 ${activeFmt.size===s?"text-purple-600 font-bold":"text-gray-700"}`}>{s}</button>
                  ))}
                </motion.div>
              </>)}
            </AnimatePresence>
          </div>

          <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0"/>
          <ToolBtn active={activeFmt.bold}      onClick={()=>applyFmt({bold:!activeFmt.bold})}           t="Negrito"><Bold className="size-3.5"/></ToolBtn>
          <ToolBtn active={activeFmt.italic}    onClick={()=>applyFmt({italic:!activeFmt.italic})}       t="Itálico"><Italic className="size-3.5"/></ToolBtn>
          <ToolBtn active={activeFmt.underline} onClick={()=>applyFmt({underline:!activeFmt.underline})} t="Sublinhado"><Underline className="size-3.5"/></ToolBtn>
          <ToolBtn active={activeFmt.strike}    onClick={()=>applyFmt({strike:!activeFmt.strike})}       t="Riscado"><Strikethrough className="size-3.5"/></ToolBtn>

          <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0"/>
          <ToolBtn active={activeFmt.align==="left"}   onClick={()=>applyFmt({align:"left"})}   t="Esquerda"><AlignLeft className="size-3.5"/></ToolBtn>
          <ToolBtn active={activeFmt.align==="center"} onClick={()=>applyFmt({align:"center"})} t="Centralizar"><AlignCenter className="size-3.5"/></ToolBtn>
          <ToolBtn active={activeFmt.align==="right"}  onClick={()=>applyFmt({align:"right"})}  t="Direita"><AlignRight className="size-3.5"/></ToolBtn>

          <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0"/>
          <ToolBtn active={activeType==="bullet"}   onClick={()=>applyType(activeType==="bullet"  ?"paragraph":"bullet"  )} t="Lista"><List className="size-3.5"/></ToolBtn>
          <ToolBtn active={activeType==="ordered"}  onClick={()=>applyType(activeType==="ordered" ?"paragraph":"ordered" )} t="Numerada"><ListOrdered className="size-3.5"/></ToolBtn>
          <ToolBtn active={activeType==="checkbox"} onClick={()=>applyType(activeType==="checkbox"?"paragraph":"checkbox")} t="Checkbox"><CheckIcon className="size-3.5"/></ToolBtn>

          <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0"/>

          {/* Cor da fonte */}
          <div className="relative">
            <button onMouseDown={(e)=>{e.preventDefault();setOpenMenu(openMenu==="color"?null:"color");}}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg" title="Cor da fonte">
              <div className="flex flex-col items-center gap-0.5">
                <Palette className="size-3.5 text-gray-500"/>
                <div className="w-4 h-1 rounded-full" style={{backgroundColor:activeFmt.color}}/>
              </div>
            </button>
            <AnimatePresence>
              {openMenu==="color"&&(<>
                <div className="fixed inset-0 z-10" onMouseDown={()=>setOpenMenu(null)}/>
                <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
                  className="absolute top-10 left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl shadow-xl border border-gray-100 p-3 w-44">
                  <p className="text-xs text-gray-400 font-medium mb-2">Cor da fonte</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {FONT_COLORS.map((c)=>(
                      <button key={c} onMouseDown={(e)=>{e.preventDefault();applyFmt({color:c});}}
                        className={`w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform ${activeFmt.color===c?"border-purple-500 scale-110":"border-gray-200"}`}
                        style={{backgroundColor:c}}/>
                    ))}
                  </div>
                </motion.div>
              </>)}
            </AnimatePresence>
          </div>

          {/* Cor de fundo */}
          <div className="relative">
            <button onMouseDown={(e)=>{e.preventDefault();setOpenMenu(openMenu==="bg"?null:"bg");}}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg" title="Fundo do texto">
              <div className="flex flex-col items-center gap-0.5">
                <Highlighter className="size-3.5 text-gray-500"/>
                <div className="w-4 h-1 rounded-full border border-gray-200"
                  style={{backgroundColor:activeFmt.bg==="transparent"?"#fff":activeFmt.bg}}/>
              </div>
            </button>
            <AnimatePresence>
              {openMenu==="bg"&&(<>
                <div className="fixed inset-0 z-10" onMouseDown={()=>setOpenMenu(null)}/>
                <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
                  className="absolute top-10 left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl shadow-xl border border-gray-100 p-3 w-44">
                  <p className="text-xs text-gray-400 font-medium mb-2">Fundo do texto</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BG_COLORS.map((c)=>(
                      <button key={c.v} onMouseDown={(e)=>{e.preventDefault();applyFmt({bg:c.v});}}
                        className={`flex items-center justify-center h-8 rounded-lg border-2 hover:scale-105 transition-transform text-xs font-medium text-gray-500 ${activeFmt.bg===c.v?"border-purple-400":"border-gray-200"}`}
                        style={{backgroundColor:c.v==="transparent"?"#fff":c.v}} title={c.l}>
                        {c.v==="transparent"?"∅":""}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>)}
            </AnimatePresence>
          </div>
        </div>

        {/* Área de blocos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-0.5"
          onClick={() => { if (blocks.length) setFocusId(blocks[blocks.length-1].id); }}>
          {blocks.map((block, idx) => (
            <BlockRow key={block.id} block={block} index={idx} isFocused={focusId===block.id}
              onFocus={() => setFocusId(block.id)}
              onChange={(t) => updateText(block.id, t)}
              onEnter={() => insertAfter(block.id)}
              onDelete={() => removeBlock(block.id)}
              onToggle={() => toggleCheck(block.id)}
            />
          ))}
        </div>

        <div className="px-6 pb-5 flex-shrink-0">
          <button onClick={handleSave} className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors">Salvar nota</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── BlockRow ─────────────────────────────────────────────────────────────────

function BlockRow({ block, index, isFocused, onFocus, onChange, onEnter, onDelete, onToggle }: {
  block:Block; index:number; isFocused:boolean;
  onFocus:()=>void; onChange:(t:string)=>void;
  onEnter:()=>void; onDelete:()=>void; onToggle:()=>void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize: ajusta altura ao conteúdo
  const resize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => { resize(); }, [block.text, block.format.size]);

  useEffect(() => {
    if (isFocused && taRef.current && document.activeElement !== taRef.current) {
      taRef.current.focus();
      const len = taRef.current.value.length;
      taRef.current.setSelectionRange(len, len);
    }
  }, [isFocused]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey)          { e.preventDefault(); onEnter(); }
    else if (e.key === "Backspace" && !block.text) { e.preventDefault(); onDelete(); }
  };

  const { format: f, type, checked } = block;

  const style: React.CSSProperties = {
    fontWeight:      f.bold    ? "700"    : "400",
    fontStyle:       f.italic  ? "italic" : "normal",
    textDecoration: checked
      ? "line-through"
      : [f.underline && "underline", f.strike && "line-through"].filter(Boolean).join(" ") || "none",
    textAlign:       f.align,
    fontSize:        f.size,
    color:           checked ? "#9ca3af" : f.color,
    backgroundColor: f.bg === "transparent" ? undefined : f.bg,
    resize:          "none",
    overflow:        "hidden",
    lineHeight:      "1.65",
    wordBreak:       "break-word",
    whiteSpace:      "pre-wrap",
  };

  return (
    <div className={`flex items-start gap-2 py-0.5 px-1 rounded-lg ${isFocused ? "bg-gray-50/60" : ""}`}
      onClick={(e) => { e.stopPropagation(); onFocus(); }}>

      {/* Prefixo por tipo */}
      {type === "bullet"   && <span className="text-gray-400 select-none w-4 flex-shrink-0 mt-1 leading-none" style={{fontSize:f.size}}>•</span>}
      {type === "ordered"  && <span className="text-gray-400 select-none w-5 flex-shrink-0 mt-1 text-right leading-none" style={{fontSize:f.size}}>{index+1}.</span>}
      {type === "checkbox" && (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); onToggle(); }}
          className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-colors ${
            checked ? "bg-purple-600 border-purple-600" : "border-gray-400 hover:border-purple-400"}`}>
          {checked && (
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      )}

      {/* FIX: textarea em vez de input — quebra linha, seleção livre, sem placeholder */}
      <textarea
        ref={taRef}
        value={block.text}
        rows={1}
        onChange={(e) => { onChange(e.target.value); resize(); }}
        onKeyDown={onKey}
        onFocus={onFocus}
        placeholder=""
        className="flex-1 bg-transparent focus:outline-none min-w-0 block"
        style={style}
      />
    </div>
  );
}
