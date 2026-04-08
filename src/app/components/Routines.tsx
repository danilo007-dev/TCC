import { useState, useRef, useEffect } from "react";
import {
  Star, Sun, Moon, Dumbbell, Code, Pill, BookOpen,
  Plus, ArrowLeft, CheckCircle2, Circle, RotateCcw,
  Play, X, Trash2, Clock, Coffee, Wand2, Heart,
  Zap, Target, Music, Smartphone, Leaf, Sparkles,
  Paintbrush, Briefcase, Home, UtensilsCrossed,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HelpfulHint } from "./HelpfulHint";
import confetti from "canvas-confetti";
import { Routine } from "../types";
import { routinesRepository } from "../repositories/routinesRepository";

// ─── Paleta de cores ──────────────────────────────────────────────────────────

const COLOR_OPTIONS: { key: string; bg: string; iconBg: string; text: string; ring: string; dot: string }[] = [
  { key: "purple", bg: "bg-purple-100", iconBg: "bg-purple-100", text: "text-purple-600", ring: "ring-purple-500",  dot: "bg-purple-400"  },
  { key: "blue",   bg: "bg-blue-100",   iconBg: "bg-blue-100",   text: "text-blue-600",   ring: "ring-blue-500",    dot: "bg-blue-400"    },
  { key: "pink",   bg: "bg-pink-100",   iconBg: "bg-pink-100",   text: "text-pink-600",   ring: "ring-pink-500",    dot: "bg-pink-400"    },
  { key: "green",  bg: "bg-green-100",  iconBg: "bg-green-100",  text: "text-green-600",  ring: "ring-green-500",   dot: "bg-green-400"   },
  { key: "yellow", bg: "bg-yellow-100", iconBg: "bg-yellow-100", text: "text-yellow-600", ring: "ring-yellow-500",  dot: "bg-yellow-400"  },
  { key: "orange", bg: "bg-orange-100", iconBg: "bg-orange-100", text: "text-orange-600", ring: "ring-orange-500",  dot: "bg-orange-400"  },
  { key: "red",    bg: "bg-red-100",    iconBg: "bg-red-100",    text: "text-red-600",    ring: "ring-red-500",     dot: "bg-red-400"     },
  { key: "teal",   bg: "bg-teal-100",   iconBg: "bg-teal-100",   text: "text-teal-600",   ring: "ring-teal-500",    dot: "bg-teal-400"    },
];

const getColor = (key: string) => COLOR_OPTIONS.find((c) => c.key === key) ?? COLOR_OPTIONS[0];

// ─── Ícones disponíveis ────────────────────────────────────────────────────────

const ICON_OPTIONS: { key: string; icon: React.ReactNode }[] = [
  { key: "star",       icon: <Star          className="size-5" /> },
  { key: "coffee",     icon: <Coffee        className="size-5" /> },
  { key: "wand",       icon: <Wand2         className="size-5" /> },
  { key: "book",       icon: <BookOpen      className="size-5" /> },
  { key: "moon",       icon: <Moon          className="size-5" /> },
  { key: "sun",        icon: <Sun           className="size-5" /> },
  { key: "heart",      icon: <Heart         className="size-5" /> },
  { key: "zap",        icon: <Zap           className="size-5" /> },
  { key: "target",     icon: <Target        className="size-5" /> },
  { key: "music",      icon: <Music         className="size-5" /> },
  { key: "phone",      icon: <Smartphone    className="size-5" /> },
  { key: "leaf",       icon: <Leaf          className="size-5" /> },
  { key: "sparkles",   icon: <Sparkles      className="size-5" /> },
  { key: "paint",      icon: <Paintbrush    className="size-5" /> },
  { key: "code",       icon: <Code          className="size-5" /> },
  { key: "briefcase",  icon: <Briefcase     className="size-5" /> },
  { key: "home",       icon: <Home          className="size-5" /> },
  { key: "food",       icon: <UtensilsCrossed className="size-5" /> },
  { key: "pill",       icon: <Pill          className="size-5" /> },
  { key: "clock",      icon: <Clock         className="size-5" /> },
  { key: "calendar",   icon: <CalendarDays  className="size-5" /> },
  { key: "dumbbell",   icon: <Dumbbell      className="size-5" /> },
];

const ICON_MAP: Record<string, React.ReactNode> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.key, o.icon])
);

// ─── Dados iniciais ────────────────────────────────────────────────────────────

