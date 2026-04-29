import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Plus, Sparkles, Target, Trash2, X } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  dream: string;
  createdAt: string;
}

const INITIAL_GOALS: Goal[] = [
  {
    id: "goal-1",
    title: "Entrar na faculdade",
    dream: "Quero construir uma carreira com mais liberdade e estabilidade.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "goal-2",
    title: "Cuidar melhor da saúde",
    dream: "Quero ter mais energia no dia a dia e me sentir bem no meu corpo.",
    createdAt: new Date().toISOString(),
  },
];

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [showModal, setShowModal] = useState(false);
  const [quickGoal, setQuickGoal] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_GOALS[0]?.id ?? null);

  const selectedGoal = goals.find((goal) => goal.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId && goals.length > 0) {
      setSelectedId(goals[0].id);
    }
    if (selectedId && !goals.some((goal) => goal.id === selectedId)) {
      setSelectedId(goals[0]?.id ?? null);
    }
  }, [goals, selectedId]);

  const totalGoals = goals.length;

  const latestGoalDate = useMemo(() => {
    if (!goals.length) return null;
    const latest = [...goals].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
    return new Date(latest.createdAt).toLocaleDateString("pt-BR");
  }, [goals]);

  const addGoal = (input: { title: string; dream: string }) => {
    const title = input.title.trim();
    const dream = input.dream.trim();
    if (!title) return;

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title,
      dream: dream || "Sem descrição por enquanto.",
      createdAt: new Date().toISOString(),
    };

    setGoals((prev) => [newGoal, ...prev]);
    setSelectedId(newGoal.id);
  };

  const addQuickGoal = () => {
    const value = quickGoal.trim();
    if (!value) return;
    addGoal({ title: value, dream: "Sem descrição por enquanto." });
    setQuickGoal("");
  };

  const deleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500 font-semibold">Metas e Sonhos</p>
          <h1 className="text-3xl font-black text-gray-900 mt-1">Comece simples</h1>
          <p className="text-gray-600 mt-1">
            Primeiro capture o que importa para voce. Sem pressao, sem complexidade.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-11 px-4 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors flex items-center gap-2"
        >
          <Plus className="size-4" />
          Nova meta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">
        <aside className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Resumo</p>
            <div className="mt-3 space-y-2">
              <div className="rounded-xl bg-pink-50 border border-pink-100 p-3">
                <p className="text-xs text-pink-700">Metas cadastradas</p>
                <p className="text-2xl font-bold text-pink-900">{totalGoals}</p>
              </div>
              <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-3">
                <p className="text-xs text-cyan-700">Ultima atualizacao</p>
                <p className="text-sm font-semibold text-cyan-900">{latestGoalDate ?? "Sem metas"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">Captura rapida</p>
            <input
              value={quickGoal}
              onChange={(e) => setQuickGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addQuickGoal();
                }
              }}
              placeholder="Ex: Passar no vestibular"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
            />
            <button
              onClick={addQuickGoal}
              disabled={!quickGoal.trim()}
              className="w-full h-10 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Salvar meta
            </button>
          </div>

          <div className="space-y-2">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedId(goal.id)}
                className={`w-full text-left rounded-xl border p-3 transition-colors ${
                  selectedId === goal.id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className="font-semibold text-sm truncate">{goal.title}</p>
                <p
                  className={`text-xs mt-1 line-clamp-2 ${
                    selectedId === goal.id ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  {goal.dream}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <main>
          {selectedGoal ? (
            <motion.section
              key={selectedGoal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-3xl overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-pink-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-pink-100 flex items-center justify-center flex-shrink-0">
                      <Target className="size-5 text-pink-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-pink-700">Meta ativa</p>
                      <h2 className="text-2xl font-black text-gray-900 truncate">{selectedGoal.title}</h2>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteGoal(selectedGoal.id)}
                    className="w-9 h-9 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
                    title="Excluir meta"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Meu sonho</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{selectedGoal.dream}</p>
                </div>

                <div className="rounded-2xl border border-dashed border-gray-300 p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-cyan-600" />
                    <p className="text-sm font-semibold text-gray-900">Proximo passo (em breve)</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Nos proximos incrementos vamos sugerir automaticamente o proximo passo para cada meta.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 p-4 bg-emerald-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="size-4 text-emerald-600" />
                    <p className="text-sm font-semibold text-emerald-900">Lembrete gentil</p>
                  </div>
                  <p className="text-sm text-emerald-800">
                    Voce nao precisa resolver tudo hoje. Registrar sua meta ja e um passo importante.
                  </p>
                </div>
              </div>
            </motion.section>
          ) : (
            <section className="bg-white border border-gray-200 rounded-3xl p-12 text-center">
              <Target className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">Nenhuma meta selecionada</p>
              <p className="text-sm text-gray-500 mt-1">Crie ou selecione uma meta para visualizar.</p>
            </section>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <NewGoalModal
            onClose={() => setShowModal(false)}
            onSave={(goalInput) => {
              addGoal(goalInput);
              setShowModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewGoalModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (goal: { title: string; dream: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [dream, setDream] = useState("");
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) {
      setError("Digite o nome da meta.");
      return;
    }

    onSave({ title, dream });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm p-4 flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Nova Meta</p>
            <h2 className="text-lg font-black text-gray-900">Registre seu sonho</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500 block mb-1.5">Nome da meta</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="Ex: Conseguir meu primeiro estagio"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500 block mb-1.5">Meu sonho (opcional)</label>
            <textarea
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              rows={4}
              placeholder="Descreva rapidamente por que essa meta importa para voce"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>

          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-11 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black"
          >
            Salvar meta
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
