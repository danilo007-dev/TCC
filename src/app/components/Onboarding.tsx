import { useNavigate } from "react-router";
import { Brain, Lightbulb, Target, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Brain,
      title: "Bem-vindo ao Focus Flow",
      description: "Um assistente cognitivo feito para você começar e completar tarefas sem sobrecarga.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Lightbulb,
      title: "Capture ideias rapidamente",
      description: "Apenas digite o que está na sua cabeça. Nossa IA organiza tudo para você automaticamente.",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Target,
      title: "Foque em uma tarefa por vez",
      description: "Veja apenas o próximo passo. Sem listas enormes, sem paralisia mental.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Zap,
      title: "Comece pequeno, avance sempre",
      description: "Quebramos tarefas grandes em micro-passos. Você só precisa dar o primeiro passo.",
      color: "bg-blue-100 text-blue-600",
    },
  ];

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto`}>
            <Icon className="size-8" />
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-2xl font-semibold text-gray-900">{step.title}</h1>
            <p className="text-gray-600 leading-relaxed">{step.description}</p>
          </div>

          <div className="flex gap-2 justify-center">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-purple-600"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-medium hover:bg-purple-700 transition-colors"
          >
            {currentStep < steps.length - 1 ? "Próximo" : "Começar"}
          </button>

          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="w-full text-gray-500 py-2 font-medium hover:text-gray-700 transition-colors"
            >
              Voltar
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