const INITIAL_ROUTINES: Routine[] = [
  {
    id: "1", title: "Rotina Matinal", description: "Comece o dia com energia e foco",
    icon: "sun", colorKey: "green", isFavorite: true,
    steps: [
      { id: "1-1", title: "Beber um copo d'água",        duration: "1 min",  completed: false },
      { id: "1-2", title: "Alongamento leve",             duration: "5 min",  completed: false },
      { id: "1-3", title: "Tomar café da manhã",          duration: "15 min", completed: false },
      { id: "1-4", title: "Revisar tarefas do dia",       duration: "5 min",  completed: false },
    ],
  },
  {
    id: "2", title: "Exercícios", description: "Manter o corpo ativo",
    icon: "dumbbell", colorKey: "purple", isFavorite: true,
    steps: [
      { id: "2-1", title: "Aquecimento",                  duration: "5 min",  completed: false },
      { id: "2-2", title: "Treino principal",              duration: "30 min", completed: false },
      { id: "2-3", title: "Alongamento final",             duration: "5 min",  completed: false },
    ],
  },
  {
    id: "3", title: "Rotina Noturna", description: "Preparar para um bom sono",
    icon: "moon", colorKey: "pink", isFavorite: true,
    steps: [
      { id: "3-1", title: "Desligar telas",                duration: "—",      completed: false },
      { id: "3-2", title: "Higiene pessoal",               duration: "10 min", completed: false },
      { id: "3-3", title: "Leitura leve",                  duration: "15 min", completed: false },
      { id: "3-4", title: "Definir intenção para amanhã",  duration: "5 min",  completed: false },
    ],
  },
  {
    id: "4", title: "Estudos", description: "Aprendizado focado",
    icon: "book", colorKey: "blue", isFavorite: false,
    steps: [
      { id: "4-1", title: "Separar o material",            duration: "2 min",  completed: false },
      { id: "4-2", title: "Sessão de estudo",              duration: "25 min", completed: false },
      { id: "4-3", title: "Revisar anotações",             duration: "5 min",  completed: false },
    ],
  },
  {
    id: "5", title: "Trabalho Focado", description: "Sessão de deep work",
    icon: "code", colorKey: "yellow", isFavorite: false,
    steps: [
      { id: "5-1", title: "Fechar redes sociais",          duration: "1 min",  completed: false },
      { id: "5-2", title: "Definir a tarefa principal",    duration: "2 min",  completed: false },
      { id: "5-3", title: "Trabalhar sem interrupções",    duration: "45 min", completed: false },
    ],
  },
  {
    id: "6", title: "Medicação", description: "Não esquecer os remédios",
    icon: "pill", colorKey: "red", isFavorite: false,
    steps: [
      { id: "6-1", title: "Pegar o remédio",               duration: "1 min",  completed: false },
      { id: "6-2", title: "Tomar com água",                duration: "1 min",  completed: false },
      { id: "6-3", title: "Marcar no aplicativo",          duration: "1 min",  completed: false },
    ],
  },
];

// ─── Componente principal ──────────────────────────────────────────────────────

