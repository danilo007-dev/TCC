import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Task } from "../types";
import { taskStore } from "../store";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: "task";
  taskId?: string; // ID para navegação (tarefas)
}

const TYPE_CONFIG = {
  task: { label: "Tarefa", bg: "bg-blue-500", text: "text-white", dot: "bg-blue-500", hover: "hover:bg-blue-600" },
};

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MAX_VISIBLE = 2;

export function CalendarView() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setTasks(taskStore.getTasks());
    const unsubscribe = taskStore.subscribe(() => {
      setTasks(taskStore.getTasks());
    });

    return unsubscribe;
  }, []);

  const events = useMemo<CalendarEvent[]>(() => {
    return tasks.map((task) => ({
      id: task.id,
      date: task.scheduledDate ? parseISO(task.scheduledDate) : new Date(),
      title: task.title,
      type: "task",
      taskId: task.id,
    }));
  }, [tasks]);

  const monthStart   = startOfMonth(currentMonth);
  const daysInMonth  = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) });
  const startWeekday = monthStart.getDay();

  const getEvents = (date: Date) => events.filter((e) => isSameDay(e.date, date));
  const selectedEvents = selectedDate ? getEvents(selectedDate) : [];

  const handleDayClick = (day: Date) => {
    setSelectedDate(selectedDate && isSameDay(day, selectedDate) ? null : day);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.taskId) {
      navigate(`/focus/${event.taskId}`);
    }
  };

  return (
    /*
      FIX altura: usa h-[calc(100vh-88px)] para preencher toda a área disponível
      descontando o header do Layout (py-6 = 24px top + 24px bottom + margem = ~88px)
    */
    <div className="flex flex-col -mx-8 -my-6 px-8 py-6" style={{ height: "calc(100vh - 0px)" }}>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h1>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { setCurrentMonth(new Date()); setSelectedDate(null); }}
            className="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mr-2"
          >
            Hoje
          </button>
          <button
            onClick={() => { setCurrentMonth(subMonths(currentMonth, 1)); setSelectedDate(null); }}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => { setCurrentMonth(addMonths(currentMonth, 1)); setSelectedDate(null); }}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* BODY — ocupa todo o espaço restante */}
      <div className="flex gap-4 flex-1 min-h-0 pb-6">

        {/* CALENDÁRIO */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">

          {/* Cabeçalho dias da semana */}
          <div className="grid grid-cols-7 border-b border-gray-100 flex-shrink-0">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-3 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Grid — flex-1 para preencher toda a altura */}
          <div className="flex-1 grid grid-cols-7 divide-x divide-y divide-gray-100" style={{ gridAutoRows: "1fr" }}>

            {/* Células vazias */}
            {Array.from({ length: startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-50/40" />
            ))}

            {daysInMonth.map((day) => {
              const dayEvents  = getEvents(day);
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isTodayDay = isToday(day);
              const visible    = dayEvents.slice(0, MAX_VISIBLE);
              const overflow   = dayEvents.length - MAX_VISIBLE;

              return (
                <motion.div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex flex-col p-2 cursor-pointer transition-colors
                    ${isSelected ? "bg-purple-50" : "hover:bg-gray-50/80"}
                  `}
                >
                  {/* Número */}
                  <div className="flex justify-center mb-1.5 flex-shrink-0">
                    <span className={`
                      w-7 h-7 flex items-center justify-center rounded-full
                      text-sm font-medium leading-none transition-colors
                      ${isTodayDay
                        ? "bg-purple-600 text-white font-bold"
                        : isSelected
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-700"
                      }
                    `}>
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Pílulas de eventos */}
                  <div className="flex flex-col gap-[3px]">
                    {visible.map((event) => {
                      const cfg = TYPE_CONFIG[event.type];
                      return (
                        <motion.div
                          key={event.id}
                          whileHover={{ scale: 1.02, opacity: 0.9 }}
                          onClick={(e) => handleEventClick(event, e)}
                          className={`
                            ${cfg.bg} ${cfg.text} ${cfg.hover}
                            text-[10px] font-medium px-1.5 py-[3px]
                            rounded-[4px] truncate leading-tight
                            cursor-pointer transition-colors
                          `}
                        >
                          {event.title}
                        </motion.div>
                      );
                    })}

                    {overflow > 0 && (
                      <div className="text-[10px] text-gray-400 font-medium px-1">
                        +{overflow} mais
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* PAINEL LATERAL */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              key="side-panel"
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 256 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <div className="w-64 h-full bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize text-sm">
                      {format(selectedDate, "EEEE", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Lista de eventos */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                  <AnimatePresence mode="wait">
                    {selectedEvents.length > 0 ? (
                      selectedEvents.map((event, i) => {
                        const cfg = TYPE_CONFIG[event.type];
                        const isNavigable = Boolean(event.taskId);

                        return (
                          <motion.button
                            key={event.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={(e) => handleEventClick(event, e as unknown as React.MouseEvent)}
                            className={`
                              w-full flex items-center gap-3 p-3 rounded-xl
                              bg-gray-50 hover:bg-gray-100 transition-colors
                              text-left group
                              ${isNavigable ? "cursor-pointer" : "cursor-default"}
                            `}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                              <p className="text-xs text-gray-400">{cfg.label}</p>
                            </div>
                            {/* Seta de navegação — aparece no hover */}
                            {isNavigable && (
                              <ArrowRight className="size-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                            )}
                          </motion.button>
                        );
                      })
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <div className="text-4xl mb-3">🌿</div>
                        <p className="text-sm text-gray-400">Dia livre!</p>
                        <p className="text-xs text-gray-300 mt-1">Nenhuma atividade</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Rodapé */}
                {selectedEvents.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                    <p className="text-xs text-gray-400 text-center">
                      <span className="font-semibold text-purple-600">{selectedEvents.length}</span>{" "}
                      {selectedEvents.length === 1 ? "atividade" : "atividades"} neste dia
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
