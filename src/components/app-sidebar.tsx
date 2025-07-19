import * as React from "react";
import {
  // IconChartBar,
  IconDashboard,
  // IconFolder,
  IconHelp,
  IconClover2,
  IconBuildings,
  IconReport,
  // IconSettings,
  // IconUsers,
  IconReceiptDollar,
  // IconCalendar,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";
import { useTranslation } from 'react-i18next';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar-SA';
  const { t } = useTranslation("app-sidebar");
  
  const data = {
    user: {
      name: "Ahmed bin Ali",
      email: "ahmedbinali@gmail.com",
      avatar: "https://mdbcdn.b-cdn.net/img/new/avatars/2.webp",
    },
    navMain: [
      {
        title: t("dashboard"),
        url: "/dash",
        icon: IconDashboard,
      },
      {
        title: t("realEstates"),
        url: "/dash/real-estates",
        icon: IconBuildings,
      },
      // {
      //   title: t("tasks"),
      //   url: "/dash/tasks",
      //   icon: IconChartBar,
      // },
      // {
      //   title: t("calendar"),
      //   url: "/dash/calender",
      //   icon: IconCalendar,
      // },
      // {
      //   title: t("contacts"),
      //   url: "/dash/contacts",
      //   icon: IconUsers,
      // },
      // {
      //   title: t("documents"),
      //   url: "/dash/documents",
      //   icon: IconFolder,
      // },
      {
        title: t("reports"),
        url: "/dash/reports",
        icon: IconReport,
      },
      {
        title: t("rentals"),
        url: "/dash/rentals",
        icon: IconReceiptDollar,
      },
    ],
    navSecondary: [
      // {
      //   title: t("settings"),
      //   url: "/dash/settings",
      //   icon: IconSettings,
      // },
      {
        title: t("getHelp"),
        url: "#",
        icon: IconHelp,
      },
    ]
  };
  return (
    <Sidebar 
      collapsible="offcanvas" 
      side={isRTL ? "right" : "left"}
      className={cn(
        props.className
      )}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                "data-[slot=sidebar-menu-button]:!p-1.5",
                isRTL && "flex-row-reverse"
              )}
            >
              <LocalizedLink to="/">
                <IconClover2 className="!size-5" />
                <span className="text-base font-semibold">K Cloud</span>
              </LocalizedLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}