export function Routines() {
  const [routines, setRoutines]     = useState<Routine[]>(INITIAL_ROUTINES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal]   = useState(false);

  useEffect(() => {
    if (!routinesRepository.isEnabled()) return;

    const hydrate = async () => {
      try {
        const remoteRoutines = await routinesRepository.fetchRoutines();
        if (remoteRoutines.length > 0) {
          setRoutines(remoteRoutines);
          return;
        }

        await Promise.all(INITIAL_ROUTINES.map((routine) => routinesRepository.upsertRoutine(routine)));
      } catch (error) {
        console.error("Failed to hydrate routines:", error);
      }
    };

    void hydrate();
  }, []);

  const syncRoutine = (routine: Routine) => {
    if (!routinesRepository.isEnabled()) return;
    void routinesRepository.upsertRoutine(routine).catch((error) => {
      console.error("Failed to sync routine:", error);
    });
  };

  const selectedRoutine = routines.find((r) => r.id === selectedId) ?? null;

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoutines((prev) => {
      const next = prev.map((r) => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r);
      const updated = next.find((r) => r.id === id);
      if (updated) syncRoutine(updated);
      return next;
    });
  };

  const toggleStep = (routineId: string, stepId: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== routineId) return r;
        const updated = r.steps.map((s) => s.id === stepId ? { ...s, completed: !s.completed } : s);
        if (updated.every((s) => s.completed)) {
          setTimeout(() => confetti({
            particleCount: 120, spread: 70, origin: { y: 0.6 },
            colors: ["#7c3aed", "#a855f7", "#ec4899", "#22c55e"],
          }), 100);
        }
        const nextRoutine = { ...r, steps: updated };
        syncRoutine(nextRoutine);
        return nextRoutine;
      })
    );
  };

  const resetRoutine = (routineId: string) => {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === routineId
          ? (() => {
              const nextRoutine = { ...r, steps: r.steps.map((s) => ({ ...s, completed: false })) };
              syncRoutine(nextRoutine);
              return nextRoutine;
            })()
          : r
      )
    );
  };

  const addRoutine = (routine: Routine) => {
    setRoutines((prev) => [...prev, routine]);
    setShowModal(false);
    syncRoutine(routine);
  };

  const favorites = routines.filter((r) => r.isFavorite);
  const all       = routines.filter((r) => !r.isFavorite);

  // ── TELA DE DETALHE ──────────────────────────────────────────────────────────
  if (selectedRoutine) {
    const cfg       = getColor(selectedRoutine.colorKey);
    const completed = selectedRoutine.steps.filter((s) => s.completed).length;
    const total     = selectedRoutine.steps.length;
    const progress  = total > 0 ? (completed / total) * 100 : 0;
    const allDone   = completed === total;

    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft className="size-5" />
          Rotinas
        </button>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl ${cfg.iconBg} ${cfg.text} flex items-center justify-center flex-shrink-0`}>
              {ICON_MAP[selectedRoutine.icon]}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{selectedRoutine.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{selectedRoutine.description}</p>
            </div>
            {completed > 0 && (
              <button
                onClick={() => resetRoutine(selectedRoutine.id)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <RotateCcw className="size-3.5" />
                Reiniciar
              </button>
            )}
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{completed} de {total} passos concluídos</span>
              <span className="text-sm font-semibold text-purple-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5 text-center"
            >
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-bold text-purple-900">Rotina concluída!</p>
              <p className="text-sm text-purple-700 mt-1">Você está indo muito bem!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide px-1">Passos</h2>
          {selectedRoutine.steps.map((step, i) => (
            <motion.button
              key={step.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => toggleStep(selectedRoutine.id, step.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all group
                ${step.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm"}`}
            >
              <div className={`flex-shrink-0 transition-colors ${step.completed ? "text-green-500" : "text-gray-300 group-hover:text-purple-400"}`}>
                {step.completed ? <CheckCircle2 className="size-6" /> : <Circle className="size-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium transition-colors ${step.completed ? "text-gray-400 line-through" : "text-gray-800"}`}>
                  {step.title}
                </p>
                {step.duration && <p className="text-xs text-gray-400 mt-0.5">{step.duration}</p>}
              </div>
              <span className={`text-xs font-semibold flex-shrink-0 ${step.completed ? "text-green-400" : "text-gray-300"}`}>
                {i + 1}/{total}
              </span>
            </motion.button>
          ))}
        </div>

        {completed === 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => toggleStep(selectedRoutine.id, selectedRoutine.steps[0].id)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold text-base transition-colors shadow-lg shadow-purple-100 flex items-center justify-center gap-2"
          >
            <Play className="size-5" />
            Começar rotina
          </motion.button>
        )}
      </motion.div>
    );
  }

  // ── TELA DE LISTA ─────────────────────────────────────────────────────────────
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Rotinas</h1>
            <p className="text-gray-500 mt-1">Organize suas atividades em rotinas reutilizáveis</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
          >
            <Plus className="size-4" />
            Nova Rotina
          </button>
        </div>

        <HelpfulHint>
          Rotinas ajudam seu cérebro a entrar no modo certo sem precisar pensar. Use-as todos os dias!
        </HelpfulHint>

        {favorites.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="size-5 text-amber-500 fill-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">Favoritas</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((routine, i) => (
                <RoutineCard key={routine.id} routine={routine} index={i}
                  onToggleFavorite={toggleFavorite} onClick={() => setSelectedId(routine.id)} />
              ))}
            </div>
          </div>
        )}

        {all.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Todas as Rotinas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {all.map((routine, i) => (
                <RoutineCard key={routine.id} routine={routine} index={i}
                  onToggleFavorite={toggleFavorite} onClick={() => setSelectedId(routine.id)} />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <NewRoutineModal onClose={() => setShowModal(false)} onSave={addRoutine} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface NewStep {
  id: string;
  title: string;
  duration: string;
}

function NewRoutineModal({ onClose, onSave }: { onClose: () => void; onSave: (r: Routine) => void }) {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("star");
  const [selectedColor, setSelectedColor] = useState("purple");
  const [steps, setSteps]           = useState<NewStep[]>([{ id: "new-1", title: "", duration: "" }]);
  const [error, setError]           = useState("");
  const titleRef                    = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const cfg = getColor(selectedColor);

  const addStep = () => setSteps((prev) => [...prev, { id: `new-${Date.now()}`, title: "", duration: "" }]);
  const updateStep = (id: string, field: "title" | "duration", value: string) =>
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  const removeStep = (id: string) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) { setError("Dê um nome para a rotina."); return; }
    const validSteps = steps.filter((s) => s.title.trim());
    if (validSteps.length === 0) { setError("Adicione pelo menos um passo."); return; }

    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || "Rotina personalizada",
      icon: selectedIcon,
      colorKey: selectedColor,
      isFavorite: false,
      steps: validSteps.map((s, i) => ({
        id: `${Date.now()}-${i}`,
        title: s.title.trim(),
        duration: s.duration.trim() || undefined,
        completed: false,
      })),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Preview do ícone com a cor escolhida */}
            <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} ${cfg.text} flex items-center justify-center transition-all`}>
              {ICON_MAP[selectedIcon]}
            </div>
            <h2 className="text-lg font-bold text-gray-900">Nova Rotina</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X className="size-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Cor */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedColor(c.key)}
                  className={`
                    w-8 h-8 rounded-full ${c.bg} transition-all
                    ${selectedColor === c.key ? `ring-2 ${c.ring} ring-offset-2 scale-110` : "hover:scale-105"}
                  `}
                  title={c.key}
                />
              ))}
            </div>
          </div>

          {/* Ícone */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">Ícone</label>
            <div className="grid grid-cols-7 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedIcon(opt.key)}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    ${selectedIcon === opt.key
                      ? `${cfg.iconBg} ${cfg.text} ring-2 ${cfg.ring} ring-offset-1`
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }
                  `}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Nome da rotina <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="Ex: Rotina da tarde"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm transition-colors"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Descrição <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Para relaxar e se preparar"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm transition-colors"
            />
          </div>

          {/* Passos */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Passos <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className={`w-6 h-6 rounded-full ${cfg.iconBg} ${cfg.text} text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors`}>
                    {i + 1}
                  </span>
                  <input
                    value={step.title}
                    onChange={(e) => updateStep(step.id, "title", e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStep(); } }}
                    placeholder={`Passo ${i + 1}`}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm transition-colors"
                  />
                  <div className="relative flex-shrink-0">
                    <Clock className="size-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      value={step.duration}
                      onChange={(e) => updateStep(step.id, "duration", e.target.value)}
                      placeholder="5 min"
                      className="w-20 pl-7 pr-2 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-xs transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => removeStep(step.id)}
                    disabled={steps.length <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-400 text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.div>
              ))}
            </div>
            <button
              onClick={addStep}
              className="mt-3 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-purple-50"
            >
              <Plus className="size-4" />
              Adicionar passo
            </button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 font-medium">
              {error}
            </motion.p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors text-sm shadow-lg shadow-purple-100"
          >
            Criar rotina
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function RoutineCard({
  routine, index, onToggleFavorite, onClick,
}: {
  routine: Routine;
  index: number;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const cfg         = getColor(routine.colorKey);
  const completed   = routine.steps.filter((s) => s.completed).length;
  const total       = routine.steps.length;
  const progress    = total > 0 ? (completed / total) * 100 : 0;
  const hasProgress = completed > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer relative group"
    >
      <button
        onClick={(e) => onToggleFavorite(routine.id, e)}
        className="absolute top-4 right-4 text-gray-300 hover:text-amber-400 transition-colors"
      >
        <Star className={`size-5 ${routine.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
      </button>

      <div className={`w-12 h-12 rounded-xl ${cfg.iconBg} ${cfg.text} flex items-center justify-center mb-4`}>
        {ICON_MAP[routine.icon]}
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 pr-6">{routine.title}</h3>
      <p className="text-sm text-gray-500 mb-3">{routine.description}</p>

      {hasProgress ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400">{completed}/{total} passos</span>
            <span className="text-xs font-semibold text-purple-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400">{total} passos</p>
      )}

      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">
        <Play className="size-4 fill-purple-400" />
      </div>
    </motion.div>
  );
}
