import { useState } from "react";
import { useNavigate } from "react-router";
import { taskStore } from "../store";
import { Sparkles, ArrowRight, Calendar, Clock3, Pencil, Check, X, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TaskDraft {
  id: string;
  title: string;
  encouragement: string;
  selectedDuration: number;
  showCustomDuration: boolean;
  customHours: string;
  customMinutes: string;
  selectedTime: string;
  selectedDate: string;
  subtasks: string[];
  editingStepIndex: number | null;
  editingStepValue: string;
}

export function QuickCapture() {
  const presetDurations = [15, 25, 30, 45, 60];
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState("");
  const [customMinutes, setCustomMinutes] = useState("25");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [editableSubtasks, setEditableSubtasks] = useState<string[]>([]);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editingStepValue, setEditingStepValue] = useState("");
  const [multiTaskDrafts, setMultiTaskDrafts] = useState<TaskDraft[] | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    task: string;
    subtasks: string[];
    estimatedTime: string;
    encouragement: string;
  } | null>(null);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (aiSuggestion) {
      setAiSuggestion(null);
    }
    if (multiTaskDrafts) {
      setMultiTaskDrafts(null);
      setSelectedDraftId(null);
    }
  };

  const splitTaskCandidates = (raw: string) => {
    return raw
      .split(/\n|;|,/) 
      .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
      .filter(Boolean);
  };

  const handleProcess = () => {
    if (!input.trim()) return;

    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const taskCandidates = splitTaskCandidates(input);

      if (taskCandidates.length > 1) {
        const drafts: TaskDraft[] = taskCandidates.map((taskTitle, idx) => {
          const suggestion = taskStore.breakdownTask(taskTitle);
          const mins = parseInt(suggestion.estimatedTime, 10) || 25;
          return {
            id: `${Date.now()}-${idx}`,
            title: suggestion.task,
            encouragement: suggestion.encouragement,
            selectedDuration: mins,
            showCustomDuration: !presetDurations.includes(mins),
            customHours: mins >= 60 ? String(Math.floor(mins / 60)) : "",
            customMinutes: String(mins % 60 || (mins < 60 ? mins : 0)),
            selectedTime: "09:00",
            selectedDate: new Date().toISOString().slice(0, 10),
            subtasks: suggestion.subtasks,
            editingStepIndex: null,
            editingStepValue: "",
          };
        });

        setAiSuggestion(null);
        setMultiTaskDrafts(drafts);
        setSelectedDraftId(drafts[0]?.id ?? null);
      } else {
        const suggestion = taskStore.breakdownTask(input);
        setAiSuggestion(suggestion);
        setMultiTaskDrafts(null);
        setSelectedDraftId(null);
        setEditableSubtasks(suggestion.subtasks);
        const mins = parseInt(suggestion.estimatedTime, 10) || 25;
        setSelectedDuration(mins);
        setShowCustomDuration(!presetDurations.includes(mins));
        setCustomHours(mins >= 60 ? String(Math.floor(mins / 60)) : "");
        setCustomMinutes(String(mins % 60 || (mins < 60 ? mins : 0)));
      }

      setIsProcessing(false);
    }, 800);
  };

  const formatDurationLabel = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${minutes} min`;
  };

  const syncCustomDuration = (nextHours: string, nextMinutes: string) => {
    const hours = Number(nextHours || 0);
    const minutes = Number(nextMinutes || 0);
    const total = hours * 60 + minutes;
    if (total > 0) setSelectedDuration(total);
  };

  const selectedDraft = multiTaskDrafts?.find((d) => d.id === selectedDraftId) ?? null;
  const hasMultiDrafts = Boolean(multiTaskDrafts && multiTaskDrafts.length > 0);
  const hasResult = Boolean(aiSuggestion || hasMultiDrafts);

  const updateSelectedDraft = (updater: (draft: TaskDraft) => TaskDraft) => {
    if (!selectedDraftId) return;
    setMultiTaskDrafts((prev) => {
      if (!prev) return prev;
      return prev.map((draft) => (draft.id === selectedDraftId ? updater(draft) : draft));
    });
  };

  const handleCustomHoursChange = (rawValue: string) => {
    const onlyDigits = rawValue.replace(/\D/g, "").slice(0, 2);
    const bounded = onlyDigits === "" ? "" : String(Math.min(23, Number(onlyDigits)));
    if (selectedDraft) {
      updateSelectedDraft((draft) => {
        const minutes = Number(draft.customMinutes || 0);
        const total = Number(bounded || 0) * 60 + minutes;
        return {
          ...draft,
          customHours: bounded,
          selectedDuration: total > 0 ? total : draft.selectedDuration,
        };
      });
    } else {
      setCustomHours(bounded);
      syncCustomDuration(bounded, customMinutes);
    }
  };

  const handleCustomMinutesChange = (rawValue: string) => {
    const onlyDigits = rawValue.replace(/\D/g, "").slice(0, 2);
    const bounded = onlyDigits === "" ? "" : String(Math.min(59, Number(onlyDigits)));
    if (selectedDraft) {
      updateSelectedDraft((draft) => {
        const hours = Number(draft.customHours || 0);
        const total = hours * 60 + Number(bounded || 0);
        return {
          ...draft,
          customMinutes: bounded,
          selectedDuration: total > 0 ? total : draft.selectedDuration,
        };
      });
    } else {
      setCustomMinutes(bounded);
      syncCustomDuration(customHours, bounded);
    }
  };

  const addOneTaskToStore = (taskData: {
    title: string;
    duration: number;
    selectedTime: string;
    selectedDate: string;
    subtasks: string[];
  }) => {
    const colors = ["#A8E6CF", "#FFD3B6", "#FFAAA5", "#B4A7D6", "#FFE5B4"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    taskStore.addTask({
      title: taskData.title,
      duration: Math.max(1, taskData.duration),
      estimatedTime: formatDurationLabel(Math.max(1, taskData.duration)),
      completed: false,
      progress: 0,
      timeOfDay: taskData.selectedTime,
      dueDate: taskData.selectedDate,
      color: randomColor,
      subtasks: taskData.subtasks.map((title, index) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${index}`,
        title,
        completed: false,
      })),
    });
  };

  const currentSubtasks = selectedDraft ? selectedDraft.subtasks : editableSubtasks;

  const handleStartEditStep = (index: number) => {
    setEditingStepIndex(index);
    setEditingStepValue(currentSubtasks[index] ?? "");
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (selectedDraft) {
      updateSelectedDraft((draft) => {
        if (target < 0 || target >= draft.subtasks.length) return draft;
        const copy = [...draft.subtasks];
        [copy[index], copy[target]] = [copy[target], copy[index]];
        return { ...draft, subtasks: copy };
      });
    } else {
      setEditableSubtasks((prev) => {
        if (target < 0 || target >= prev.length) return prev;
        const copy = [...prev];
        [copy[index], copy[target]] = [copy[target], copy[index]];
        return copy;
      });
    }
    if (editingStepIndex !== null) {
      if (editingStepIndex === index) setEditingStepIndex(target);
      else if (editingStepIndex === target) setEditingStepIndex(index);
    }
  };

  const handleRemoveStep = (index: number) => {
    if (selectedDraft) {
      updateSelectedDraft((draft) => ({
        ...draft,
        subtasks: draft.subtasks.filter((_, i) => i !== index),
      }));
    } else {
      setEditableSubtasks((prev) => prev.filter((_, i) => i !== index));
    }
    if (editingStepIndex === index) {
      handleCancelStepEdit();
    }
  };

  const handleAddStep = () => {
    if (selectedDraft) {
      setEditingStepIndex(selectedDraft.subtasks.length);
      updateSelectedDraft((draft) => ({ ...draft, subtasks: [...draft.subtasks, "Novo passo"] }));
    } else {
      setEditableSubtasks((prev) => [...prev, "Novo passo"]);
      setEditingStepIndex(editableSubtasks.length);
    }
    setEditingStepValue("Novo passo");
  };

  const handleSaveStepEdit = () => {
    if (editingStepIndex === null) return;
    const value = editingStepValue.trim();
    if (!value) return;
    if (selectedDraft) {
      updateSelectedDraft((draft) => ({
        ...draft,
        subtasks: draft.subtasks.map((step, idx) => (idx === editingStepIndex ? value : step)),
      }));
    } else {
      setEditableSubtasks((prev) => prev.map((step, idx) => (idx === editingStepIndex ? value : step)));
    }
    setEditingStepIndex(null);
    setEditingStepValue("");
  };

  const handleCancelStepEdit = () => {
    setEditingStepIndex(null);
    setEditingStepValue("");
  };

  const handleAddTask = () => {
    if (!aiSuggestion) return;

    const validSubtasks = editableSubtasks.map((s) => s.trim()).filter(Boolean);

    addOneTaskToStore({
      title: aiSuggestion.task,
      duration: selectedDuration,
      selectedTime,
      selectedDate,
      subtasks: validSubtasks.length ? validSubtasks : aiSuggestion.subtasks,
    });

    navigate("/dashboard");
  };

  const handleAddMultipleTasks = () => {
    if (!multiTaskDrafts || multiTaskDrafts.length === 0) return;

    multiTaskDrafts.forEach((draft) => {
      const validSubtasks = draft.subtasks.map((s) => s.trim()).filter(Boolean);
      addOneTaskToStore({
        title: draft.title,
        duration: draft.selectedDuration,
        selectedTime: draft.selectedTime,
        selectedDate: draft.selectedDate,
        subtasks: validSubtasks.length ? validSubtasks : ["Começar"],
      });
    });

    navigate("/dashboard");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">O que está na sua cabeça?</h1>
        <p className="text-gray-600 mt-1">
          Digite qualquer coisa. Vamos organizar juntos.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Ex: estudar matemática, organizar quarto, fazer trabalho..."
            className="w-full min-h-[120px] p-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none resize-none text-lg"
            disabled={isProcessing || hasResult}
          />
          {isProcessing && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="size-8 text-purple-600" />
              </motion.div>
            </div>
          )}
        </div>

        {!hasResult && !isProcessing && (
          <button
            onClick={handleProcess}
            disabled={!input.trim()}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="size-5" />
            Organizar com IA
          </button>
        )}
      </div>

      {hasResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-900 font-medium mb-1">Assistente IA</p>
                <p className="text-purple-800">{selectedDraft?.encouragement ?? aiSuggestion?.encouragement ?? "Organizei suas tarefas para facilitar o foco."}</p>
              </div>
            </div>
          </div>

          {multiTaskDrafts && multiTaskDrafts.length > 1 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Tarefas identificadas:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {multiTaskDrafts.map((draft, index) => (
                  <button
                    key={draft.id}
                    type="button"
                    onClick={() => {
                      setSelectedDraftId(draft.id);
                      setEditingStepIndex(null);
                      setEditingStepValue("");
                    }}
                    className={`text-left p-3 rounded-xl border transition-colors ${
                      selectedDraftId === draft.id
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-purple-300"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">Tarefa {index + 1}</p>
                    <p className="font-medium text-gray-800 line-clamp-2">{draft.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{selectedDraft ? selectedDraft.title : aiSuggestion?.task}</h3>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {formatDurationLabel(Math.max(1, selectedDraft ? selectedDraft.selectedDuration : selectedDuration))}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4">
                <div className="flex-1 min-w-0">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Duração</label>
                <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
                  {presetDurations.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        if (selectedDraft) {
                          updateSelectedDraft((draft) => ({
                            ...draft,
                            selectedDuration: mins,
                            showCustomDuration: false,
                            customHours: mins >= 60 ? String(Math.floor(mins / 60)) : "",
                            customMinutes: String(mins % 60 || (mins < 60 ? mins : 0)),
                          }));
                        } else {
                          setSelectedDuration(mins);
                          setShowCustomDuration(false);
                          setCustomHours(mins >= 60 ? String(Math.floor(mins / 60)) : "");
                          setCustomMinutes(String(mins % 60 || (mins < 60 ? mins : 0)));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                        (selectedDraft ? selectedDraft.selectedDuration : selectedDuration) === mins
                          ? "bg-purple-600 text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedDraft) {
                        updateSelectedDraft((draft) => ({
                          ...draft,
                          showCustomDuration: true,
                          customHours: presetDurations.includes(draft.selectedDuration) ? "" : draft.customHours,
                          customMinutes: presetDurations.includes(draft.selectedDuration) ? "" : draft.customMinutes,
                        }));
                      } else {
                        setShowCustomDuration(true);
                        if (presetDurations.includes(selectedDuration)) {
                          setCustomHours("");
                          setCustomMinutes("");
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                      (selectedDraft ? selectedDraft.showCustomDuration : showCustomDuration)
                        ? "bg-purple-600 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"
                    }`}
                  >
                    Personalizado
                  </button>
                </div>
                <AnimatePresence>
                  {(selectedDraft ? selectedDraft.showCustomDuration : showCustomDuration) && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 max-w-[240px]">
                        <div className="relative w-24">
                          <Clock3 className="size-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="h"
                            value={selectedDraft ? selectedDraft.customHours : customHours}
                            onChange={(e) => handleCustomHoursChange(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:outline-none text-sm bg-white"
                          />
                        </div>
                        <div className="relative w-24">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="min"
                            value={selectedDraft ? selectedDraft.customMinutes : customMinutes}
                            onChange={(e) => handleCustomMinutesChange(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:outline-none text-sm bg-white"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>

                <div className="w-full lg:w-[180px]">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Hora</label>
                  <input
                    type="time"
                    value={selectedDraft ? selectedDraft.selectedTime : selectedTime}
                    onChange={(e) => {
                      if (selectedDraft) {
                        updateSelectedDraft((draft) => ({ ...draft, selectedTime: e.target.value }));
                      } else {
                        setSelectedTime(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm bg-white"
                  />
                </div>

                <div className="w-full lg:w-[210px]">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Data</label>
                  <div className="relative">
                    <Calendar className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={selectedDraft ? selectedDraft.selectedDate : selectedDate}
                      onChange={(e) => {
                        if (selectedDraft) {
                          updateSelectedDraft((draft) => ({ ...draft, selectedDate: e.target.value }));
                        } else {
                          setSelectedDate(e.target.value);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Passos sugeridos:</p>
              {currentSubtasks.map((subtask, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  {editingStepIndex === index ? (
                    <>
                      <input
                        autoFocus
                        value={editingStepValue}
                        onChange={(e) => setEditingStepValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveStepEdit();
                          }
                          if (e.key === "Escape") {
                            e.preventDefault();
                            handleCancelStepEdit();
                          }
                        }}
                        className="flex-1 px-2 py-1 rounded-lg border border-purple-300 focus:outline-none focus:border-purple-500 text-sm text-gray-700"
                      />
                      <button
                        type="button"
                        onClick={handleSaveStepEdit}
                        className="w-7 h-7 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center"
                        title="Salvar passo"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelStepEdit}
                        className="w-7 h-7 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                        title="Cancelar edição"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-700 flex-1">{subtask}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEditStep(index)}
                          className="w-7 h-7 rounded-lg hover:bg-purple-100 text-purple-600 flex items-center justify-center"
                          title="Editar passo"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(index, "up")}
                          className="w-7 h-7 rounded-lg hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30"
                          title="Mover para cima"
                          disabled={index === 0}
                        >
                          <ChevronUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(index, "down")}
                          className="w-7 h-7 rounded-lg hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30"
                          title="Mover para baixo"
                          disabled={index === currentSubtasks.length - 1}
                        >
                          <ChevronDown className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(index)}
                          className="w-7 h-7 rounded-lg hover:bg-red-100 text-red-500 flex items-center justify-center"
                          title="Remover passo"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddStep}
                className="w-full mt-1 py-2 rounded-xl border-2 border-dashed border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="size-4" />
                Adicionar passo
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setAiSuggestion(null);
                setMultiTaskDrafts(null);
                setSelectedDraftId(null);
                setEditableSubtasks([]);
                setEditingStepIndex(null);
                setInput("");
              }}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
            >
              Refazer
            </button>
            <button
              onClick={multiTaskDrafts && multiTaskDrafts.length > 1 ? handleAddMultipleTasks : handleAddTask}
              className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              {multiTaskDrafts && multiTaskDrafts.length > 1 ? "Adicionar tarefas" : "Adicionar tarefa"}
              <ArrowRight className="size-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
