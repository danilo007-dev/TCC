import { useState, useRef, useEffect } from "react";
import { Target, Plus, Trash2, Check, ChevronRight, X, Flag, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: "short" | "long";
  steps: string[];
  completedSteps: number;
}

const INITIAL_GOALS: Goal[] = [
  {
    id: "1",
    title: "Terminar curso de React",
    description: "Finalizar todos os módulos e projetos práticos",
    progress: 60,
    type: "short",
    steps: ["Módulo 1", "Módulo 2", "Módulo 3", "Projeto Final"],
    completedSteps: 2,
  },
  {
    id: "2",
    title: "Ler 12 livros este ano",
    description: "Um livro por mês",
    progress: 25,
    type: "long",
    steps: ["Livro 1", "Livro 2", "Livro 3", "...12 livros"],
    completedSteps: 3,
  },
  {
    id: "3",
    title: "Organizar rotina de exercícios",
    description: "Exercícios 3x por semana",
    progress: 40,
    type: "short",
    steps: ["Escolher atividade", "Definir horários", "Primeira semana", "Manter consistência"],
    completedSteps: 1,
  },
];

export function Goals() {
  const [goals, setGoals]       = useState<Goal[]>(INITIAL_GOALS);
  const [showModal, setShowModal] = useState(false);

  const deleteGoal = (id: string) => setGoals((prev) => prev.filter((g) => g.id !== id));

  const addGoal = (goal: Goal) => {
    setGoals((prev) => [...prev, goal]);
    setShowModal(false);
  };

  const shortGoals = goals.filter((g) => g.type === "short");
  const longGoals  = goals.filter((g) => g.type === "long");

  return (
    <>
      <div className="space-y-6">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-green-100 p-2 rounded-xl">
                <Target className="size-5 text-green-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Metas</h1>
            </div>
            <p className="text-gray-500 text-sm ml-1">
              Objetivos de curto e longo prazo. Divida em passos pequenos.
            </p>
          </div>

          {/* Botão Nova Meta — canto superior direito */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm flex-shrink-0"
          >
            <Plus className="size-4" />
            Nova Meta
          </button>
        </div>

        {/* ── HINT ── */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-sm">💡</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Metas grandes? Divida em passos</p>
            <p className="text-xs text-blue-700 mt-0.5">Cérebros com TDAH funcionam melhor com objetivos pequenos e claros.</p>
          </div>
        </div>

        {/* ── DUAS COLUNAS ── */}
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Target className="size-14 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Nenhuma meta criada ainda.</p>
            <p className="text-sm text-gray-400 mt-1">Defina um objetivo e divida em passos pequenos.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              <Plus className="size-4" />
              Criar primeira meta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* COLUNA ESQUERDA — Curto Prazo */}
            <div className="space-y-4">
              {/* Cabeçalho da coluna */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Flag className="size-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Curto Prazo</h2>
                  <p className="text-xs text-gray-400">{shortGoals.length} {shortGoals.length === 1 ? "meta" : "metas"}</p>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                <AnimatePresence>
                  {shortGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onDelete={deleteGoal} />
                  ))}
                </AnimatePresence>

                {shortGoals.length === 0 && (
                  <div className="border-2 border-dashed border-green-200 rounded-2xl p-8 text-center">
                    <p className="text-sm text-gray-400">Nenhuma meta de curto prazo</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-3 text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      + Adicionar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA — Longo Prazo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Rocket className="size-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Longo Prazo</h2>
                  <p className="text-xs text-gray-400">{longGoals.length} {longGoals.length === 1 ? "meta" : "metas"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {longGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onDelete={deleteGoal} />
                  ))}
                </AnimatePresence>

                {longGoals.length === 0 && (
                  <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center">
                    <p className="text-sm text-gray-400">Nenhuma meta de longo prazo</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Adicionar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <NewGoalModal onClose={() => setShowModal(false)} onSave={addGoal} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Card de meta ─────────────────────────────────────────────────────────────

function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isShort = goal.type === "short";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className={`rounded-2xl p-5 border-2 ${
        isShort ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isShort ? "bg-green-100" : "bg-blue-100"
        }`}>
          <Target className={`size-5 ${isShort ? "text-green-600" : "text-blue-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{goal.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{goal.description}</p>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Progresso */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600">{goal.progress}% concluído</span>
          <span className="text-xs text-gray-400">{goal.completedSteps}/{goal.steps.length} passos</span>
        </div>
        <div className="w-full bg-white rounded-full h-2.5 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isShort
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-blue-500 to-cyan-500"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Ver passos */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
          isShort ? "text-green-700 hover:text-green-900" : "text-blue-700 hover:text-blue-900"
        }`}
      >
        <span>{isExpanded ? "Ocultar passos" : "Ver passos"}</span>
        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="size-3.5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 pt-3 mt-1 border-t border-white/60"
          >
            {goal.steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2.5 py-1.5 px-3 bg-white/70 rounded-xl">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  index < goal.completedSteps ? "bg-green-500 border-green-500" : "border-gray-300"
                }`}>
                  {index < goal.completedSteps && <Check className="size-2.5 text-white" />}
                </div>
                <span className={`text-xs ${
                  index < goal.completedSteps ? "line-through text-gray-400" : "text-gray-700"
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Modal de Nova Meta ───────────────────────────────────────────────────────

function NewGoalModal({ onClose, onSave }: { onClose: () => void; onSave: (g: Goal) => void }) {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [type, setType]             = useState<"short" | "long">("short");
  const [steps, setSteps]           = useState<string[]>(["", ""]);
  const [error, setError]           = useState("");
  const titleRef                    = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const updateStep = (i: number, val: string) =>
    setSteps((prev) => prev.map((s, idx) => idx === i ? val : s));

  const addStep = () => setSteps((prev) => [...prev, ""]);

  const removeStep = (i: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = () => {
    if (!title.trim()) { setError("Dê um nome para a meta."); return; }
    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) { setError("Adicione pelo menos um passo."); return; }

    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || "Meta criada pelo usuário",
      progress: 0,
      type,
      steps: validSteps,
      completedSteps: 0,
    });
  };

  const isShort = type === "short";

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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Nova Meta</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X className="size-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Tipo */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Tipo de meta</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setType("short")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                  isShort
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Flag className="size-4" />
                Curto prazo
              </button>
              <button
                onClick={() => setType("long")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                  !isShort
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Rocket className="size-4" />
                Longo prazo
              </button>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Nome da meta <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="Ex: Aprender inglês"
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
              placeholder="Ex: Chegar ao nível B2"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm transition-colors"
            />
          </div>

          {/* Passos */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Passos <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                    isShort ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                  }`}>
                    {i + 1}
                  </span>
                  <input
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStep(); } }}
                    placeholder={`Passo ${i + 1}`}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm transition-colors"
                  />
                  <button
                    onClick={() => removeStep(i)}
                    disabled={steps.length <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-400 text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <X className="size-4" />
                  </button>
                </motion.div>
              ))}
            </div>
            <button
              onClick={addStep}
              className={`mt-2.5 flex items-center gap-1.5 text-sm font-medium px-2 py-1.5 rounded-lg transition-colors ${
                isShort
                  ? "text-green-600 hover:bg-green-50"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
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
            className={`flex-1 py-3 rounded-xl text-white font-semibold transition-colors text-sm shadow-lg ${
              isShort
                ? "bg-green-600 hover:bg-green-700 shadow-green-100"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
            }`}
          >
            Criar meta
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
