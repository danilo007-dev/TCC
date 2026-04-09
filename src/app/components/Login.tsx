import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";

export function Login() {
  const navigate = useNavigate();
  const { user, loading, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    setMessage("");

    const { error } = await signInWithEmail(email);
    if (error) {
      setMessage(`Erro: ${error}`);
    } else {
      setMessage(
        "Se o email estiver correto, você receberá um link de acesso. Verifique sua caixa de entrada."
      );
    }

    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-900">Login</h1>
          <p className="text-gray-500 mt-2">Acesse suas tarefas com seu email.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-purple-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={isSending || !email.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl font-semibold transition-colors disabled:opacity-50"
          >
            {isSending ? "Enviando..." : "Enviar link de login"}
          </button>
        </form>

        {message && (
          <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4 text-sm text-purple-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
