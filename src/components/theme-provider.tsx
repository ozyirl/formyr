"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark, shadcn } from "@clerk/themes";
import type { ReactNode } from "react";
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

const STORAGE_KEY = "theme-mode";

type Theme = "light" | "dark";
type ThemeMode = "system" | Theme;

interface ThemeContextValue {
    mode: ThemeMode;
    theme: Theme;
    setMode: (mode: ThemeMode) => void;
    cycleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemTheme = (mediaQuery?: MediaQueryList | null): Theme =>
    mediaQuery && mediaQuery.matches ? "dark" : "light";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>("system");
    const [systemTheme, setSystemTheme] = useState<Theme>("light");
    const hasHydrated = useRef(false);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setSystemTheme(getSystemTheme(mediaQuery));

        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
            setMode(stored);
        }

        const handleChange = (event: MediaQueryListEvent) => {
            setSystemTheme(event.matches ? "dark" : "light");
        };

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }

        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        hasHydrated.current = true;
    }, []);

    const theme = mode === "system" ? systemTheme : mode;

    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }

        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.style.colorScheme = theme;
    }, [theme]);

    useEffect(() => {
        if (typeof window === "undefined" || !hasHydrated.current) {
            return;
        }

        if (mode === "system") {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, mode);
        }
    }, [mode]);

    const cycleMode = () => {
        setMode((current) => {
            if (current === "system") return "light";
            if (current === "light") return "dark";
            return "system";
        });
    };

    const contextValue = useMemo<ThemeContextValue>(
        () => ({
            mode,
            theme,
            setMode,
            cycleMode,
        }),
        [mode, theme]
    );

    const appearance = useMemo(
        () => ({
            baseTheme: theme === "dark" ? dark : shadcn,
            variables: {
                colorPrimary: "#6C47FF",
                colorText: theme === "dark" ? "#F4F3FF" : "#1A1523",
                colorBackground: theme === "dark" ? "#1A1523" : "#F7F5FF",
            },
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <ClerkProvider appearance={appearance}>{children}</ClerkProvider>
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }

    return context;
};


