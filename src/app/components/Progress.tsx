import { useEffect, useState } from "react";
import { taskStore } from "../store";
import { CheckCircle2, TrendingUp, Calendar, Zap } from "lucide-react";
import { motion } from "motion/react";

export function Progress() {
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setCompletedCount(taskStore.getCompletedTasksCount());
    setTotalCount(taskStore.getTotalTasksCount());

    const unsubscribe = taskStore.subscribe(() => {
      setCompletedCount(taskStore.getCompletedTasksCount());
      setTotalCount(taskStore.getTotalTasksCount());
    });

    return unsubscribe;
  }, []);

  const completionRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Mock weekly data
  const weekData = [
    { day: "Seg", completed: 3, label: "S" },
    { day: "Ter", completed: 2, label: "T" },
    { day: "Qua", completed: 4, label: "Q" },
    { day: "Qui", completed: 3, label: "Q" },
    { day: "Sex", completed: completedCount, label: "S", isToday: true },
    { day: "Sáb", completed: 0, label: "S" },
    { day: "Dom", completed: 0, label: "D" },
  ];

  const maxCompleted = Math.max(...weekData.map((d) => d.completed), 1);
  const streak = 5; // Mock streak

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Seu Progresso</h1>
        <p className="text-gray-600 mt-1">
          Continue assim! Cada passo conta.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-gray-200"
        >
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <CheckCircle2 className="size-6 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{completedCount}</p>
          <p className="text-sm text-gray-600">Tarefas completas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-gray-200"
        >
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
            <Zap className="size-6 text-orange-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{streak}</p>
          <p className="text-sm text-gray-600">Dias seguidos</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-5 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Taxa de conclusão</h2>
          </div>
          <span className="text-2xl font-semibold text-purple-600">
            {completionRate}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-5 border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="size-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900">Esta semana</h2>
        </div>

        <div className="flex items-end justify-between gap-2 h-32">
          {weekData.map((day, index) => {
            const height = (day.completed / maxCompleted) * 100;
            
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center h-24 mb-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                    className={`w-full rounded-t-lg ${
                      day.isToday
                        ? "bg-gradient-to-t from-purple-500 to-pink-500"
                        : "bg-gray-300"
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-600">{day.label}</p>
                {day.completed > 0 && (
                  <p className="text-xs font-semibold text-gray-900">
                    {day.completed}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {completedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200 text-center"
        >
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="font-semibold text-purple-900 mb-1">
            Você está indo muito bem!
          </h3>
          <p className="text-sm text-purple-800">
            Cada tarefa completa é uma vitória. Continue assim!
          </p>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl p-5 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Dicas para manter o ritmo</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span>Comece com a tarefa mais fácil do dia</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span>Use o timer para trabalhar em blocos de 15-25 minutos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span>Celebre cada pequena vitória</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span>Não precisa ser perfeito, só precisa começar</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
