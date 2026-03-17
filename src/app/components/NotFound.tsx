import { useNavigate } from "react-router";
import { Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Página não encontrada
        </h1>
        <p className="text-gray-600 mb-6">
          Esta página não existe ou foi movida.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
        >
          <Home className="size-5" />
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
