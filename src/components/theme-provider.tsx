"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark, shadcn } from "@clerk/themes";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useMemo } from "react";

type ThemeName = "light" | "dark";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
    >
      <ClerkThemeBridge>{children}</ClerkThemeBridge>
    </NextThemesProvider>
  );
}

function ClerkThemeBridge({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme ?? "light") as ThemeName;

  const appearance = useMemo(
    () => ({
      baseTheme: theme === "dark" ? dark : shadcn,
      variables: {
        colorPrimary: "#1d4ed8",
        colorText: theme === "dark" ? "#f8fafc" : "#0f172a",
        colorBackground: theme === "dark" ? "#0f172a" : "#f3f4f6",
      },
    }),
    [theme]
  );

  return <ClerkProvider appearance={appearance}>{children}</ClerkProvider>;
}
