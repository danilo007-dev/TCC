import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Download,
  Palette,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";

type ThemeMode = "system" | "light" | "dark";
type ReminderTone = "gentle" | "neutral" | "firm";

interface AppSettings {
  profileName: string;
  greetingName: string;
  themeMode: ThemeMode;
  primaryColor: string;
  fontScale: number;
  compactMode: boolean;
  reduceMotion: boolean;
  focusSessionMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  autoStartBreaks: boolean;
  autoStartNextTask: boolean;
  showSingleStepFocus: boolean;
  reminderTone: ReminderTone;
  reminderFrequencyMinutes: number;
  notificationsEnabled: boolean;
  soundAlerts: boolean;
  dailySummary: boolean;
}

const STORAGE_KEY = "focusflow.settings.v1";

const DEFAULT_SETTINGS: AppSettings = {
  profileName: "",
  greetingName: "",
  themeMode: "system",
  primaryColor: "#7c3aed",
  fontScale: 16,
  compactMode: false,
  reduceMotion: false,
  focusSessionMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartBreaks: false,
  autoStartNextTask: false,
  showSingleStepFocus: true,
  reminderTone: "gentle",
  reminderFrequencyMinutes: 30,
  notificationsEnabled: true,
  soundAlerts: true,
  dailySummary: true,
};

function loadSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${
          checked ? "bg-purple-600" : "bg-gray-300"
        }`}
        aria-pressed={checked}
        type="button"
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export function Settings() {
  const [saved, setSaved] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [notice, setNotice] = useState<string>("");
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    const current = loadSavedSettings();
    setSaved(current);
    setDraft(current);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-size", `${draft.fontScale}px`);
    document.documentElement.classList.toggle("reduce-motion", draft.reduceMotion);
  }, [draft.fontScale, draft.reduceMotion]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved]
  );

  const setField = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    setSaved(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setNotice("Configuracoes salvas com sucesso.");
  };

  const restoreDefaults = () => {
    setDraft(DEFAULT_SETTINGS);
    setResetConfirm(false);
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "focus-flow-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <SettingsIcon className="size-5" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Configuracoes</h1>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Ajuste a experiencia do Focus Flow para o seu ritmo, foco e rotina.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportSettings}
            className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            type="button"
          >
            <Download className="size-4" />
            Exportar
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            type="button"
          >
            <Save className="size-4" />
            Salvar ajustes
          </button>
        </div>
      </div>

      {notice && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium"
        >
          <CheckCircle2 className="size-4" />
          {notice}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="size-4 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Perfil</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome</label>
              <input
                value={draft.profileName}
                onChange={(e) => setField("profileName", e.target.value)}
                placeholder="Como voce prefere ser chamado?"
                className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome na saudacao</label>
              <input
                value={draft.greetingName}
                onChange={(e) => setField("greetingName", e.target.value)}
                placeholder="Ex: Dani"
                className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="size-4 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Aparencia e conforto</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tema</label>
              <select
                value={draft.themeMode}
                onChange={(e) => setField("themeMode", e.target.value as ThemeMode)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm bg-white"
              >
                <option value="system">Seguir sistema</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Cor principal</label>
              <div className="mt-2 flex items-center gap-2">
                {["#7c3aed", "#2563eb", "#0d9488", "#db2777", "#ea580c", "#16a34a"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setField("primaryColor", color)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      draft.primaryColor === color ? "scale-110 border-gray-700" : "border-white"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tamanho base da fonte</label>
                <span className="text-sm font-semibold text-gray-700">{draft.fontScale}px</span>
              </div>
              <input
                type="range"
                min={14}
                max={20}
                step={1}
                value={draft.fontScale}
                onChange={(e) => setField("fontScale", Number(e.target.value))}
                className="mt-2 w-full accent-purple-600"
              />
            </div>

            <div className="border-t border-gray-100 pt-1">
              <ToggleField
                label="Modo compacto"
                description="Reduz espacos e deixa mais informacao por tela."
                checked={draft.compactMode}
                onChange={(v) => setField("compactMode", v)}
              />
              <ToggleField
                label="Reduzir animacoes"
                description="Diminui movimento para menos distracao visual."
                checked={draft.reduceMotion}
                onChange={(v) => setField("reduceMotion", v)}
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="size-4 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Foco e execucao</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sessao</label>
              <input
                type="number"
                min={10}
                max={90}
                value={draft.focusSessionMinutes}
                onChange={(e) => setField("focusSessionMinutes", Number(e.target.value) || 25)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pausa curta</label>
              <input
                type="number"
                min={3}
                max={30}
                value={draft.shortBreakMinutes}
                onChange={(e) => setField("shortBreakMinutes", Number(e.target.value) || 5)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pausa longa</label>
              <input
                type="number"
                min={10}
                max={60}
                value={draft.longBreakMinutes}
                onChange={(e) => setField("longBreakMinutes", Number(e.target.value) || 15)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <ToggleField
            label="Iniciar pausas automaticamente"
            description="Quando terminar uma sessao, a pausa ja comeca."
            checked={draft.autoStartBreaks}
            onChange={(v) => setField("autoStartBreaks", v)}
          />
          <ToggleField
            label="Iniciar proxima tarefa automaticamente"
            description="Ao finalizar uma tarefa, entrar direto na proxima pendente."
            checked={draft.autoStartNextTask}
            onChange={(v) => setField("autoStartNextTask", v)}
          />
          <ToggleField
            label="Mostrar um passo por vez"
            description="Foco estrito no passo atual para reduzir sobrecarga cognitiva."
            checked={draft.showSingleStepFocus}
            onChange={(v) => setField("showSingleStepFocus", v)}
          />
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-4 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Lembretes e notificacoes</h2>
          </div>

          <ToggleField
            label="Notificacoes"
            description="Permite alertas de foco, pausa e tarefas pendentes."
            checked={draft.notificationsEnabled}
            onChange={(v) => setField("notificationsEnabled", v)}
          />

          <ToggleField
            label="Alertas sonoros"
            description="Reproduz um som curto ao finalizar uma sessao."
            checked={draft.soundAlerts}
            onChange={(v) => setField("soundAlerts", v)}
          />

          <ToggleField
            label="Resumo diario"
            description="Mostra um resumo de progresso no fim do dia."
            checked={draft.dailySummary}
            onChange={(v) => setField("dailySummary", v)}
          />

          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tom dos lembretes</label>
              <select
                value={draft.reminderTone}
                onChange={(e) => setField("reminderTone", e.target.value as ReminderTone)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm bg-white"
              >
                <option value="gentle">Suave</option>
                <option value="neutral">Neutro</option>
                <option value="firm">Direto</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Frequencia de lembretes</label>
                <span className="text-sm font-semibold text-gray-700">{draft.reminderFrequencyMinutes} min</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={draft.reminderFrequencyMinutes}
                onChange={(e) => setField("reminderFrequencyMinutes", Number(e.target.value))}
                className="mt-2 w-full accent-purple-600"
              />
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-red-100 p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-gray-900">Zona de manutencao</p>
            <p className="text-xs text-gray-500 mt-1">
              Restaure configuracoes padrao quando quiser recomeçar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setResetConfirm((prev) => !prev)}
              className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors inline-flex items-center gap-2"
              type="button"
            >
              <Trash2 className="size-4" />
              Restaurar padrao
            </button>
            {resetConfirm && (
              <button
                onClick={restoreDefaults}
                className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                type="button"
              >
                <RotateCcw className="size-4" />
                Confirmar
              </button>
            )}
          </div>
        </div>
      </section>

      {hasChanges && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 inline-block">
          Existem alteracoes nao salvas.
        </p>
      )}
    </div>
  );
}
