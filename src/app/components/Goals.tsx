import { useState } from "react";
import { Target, Plus, Trash2, Check, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { HelpfulHint } from "./HelpfulHint";
import { Badge } from "./ui/badge";

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: "short" | "long";
  steps: string[];
  completedSteps: number;
}

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([
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
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [selectedType, setSelectedType] = useState<"short" | "long">("short");

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      description: "Meta criada pelo usuário",
      progress: 0,
      type: selectedType,
      steps: ["Passo 1", "Passo 2", "Passo 3"],
      completedSteps: 0,
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle("");
    setShowAddForm(false);
  };

  const shortTermGoals = goals.filter((g) => g.type === "short");
  const longTermGoals = goals.filter((g) => g.type === "long");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-100 p-2 rounded-lg">
            <Target className="size-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Metas</h1>
        </div>
        <p className="text-gray-600">
          Objetivos de curto e longo prazo. Divida em passos pequenos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <p className="text-sm text-gray-600 mb-1">Curto prazo</p>
          <p className="text-3xl font-bold text-green-700">{shortTermGoals.length}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Longo prazo</p>
          <p className="text-3xl font-bold text-blue-700">{longTermGoals.length}</p>
        </Card>
      </div>

      {/* Helpful Hint */}
      <HelpfulHint
        title="Metas grandes? Divida em passos"
        message="Cérebros com TDAH funcionam melhor com objetivos pequenos e claros."
      />

      {/* Add Goal Button */}
      {!showAddForm && (
        <Button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Plus className="size-5 mr-2" />
          Adicionar nova meta
        </Button>
      )}

      {/* Add Goal Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6 border-green-200">
              <h3 className="font-medium text-gray-900 mb-4">Nova meta</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Ex: Aprender inglês"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addGoal()}
                  autoFocus
                />

                {/* Type Selection */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedType("short")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      selectedType === "short"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Curto prazo
                  </button>
                  <button
                    onClick={() => setSelectedType("long")}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      selectedType === "long"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Longo prazo
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addGoal} className="flex-1 bg-green-600 hover:bg-green-700">
                    Criar meta
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewGoalTitle("");
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Short Term Goals */}
      {shortTermGoals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-gray-900">Curto Prazo</h2>
            <Badge className="bg-green-100 text-green-700">
              {shortTermGoals.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {shortTermGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onDelete={deleteGoal} />
            ))}
          </div>
        </div>
      )}

      {/* Long Term Goals */}
      {longTermGoals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-gray-900">Longo Prazo</h2>
            <Badge className="bg-blue-100 text-blue-700">
              {longTermGoals.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {longTermGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onDelete={deleteGoal} />
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <Card className="p-12 text-center border-dashed">
          <Target className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma meta criada ainda.</p>
          <p className="text-sm text-gray-400 mt-1">
            Defina um objetivo e divida em passos pequenos.
          </p>
        </Card>
      )}
    </div>
  );
}

function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Card
        className={`p-5 border-2 ${
          goal.type === "short"
            ? "bg-green-50 border-green-200"
            : "bg-blue-50 border-blue-200"
        }`}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 size-12 rounded-full flex items-center justify-center ${
                goal.type === "short"
                  ? "bg-green-100"
                  : "bg-blue-100"
              }`}
            >
              <Target
                className={`size-6 ${
                  goal.type === "short" ? "text-green-600" : "text-blue-600"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 mb-1">{goal.title}</h3>
              <p className="text-sm text-gray-600">{goal.description}</p>
            </div>

            <button
              onClick={() => onDelete(goal.id)}
              className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="size-5" />
            </button>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {goal.progress}% concluído
              </span>
              <span className="text-xs text-gray-500">
                {goal.completedSteps}/{goal.steps.length} passos
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-full ${
                  goal.type === "short"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>{isExpanded ? "Ocultar passos" : "Ver passos"}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="size-4" />
            </motion.div>
          </button>

          {/* Steps */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2"
              >
                {goal.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 py-2 px-3 bg-white rounded-lg"
                  >
                    <div
                      className={`size-5 rounded-full border-2 flex items-center justify-center ${
                        index < goal.completedSteps
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {index < goal.completedSteps && (
                        <Check className="size-3 text-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        index < goal.completedSteps
                          ? "line-through text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
