import { useState } from "react";
import { useNavigate } from "react-router";
import { taskStore } from "../store";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function QuickCapture() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
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
  };

  const handleProcess = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);

    try {
      const suggestion = await taskStore.breakdownTaskWithAI(input);
      setAiSuggestion(suggestion);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddTask = () => {
    if (!aiSuggestion) return;

    const colors = ["#A8E6CF", "#FFD3B6", "#FFAAA5", "#B4A7D6", "#FFE5B4"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    taskStore.addTask({
      title: aiSuggestion.task,
      duration: parseInt(aiSuggestion.estimatedTime) || 15,
      estimatedTime: aiSuggestion.estimatedTime,
      scheduledDate: new Date().toISOString().slice(0, 10),
      completed: false,
      progress: 0,
      color: randomColor,
      subtasks: aiSuggestion.subtasks.map((title, index) => ({
        id: crypto.randomUUID(),
        title,
        completed: false,
      })),
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
            disabled={isProcessing || aiSuggestion !== null}
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

        {!aiSuggestion && !isProcessing && (
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

      {aiSuggestion && (
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
                <p className="text-purple-800">{aiSuggestion.encouragement}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{aiSuggestion.task}</h3>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {aiSuggestion.estimatedTime}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Passos sugeridos:</p>
              {aiSuggestion.subtasks.map((subtask, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{subtask}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setAiSuggestion(null);
                setInput("");
              }}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
            >
              Refazer
            </button>
            <button
              onClick={handleAddTask}
              className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              Adicionar tarefa
              <ArrowRight className="size-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
