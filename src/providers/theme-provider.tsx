import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import type { Theme, ResolvedTheme, Color, FontSize, ThemeProviderProps, ThemeProviderState } from "@/types";

const initialState: ThemeProviderState = {
  theme: "system",
  color: "default",
  fontSize: "medium",
  resolvedTheme: "light",
  systemTheme: "light",
  setTheme: () => null,
  setColor: () => null,
  setFontSize: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

const getStoredTheme = (storageKey: string): Theme | null => {
  // Try cookie first, then localStorage
  const cookieTheme = Cookies.get(storageKey);
  if (cookieTheme && ["dark", "light", "system"].includes(cookieTheme)) {
    return cookieTheme as Theme;
  }

  const localTheme = localStorage.getItem(storageKey);
  if (localTheme && ["dark", "light", "system"].includes(localTheme)) {
    return localTheme as Theme;
  }

  return null;
};

const getStoredColor = (storageKey: string): Color | null => {
  // Try cookie first, then localStorage
  const cookieColor = Cookies.get(storageKey);
  if (
    cookieColor &&
    [
      "default",
      "red",
      "rose",
      "orange",
      "green",
      "blue",
      "yellow",
      "violet",
    ].includes(cookieColor)
  ) {
    return cookieColor as Color;
  }

  const localColor = localStorage.getItem(storageKey);
  if (
    localColor &&
    [
      "default",
      "red",
      "rose",
      "orange",
      "green",
      "blue",
      "yellow",
      "violet",
    ].includes(localColor)
  ) {
    return localColor as Color;
  }

  return null;
};

const getStoredFontSize = (storageKey: string): FontSize | null => {
  // Try cookie first, then localStorage
  const cookieFontSize = Cookies.get(storageKey);
  if (
    cookieFontSize &&
    ["small", "medium", "large", "extra-large"].includes(cookieFontSize)
  ) {
    return cookieFontSize as FontSize;
  }

  const localFontSize = localStorage.getItem(storageKey);
  if (
    localFontSize &&
    ["small", "medium", "large", "extra-large"].includes(localFontSize)
  ) {
    return localFontSize as FontSize;
  }

  return null;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColor = "default",
  defaultFontSize = "medium",
  storageKey = "k-cloud-theme",
  colorStorageKey = "k-cloud-color",
  fontSizeStorageKey = "k-cloud-font-size",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return getStoredTheme(storageKey) || defaultTheme;
  });

  const [color, setColorState] = useState<Color>(() => {
    return getStoredColor(colorStorageKey) || defaultColor;
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    return getStoredFontSize(fontSizeStorageKey) || defaultFontSize;
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    getSystemTheme(),
  );

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [enableSystem]);

  // Apply theme, color, and font size to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    const currentTheme = theme === "system" ? systemTheme : theme;

    // Remove existing theme, color, and font size classes
    root.classList.remove("light", "dark");
    root.classList.remove(
      "font-small",
      "font-medium",
      "font-large",
      "font-extra-large",
    );
    root.removeAttribute("prefered-color");

    // Apply new theme
    root.classList.add(currentTheme);

    // Apply new color (always set the attribute)
    root.setAttribute("prefered-color", color);

    // Apply new font size
    root.classList.add(`font-${fontSize}`);

    root.style.colorScheme = currentTheme as string;
  }, [theme, color, fontSize, systemTheme, disableTransitionOnChange]);

  const setTheme = (newTheme: Theme) => {
    // Save to both cookie and localStorage
    Cookies.set(storageKey, newTheme, {
      expires: 365, // 1 year
      path: "/",
      sameSite: "lax",
    });
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const setColor = (newColor: Color) => {
    Cookies.set(colorStorageKey, newColor, {
      expires: 365,
      path: "/",
      sameSite: "lax",
    });
    localStorage.setItem(colorStorageKey, newColor);
    setColorState(newColor);
  };

  const setFontSize = (newFontSize: FontSize) => {
    console.log("Setting font size to:", newFontSize); // Debug log
    Cookies.set(fontSizeStorageKey, newFontSize, {
      expires: 365,
      path: "/",
      sameSite: "lax",
    });
    localStorage.setItem(fontSizeStorageKey, newFontSize);
    setFontSizeState(newFontSize);
  };

  const value = {
    theme,
    color,
    fontSize,
    resolvedTheme,
    systemTheme,
    setTheme,
    setColor,
    setFontSize,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
