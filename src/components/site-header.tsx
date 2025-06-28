import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

export function SiteHeader() {
  const { t } = useTranslation("app-sidebar");
  const [title, setTitle] = useState("");
  const currentPath = useLocation();

  const navMain = useMemo(
    () => [
      {
        title: t("dashboard"),
        url: "/dash",
      },
      {
        title: t("realEstates"),
        url: "/dash/real-states",
      },
      // {
      //   title: t("tasks"),
      //   url: "/dash/tasks",
      // },
      {
        title: t("calendar"),
        url: "/dash/calender",
      },
      // {
      //   title: t("contacts"),
      //   url: "/dash/contacts",
      // },
      {
        title: t("documents"),
        url: "/dash/documents",
      },
      {
        title: t("reports"),
        url: "/dash/reports",
      },
      {
        title: t("rentals"),
        url: "/dash/rentals",
      },
      {
        title: t("settings"),
        url: "/dash/settings",
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
    </header>
  );
}
