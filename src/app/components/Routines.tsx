import { useState } from "react";
import { Repeat, Star, Sun, Moon, Dumbbell, Code, Pill, BookOpen, Plus } from "lucide-react";
import { motion } from "motion/react";
import { HelpfulHint } from "./HelpfulHint";

interface Routine {
  id: string;
  title: string;
  description: string;
  steps: number;
  icon: string;
  color: string;
  iconBg: string;
  isFavorite: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  sun: <Sun className="size-5" />,
  moon: <Moon className="size-5" />,
  dumbbell: <Dumbbell className="size-5" />,
  code: <Code className="size-5" />,
  pill: <Pill className="size-5" />,
  book: <BookOpen className="size-5" />,
};

export function Routines() {
  const [routines, setRoutines] = useState<Routine[]>([
    {
      id: "1", title: "Rotina Matinal", description: "Comece o dia com energia e foco",
      steps: 4, icon: "sun", color: "text-green-600", iconBg: "bg-green-100", isFavorite: true,
    },
    {
      id: "2", title: "Exercícios", description: "Manter o corpo ativo",
      steps: 3, icon: "dumbbell", color: "text-purple-600", iconBg: "bg-purple-100", isFavorite: true,
    },
    {
      id: "3", title: "Rotina Noturna", description: "Preparar para um bom sono",
      steps: 4, icon: "moon", color: "text-pink-600", iconBg: "bg-pink-100", isFavorite: true,
    },
    {
      id: "4", title: "Estudos", description: "Aprendizado focado",
      steps: 3, icon: "book", color: "text-blue-600", iconBg: "bg-blue-100", isFavorite: false,
    },
    {
      id: "5", title: "Trabalho Focado", description: "Sessão de deep work",
      steps: 3, icon: "code", color: "text-yellow-600", iconBg: "bg-yellow-100", isFavorite: false,
    },
    {
      id: "6", title: "Medicação", description: "Não esquecer os remédios",
      steps: 3, icon: "pill", color: "text-red-600", iconBg: "bg-red-100", isFavorite: false,
    },
  ]);

  const toggleFavorite = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const favorites = routines.filter((r) => r.isFavorite);
  const all = routines.filter((r) => !r.isFavorite);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rotinas</h1>
          <p className="text-gray-500 mt-1">Organize suas atividades em rotinas reutilizáveis</p>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm">
          <Plus className="size-4" />
          Nova Rotina
        </button>
      </div>

      <HelpfulHint>
        Rotinas ajudam seu cérebro a entrar no modo certo sem precisar pensar. Use-as todos os dias!
      </HelpfulHint>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="size-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Favoritas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((routine, i) => (
              <RoutineCard key={routine.id} routine={routine} index={i} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </div>
      )}

      {/* All routines */}
      {all.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Todas as Rotinas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {all.map((routine, i) => (
              <RoutineCard key={routine.id} routine={routine} index={i} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RoutineCard({
  routine,
  index,
  onToggleFavorite,
}: {
  routine: Routine;
  index: number;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-all cursor-pointer relative group"
    >
      {/* Favorite button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(routine.id); }}
        className="absolute top-4 right-4 text-gray-300 hover:text-amber-400 transition-colors"
      >
        <Star
          className={`size-5 ${routine.isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
        />
      </button>

      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${routine.iconBg} ${routine.color} flex items-center justify-center mb-4`}>
        {ICON_MAP[routine.icon]}
      </div>

      {/* Info */}
      <h3 className="font-semibold text-gray-900 mb-1 pr-6">{routine.title}</h3>
      <p className="text-sm text-gray-500 mb-3">{routine.description}</p>
      <p className="text-xs text-gray-400">{routine.steps} passos</p>
    </motion.div>
  );
}
