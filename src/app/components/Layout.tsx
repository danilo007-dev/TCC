import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, MessageCircle, Plus, TrendingUp, Repeat, Target, Calendar, Wind, Settings } from "lucide-react";
import { motion } from "motion/react";

const appBrand = new URL("../../../LOGO/escrita-logo_FocusGrid.png?v=1", import.meta.url).href;

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/") return <Outlet />;

  const navItems = [
    { path: "/dashboard",  icon: Home,          label: "Hoje",        section: "main"     },
    { path: "/capture",    icon: Plus,          label: "Adicionar",   section: "main"     },
    { path: "/routines",   icon: Repeat,        label: "Rotinas",     section: "organize" },
    { path: "/goals",      icon: Target,        label: "Metas",       section: "organize" },
    { path: "/calendar",   icon: Calendar,      label: "Calendário",  section: "organize" },
    { path: "/minddump",   icon: Wind,          label: "Mente Livre", section: "organize" },
    { path: "/chat",       icon: MessageCircle, label: "Assistente",  section: "support"  },
    { path: "/progress",   icon: TrendingUp,    label: "Progresso",   section: "support"  },
    { path: "/settings",   icon: Settings,      label: "Config",      section: "support"  },
  ];

  const NavButton = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <motion.button
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
          isActive ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isActive && (
          <motion.div
            layoutId="activeSidebar"
            className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r"
            transition={{ type: "spring", duration: 0.5 }}
          />
        )}
        <Icon className="size-5" />
        <span className="font-medium">{item.label}</span>
      </motion.button>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <aside className="fixed top-0 left-0 w-64 h-screen bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col z-30">
        <div className="px-4 py-5 border-b border-gray-200 flex-shrink-0">
          <div className="h-11 w-[190px] overflow-hidden">
            <img src={appBrand} alt="FocusGrid" className="h-full w-full object-cover object-left" />
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Principal</p>
            {navItems.filter((i) => i.section === "main").map((item) => <NavButton key={item.path} item={item} />)}
          </div>
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Organizar</p>
            {navItems.filter((i) => i.section === "organize").map((item) => <NavButton key={item.path} item={item} />)}
          </div>
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Acompanhar</p>
            {navItems.filter((i) => i.section === "support").map((item) => <NavButton key={item.path} item={item} />)}
          </div>
        </nav>

        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-900 font-medium">💡 Dica</p>
            <p className="text-xs text-blue-700 mt-1">Foque em uma tarefa por vez para melhores resultados</p>
          </div>
        </div>
      </aside>

      <main className="ml-64 h-screen overflow-y-auto">
        <div className="px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
