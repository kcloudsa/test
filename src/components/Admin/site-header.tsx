import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";

export function SiteHeader() {
  const { t } = useTranslation("app-sidebar");
  const [title, setTitle] = useState("");
  const currentPath = useLocation();

  // Theme select logic (copied from AppearanceTab)
  const { theme, setTheme } = useTheme();

  const navMain = useMemo(
    () => [
      {
        title: t("dashboard"),
        url: "/admin",
      },
      {
        title: t("admin.users"),
        url: "/admin/users",
      },
    ],
    [t],
  );

  useEffect(() => {
    // Remove the language prefix (e.g., /en-US) from the path
    const pathWithoutLang = currentPath.pathname.replace(
      /^\/[a-z]{2}-[A-Z]{2}/,
      "",
    );

    const matchedNav = navMain.find((nav) => nav.url === pathWithoutLang);
    setTitle(matchedNav ? matchedNav.title : "");
  }, [currentPath.pathname, navMain]);

  // For translations, use the same keys as in AppearanceTab
  const { t: tSettings } = useTranslation("settings");

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
      <div className="flex items-center px-4 lg:gap-2 lg:px-6">
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-[110px]">
            <div className="flex items-center space-x-2">
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>{tSettings("Appearance.themeMode.system")}</span>
              </div>
            </SelectItem>
            <SelectItem value="light">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <span>{tSettings("Appearance.themeMode.light")}</span>
              </div>
            </SelectItem>
            <SelectItem value="dark">
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4" />
                <span>{tSettings("Appearance.themeMode.dark")}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
