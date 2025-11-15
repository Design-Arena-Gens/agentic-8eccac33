"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      aria-label="Basculer le thème clair ou sombre"
      onClick={toggleTheme}
      className="rounded-full border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-current transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-panel-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {mounted ? (
        <span role="img" aria-hidden className="text-lg">
          {theme === "light" ? "🌙" : "☀️"}
        </span>
      ) : (
        <span className="opacity-0">•</span>
      )}
    </button>
  );
}
