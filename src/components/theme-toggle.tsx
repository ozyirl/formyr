"use client";

import { useMemo } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

type ModeLabelMap = Record<"system" | "light" | "dark", string>;

type IconComponent = typeof Monitor;

const MODE_LABELS: ModeLabelMap = {
    system: "System default",
    light: "Light mode",
    dark: "Dark mode",
};

const MODE_ICONS: Record<"system" | "light" | "dark", IconComponent> = {
    system: Monitor,
    light: Sun,
    dark: Moon,
};

export function ThemeToggle() {
    const { mode, theme, cycleMode } = useTheme();
    const Icon = useMemo(() => MODE_ICONS[mode], [mode]);

    const ariaLabel =
        mode === "system"
            ? `Switch theme (system ${theme})`
            : `Switch theme (current ${MODE_LABELS[mode].toLowerCase()})`;

    return (
        <button
            type="button"
            onClick={cycleMode}
            aria-label={ariaLabel}
            className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium capitalize">
                {mode === "system" ? `System - ${theme}` : MODE_LABELS[mode]}
            </span>
        </button>
    );
}
