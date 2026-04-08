import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { taskStore } from "../store";
import { Task } from "../types";
import {
  ArrowLeft, Play, Pause, CheckCircle2, Circle, Maximize2, Minimize2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

export function FocusMode() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isDeepFocus, setIsDeepFocus] = useState(false);
  const [focusStarted, setFocusStarted] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    const currentTask = taskStore.getTask(taskId);
    setTask(currentTask || null);
    if (currentTask) setTimeRemaining(currentTask.duration * 60);
    const unsubscribe = taskStore.subscribe(() => {
      const updatedTask = taskStore.getTask(taskId);
      setTask(updatedTask || null);
    });
    return unsubscribe;
  }, [taskId]);

  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { setIsTimerRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isDeepFocus) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDeepFocus]);

  const handleToggleSubtask = (subtaskId: string) => {
    if (!taskId) return;
    taskStore.toggleSubtask(taskId, subtaskId);
  };

  const handleCompleteTask = () => {
    if (!taskId) return;
    taskStore.completeTask(taskId);
    setShowCelebration(true);
    confetti({
      particleCount: 150, spread: 80, origin: { y: 0.6 },
      colors: ["#7c3aed", "#a855f7", "#ec4899", "#22c55e", "#3b82f6"],
    });
    setTimeout(() => navigate("/dashboard"), 2500);
  };

  const handleStartFocus = () => { setFocusStarted(true); setIsTimerRunning(true); };
  const handleEnterDeepFocus = () => { setIsDeepFocus(true); };
  const handleExitDeepFocus = () => { setIsDeepFocus(false); };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tarefa não encontrada</p>
          <button onClick={() => navigate("/dashboard")} className="text-purple-600 font-medium">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const currentSubtask = task.subtasks.find((s) => !s.completed);
  const nextSubtasks = task.subtasks.filter((s) => !s.completed && s.id !== currentSubtask?.id);
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const totalTimeInSeconds = task.duration * 60;
  const timeProgressPercentage = totalTimeInSeconds > 0
    ? ((totalTimeInSeconds - timeRemaining) / totalTimeInSeconds) * 100 : 0;

  // ── FOCO PROFUNDO ────────────────────────────────────────────────────────
  // Fundo branco sólido, sem blur, sem gradiente. Tudo centralizado.
  if (isDeepFocus) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/90"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white rounded-3xl p-10 shadow-2xl text-center border border-gray-100"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900">Tarefa completa!</h2>
                <p className="text-gray-500 mt-2">Você está indo muito bem!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão sair — canto superior direito */}
        <div className="flex justify-end px-8 pt-6 flex-shrink-0">
          <button
            onClick={handleExitDeepFocus}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium"
          >
            <Minimize2 className="size-4" />
            Sair do foco profundo
          </button>
        </div>

        {/* Conteúdo centralizado */}
        <div className="flex-1 flex flex-col items-center justify-center gap-12 px-8">
          {/* Título */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-400 mt-2 text-lg">
              {completedSubtasks} de {totalSubtasks} passos concluídos
            </p>
          </div>

          {/* Timer + Passo lado a lado */}
          <div className="flex items-center justify-center gap-20 w-full max-w-4xl">
            {/* Timer */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-60 h-60">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
                  <circle cx="120" cy="120" r="104" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                  <motion.circle
                    cx="120" cy="120" r="104" stroke="#7c3aed" strokeWidth="12" fill="none"
                    strokeDasharray={2 * Math.PI * 104}
                    strokeDashoffset={2 * Math.PI * 104 * (1 - timeProgressPercentage / 100)}
                    strokeLinecap="round"
                    animate={{ strokeDashoffset: 2 * Math.PI * 104 * (1 - timeProgressPercentage / 100) }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-purple-900 tabular-nums">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {Math.round(progressPercentage)}% concluído
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-colors flex items-center gap-3"
              >
                {isTimerRunning ? <><Pause className="size-5" />Pausar</> : <><Play className="size-5" />Retomar</>}
              </motion.button>
            </div>

            {/* Passo atual */}
            {currentSubtask ? (
              <div className="flex-1 max-w-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">PASSO ATUAL</p>
                <motion.div
                  key={currentSubtask.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <p className="text-xl font-semibold text-gray-900 mb-5">{currentSubtask.title}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleSubtask(currentSubtask.id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="size-5" />
                    Marcar como concluído
                  </motion.button>
                </motion.div>
                <p className="text-sm text-gray-400 text-center mt-4">
                  💡 Concentre-se apenas neste passo agora
                </p>
              </div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                onClick={handleCompleteTask}
                className="flex-1 max-w-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white py-6 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="size-7" />
                Finalizar tarefa!
              </motion.button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── MODO NORMAL ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-3xl p-10 shadow-2xl text-center mx-4"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900">Tarefa completa!</h2>
              <p className="text-gray-500 mt-2">Você está indo muito bem!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voltar */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
      >
        <ArrowLeft className="size-5" />
        Voltar
      </button>

      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{task.title}</h1>
        <p className="text-gray-500 text-sm mb-4">
          {completedSubtasks} de {totalSubtasks} passos concluídos
        </p>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-gray-400 text-right mt-1">{Math.round(progressPercentage)}% completo</p>
      </div>

      {/* PRÉ-FOCO */}
      {!focusStarted ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 space-y-6 text-center"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pronto para começar?</h2>
            <p className="text-gray-500">Comece pelo primeiro passo. Você não precisa fazer tudo de uma vez.</p>
            <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mt-4">
              <span className="text-sm font-medium text-purple-900">
                ⏱️ Tempo disponível: {task.duration} minutos
              </span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleStartFocus}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-2xl font-bold text-xl transition-colors shadow-lg shadow-purple-200 flex items-center justify-center gap-3"
          >
            <Play className="size-7" />
            Começar foco
          </motion.button>
          <p className="text-sm text-purple-600">💡 O timer será iniciado automaticamente</p>
        </motion.div>

      ) : (
        /* FOCO ATIVO — Timer e passos LADO A LADO */
        <>
          <div className="flex gap-5 items-start">

            {/* Coluna esquerda — Timer */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100 w-68 flex-shrink-0">
              <p className="text-sm font-medium text-purple-700 mb-1">Tempo restante</p>
              <div className="text-5xl font-bold text-purple-900 tabular-nums leading-none mb-1">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-purple-400 mb-5">de {task.duration} minutos</p>

              {/* Círculo de progresso */}
              <div className="flex justify-center mb-5">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" stroke="#ddd6fe" strokeWidth="6" fill="none" />
                    <motion.circle
                      cx="40" cy="40" r="34" stroke="#7c3aed" strokeWidth="6" fill="none"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - progressPercentage / 100)}
                      strokeLinecap="round"
                      animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - progressPercentage / 100) }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-900">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 mb-2 text-sm"
              >
                {isTimerRunning
                  ? <><Pause className="size-4" />Pausar foco</>
                  : <><Play className="size-4" />Retomar foco</>
                }
              </motion.button>

              <button
                onClick={handleEnterDeepFocus}
                className="w-full bg-white hover:bg-purple-50 text-purple-600 py-3 rounded-xl font-medium border-2 border-purple-200 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Maximize2 className="size-4" />
                Foco profundo
              </button>
            </div>

            {/* Coluna direita — Passos */}
            <div className="flex-1 space-y-4 min-w-0">
              <AnimatePresence mode="wait">
                {currentSubtask && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Passo atual
                    </h2>
                    <motion.div
                      key={currentSubtask.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 p-[2px] rounded-2xl"
                    >
                      <div className="bg-white rounded-2xl p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <Circle className="size-6 text-purple-500 flex-shrink-0 mt-0.5" />
                          <p className="text-lg font-semibold text-gray-900">{currentSubtask.title}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          onClick={() => handleToggleSubtask(currentSubtask.id)}
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="size-5" />
                          Marcar como concluído
                        </motion.button>
                      </div>
                    </motion.div>
                    <p className="text-xs text-gray-400 text-center">
                      💡 Foque apenas neste passo. O próximo virá depois.
                    </p>
                  </div>
                )}
              </AnimatePresence>

              {nextSubtasks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Próximos passos</h3>
                  {nextSubtasks.map((subtask) => (
                    <div key={subtask.id} className="bg-white rounded-xl p-4 border border-gray-100 opacity-50 flex items-center gap-3">
                      <Circle className="size-5 text-gray-300 flex-shrink-0" />
                      <span className="text-gray-400 text-sm">{subtask.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {completedSubtasks > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Concluídos</h3>
                  {task.subtasks.filter((s) => s.completed).map((subtask, i) => (
                    <motion.div
                      key={subtask.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-3"
                    >
                      <CheckCircle2 className="size-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-400 line-through text-sm">{subtask.title}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {task.progress === 100 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                onClick={handleCompleteTask}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-5 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="size-7" />
                Finalizar tarefa completa!
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
