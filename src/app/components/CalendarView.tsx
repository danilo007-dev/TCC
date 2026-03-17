import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { HelpfulHint } from "./HelpfulHint";
import { Badge } from "./ui/badge";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: "task" | "routine" | "goal";
  color: string;
}

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mock events
  const events: CalendarEvent[] = [
    {
      id: "1",
      date: new Date(2026, 2, 13), // Today
      title: "Tomar medicação",
      type: "routine",
      color: "bg-purple-500",
    },
    {
      id: "2",
      date: new Date(2026, 2, 13),
      title: "Revisar projeto",
      type: "task",
      color: "bg-blue-500",
    },
    {
      id: "3",
      date: new Date(2026, 2, 14),
      title: "Exercícios",
      type: "routine",
      color: "bg-purple-500",
    },
    {
      id: "4",
      date: new Date(2026, 2, 15),
      title: "Estudar React",
      type: "goal",
      color: "bg-green-500",
    },
    {
      id: "5",
      date: new Date(2026, 2, 16),
      title: "Tomar medicação",
      type: "routine",
      color: "bg-purple-500",
    },
    {
      id: "6",
      date: new Date(2026, 2, 18),
      title: "Reunião importante",
      type: "task",
      color: "bg-blue-500",
    },
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = monthStart.getDay();

  // Days of week
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <CalendarIcon className="size-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendário</h1>
        </div>
        <p className="text-gray-600">
          Visualize suas tarefas, rotinas e metas em um calendário.
        </p>
      </div>

      {/* Helpful Hint */}
      <HelpfulHint
        title="Visão geral ajuda no planejamento"
        message="Ver tudo organizado visualmente reduz a ansiedade sobre o futuro."
      />

      {/* Legend */}
      <Card className="p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Legenda</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Tarefas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">Rotinas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Metas</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-6 lg:col-span-2">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousMonth}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Actual days */}
              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <motion.button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square p-2 rounded-lg border-2 transition-all relative ${
                      isSelected
                        ? "border-purple-500 bg-purple-50"
                        : isTodayDate
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isSelected
                          ? "text-purple-700"
                          : isTodayDate
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Event Dots */}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                        {dayEvents.slice(0, 3).map((event, idx) => (
                          <div
                            key={event.id}
                            className={`size-1.5 rounded-full ${event.color}`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Selected Date Details */}
        <Card className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">
            {selectedDate
              ? format(selectedDate, "d 'de' MMMM", { locale: ptBR })
              : "Selecione um dia"}
          </h3>

          {selectedDate && selectedDateEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <div className={`size-3 rounded-full ${event.color} mt-1`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {event.title}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs"
                      >
                        {event.type === "task"
                          ? "Tarefa"
                          : event.type === "routine"
                          ? "Rotina"
                          : "Meta"}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : selectedDate && selectedDateEvents.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="size-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Nenhuma atividade neste dia
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="size-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Clique em um dia para ver detalhes
              </p>
            </div>
          )}

          {/* Quick Stats */}
          {selectedDate && selectedDateEvents.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Resumo do dia
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total de atividades</span>
                <span className="font-semibold text-purple-700">
                  {selectedDateEvents.length}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
