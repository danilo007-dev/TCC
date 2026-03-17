import { useState, useRef, useEffect } from "react";
import { Sparkles, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Estou aqui para te ajudar a começar suas tarefas. Como posso ajudar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const callClaudeAPI = async (userMessage: string, history: Message[]): Promise<string> => {
    try {
      const apiMessages = history
        .filter((m) => m.id !== "1") // skip the initial greeting from history
        .map((m) => ({ role: m.role, content: m.content }));

      apiMessages.push({ role: "user", content: userMessage });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Você é o assistente do Focus Flow, um app de produtividade para pessoas com TDAH.
Seu tom é calmo, encorajador e simples. Fale sempre em português brasileiro.
Nunca sobrecarregue o usuário com muitas informações. Sugira sempre passos pequenos e concretos.
Seja breve e direto. Máximo de 3-4 frases por resposta.
Foque em ajudar o usuário a COMEÇAR algo agora, não a planejar tudo de uma vez.
Se o usuário mencionar uma tarefa, quebre em microtarefas e pergunte se quer começar pelo primeiro passo.
Use emojis ocasionalmente para deixar a conversa mais leve 💜`,
          messages: apiMessages,
        }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      return data.content?.[0]?.text ?? "Desculpe, não consegui responder agora. Tente novamente!";
    } catch {
      // Fallback local se API falhar
      return getFallbackResponse(userMessage);
    }
  };

  const getFallbackResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    if (lower.includes("não consigo") || lower.includes("difícil")) {
      return "Eu entendo. Vamos tornar isso simples: qual é o menor passo possível que você pode dar agora? Tipo, só abrir o caderno ou o arquivo 😊";
    }
    if (lower.includes("estudar")) {
      return "Ótimo! Vamos começar pequeno:\n1. Separe o material (5 segundos)\n2. Abra em qualquer página\n3. Leia só um parágrafo\n\nQuer tentar o passo 1 agora?";
    }
    if (lower.includes("cansado")) {
      return "Tudo bem estar cansado. Que tal escolher a tarefa mais fácil e rápida? Algo de menos de 5 minutos. Pequenas vitórias dão energia 💪";
    }
    return "Entendo! Lembre-se: você não precisa fazer tudo de uma vez. Qual seria o menor passo possível para começar agora?";
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    const responseText = await callClaudeAPI(input, messages);

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseText,
    };

    setMessages([...newMessages, aiResponse]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Assistente IA</h1>
        <p className="text-gray-500 mt-1">Converse comigo sobre suas tarefas</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                  <Sparkles className="size-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-purple-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mr-3">
                <Sparkles className="size-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
                <div className="flex gap-1.5 items-center h-4">
                  {[0, 0.2, 0.4].map((delay) => (
                    <motion.div
                      key={delay}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay }}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm transition-colors"
            disabled={isTyping}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="size-5" />
          </motion.button>
        </div>

        <div className="px-4 py-3 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-xs text-purple-700">
            <strong>Dica:</strong> Pergunte sobre como começar uma tarefa, como se organizar, ou compartilhe como está se sentindo.
          </p>
        </div>
      </div>
    </div>
  );
}
