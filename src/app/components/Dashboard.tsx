import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { taskStore } from "../store";
import { Task } from "../types";
import { Clock, CheckCircle2, Circle, ChevronRight, Sun, Sunset, Moon } from "lucide-react";
import { motion } from "motion/react";
import { HelpfulHint } from "./HelpfulHint";

export function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(taskStore.getTasks());
    const unsubscribe = taskStore.subscribe(() => {
      setTasks(taskStore.getTasks());
    });
    return unsubscribe;
  }, []);

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedCount = taskStore.getCompletedTasksCount();
  const totalCount = taskStore.getTotalTasksCount();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Categorize tasks by time of day
  const categorizeTasks = () => {
    const morning: Task[] = [];
    const afternoon: Task[] = [];
    const evening: Task[] = [];
    const noTime: Task[] = [];

    incompleteTasks.forEach((task) => {
      if (!task.timeOfDay) {
        noTime.push(task);
        return;
      }

      const hour = parseInt(task.timeOfDay.split(":")[0]);
      
      if (hour < 12) {
        morning.push(task);
      } else if (hour < 18) {
        afternoon.push(task);
      } else {
        evening.push(task);
      }
    });

    return { morning, afternoon, evening, noTime };
  };

  const { morning, afternoon, evening, noTime } = categorizeTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{getGreeting()}</h1>
        <p className="text-gray-600 mt-1">
          {incompleteTasks.length === 0
            ? "Você completou todas as tarefas! 🎉"
            : `${incompleteTasks.length} ${incompleteTasks.length === 1 ? "tarefa" : "tarefas"} para hoje`}
        </p>
      </div>

      {completedCount > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progresso de hoje</p>
                <p className="text-lg font-semibold text-gray-900">
                  {completedCount} de {totalCount} completas
                </p>
              </div>
            </div>
            <div className="text-2xl">
              {completedCount === totalCount ? "🎉" : "💪"}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {incompleteTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-600">
              Nenhuma tarefa pendente.
              <br />
              Adicione algo novo!
            </p>
            <button
              onClick={() => navigate("/capture")}
              className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Adicionar tarefa
            </button>
          </div>
        ) : (
          <>
            {incompleteTasks.length > 0 && completedCount === 0 && (
              <HelpfulHint>
                Toque em uma tarefa para ver os passos detalhados e começar com foco total.
              </HelpfulHint>
            )}

            {/* Morning Tasks */}
            {morning.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sun className="size-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Manhã</h2>
                  <span className="text-sm text-gray-500">({morning.length})</span>
                </div>
                <div className="space-y-3">
                  {morning.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onClick={() => navigate(`/focus/${task.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Tasks */}
            {afternoon.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sunset className="size-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Tarde</h2>
                  <span className="text-sm text-gray-500">({afternoon.length})</span>
                </div>
                <div className="space-y-3">
                  {afternoon.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onClick={() => navigate(`/focus/${task.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Evening Tasks */}
            {evening.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Moon className="size-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Noite</h2>
                  <span className="text-sm text-gray-500">({evening.length})</span>
                </div>
                <div className="space-y-3">
                  {evening.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onClick={() => navigate(`/focus/${task.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tasks without time */}
            {noTime.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">Sem horário definido</h2>
                  <span className="text-sm text-gray-500">({noTime.length})</span>
                </div>
                <div className="space-y-3">
                  {noTime.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onClick={() => navigate(`/focus/${task.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {completedCount > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Completadas</h2>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.completed)
              .map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600 line-through">{task.title}</span>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, index, onClick }: { task: Task; index: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: task.color }}
        >
          <Circle className="size-6 text-gray-700" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{task.title}</h3>
            <ChevronRight className="size-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="size-4" />
              <span>{task.estimatedTime}</span>
            </div>
            {task.timeOfDay && <span>às {task.timeOfDay}</span>}
          </div>

          {task.progress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progresso</span>
                <span>{Math.round(task.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
