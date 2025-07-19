import * as React from "react";
import { IconDashboard, IconHelp, IconClover2, IconUsers } from "@tabler/icons-react";

import { NavMain } from "@/components/Admin/nav-main";
import { NavSecondary } from "@/components/Admin/nav-secondary";
import { NavUser } from "@/components/Admin/nav-user";
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
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === "ar-SA";
  const { t, i18n } = useTranslation("app-sidebar");
  const locale = i18n.language;

  const data = {
    user: {
      name: "Ahmed bin Ali",
      email: "ahmedbinali@gmail.com",
      avatar: "https://mdbcdn.b-cdn.net/img/new/avatars/2.webp",
    },
    navMain: [
      {
        title: t("dashboard"),
        url: "/admin",
        icon: IconDashboard,
      },
      {
        title: t("admin.users"),
        url: "/admin/users",
        icon: IconUsers,
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
    ],
  };
  return (
    <Sidebar
      collapsible="offcanvas"
      side={isRTL ? "right" : "left"}
      className={cn(props.className)}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                "data-[slot=sidebar-menu-button]:!p-1.5",
                isRTL && "flex-row-reverse",
              )}
            >
              <LocalizedLink
                to="/"
                className={`flex items-center justify-between`}
              >
                <div
                  className={`flex items-center gap-2 ${locale === "ar-SA" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <IconClover2 className="!size-5" />
                  <span className="text-base font-semibold">K Cloud</span>
                </div>
                <Badge
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  {t("adminTag")}
                </Badge>
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
