import { useEffect, useState } from "react";

export type V79Mode = "auto" | "light" | "dark";
export type V79Theme = "light" | "dark";
const KEY = "v79-web-appearance-v1";

function savedMode(): V79Mode {
  try {
    const value = localStorage.getItem(KEY);
    if (value === "light" || value === "dark" || value === "auto") return value;
  } catch { /* Private browsing: use auto without persistence. */ }
  return "auto";
}

export function saintLuciaTheme(at: Date = new Date()): V79Theme {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/St_Lucia", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(at);
  const hour = Number(parts.find(part => part.type === "hour")?.value ?? "12");
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

export function useV79Appearance() {
  const [mode, setModeState] = useState<V79Mode>(savedMode);
  const [theme, setTheme] = useState<V79Theme>(() => {
    const preference = savedMode();
    return preference === "auto" ? saintLuciaTheme() : preference;
  });
  useEffect(() => {
    const refresh = () => {
      const effective = mode === "auto" ? saintLuciaTheme() : mode;
      setTheme(effective);
      const root = document.documentElement;
      root.classList.toggle("dark", effective === "dark");
      root.classList.toggle("light", effective === "light");
      root.dataset.theme = effective;
      root.dataset.themePreference = mode;
      root.style.colorScheme = effective;
    };
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === KEY) setModeState(savedMode());
    };
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [mode]);
  const setMode = (next: V79Mode) => {
    setModeState(next);
    try { localStorage.setItem(KEY, next); } catch { /* Still works for this tab. */ }
  };
  return { mode, theme, setMode };
}

export function V79AppearanceControls({
  mode, onChange,
}: {mode: V79Mode; onChange: (mode: V79Mode) => void}) {
  return (
    <div role="group" aria-label="Appearance — Saint Lucia time"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-xl border border-app-border bg-app-aside-bg/70 p-1">
      {(["auto", "light", "dark"] as const).map(choice => (
        <button key={choice} type="button" aria-pressed={mode === choice}
          title={choice === "auto" ? "Light 06:00–17:59, dark 18:00–05:59 Saint Lucia time" : `Keep ${choice} mode until changed`}
          onClick={() => onChange(choice)}
          className={`min-h-9 rounded-lg px-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v79-teal ${mode === choice ? "bg-white text-v79-navy shadow-sm dark:bg-v79-teal-dark dark:text-white" : "text-app-text-sec hover:bg-white/70 dark:hover:bg-white/10"}`}>
          {choice === "auto" ? "Auto" : choice === "light" ? "Light" : "Dark"}
        </button>
      ))}
    </div>
  );
}
