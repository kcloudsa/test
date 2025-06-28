import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation } from "react-router";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const location = useLocation();
  const { t } = useTranslation("app-sidebar");

  // Extract the path without the language prefix
  const getPathWithoutLang = (pathname: string) => {
    const segments = pathname.split('/');
    // Remove empty first segment and language segment (e.g., 'en', 'ar-SA')
    if (segments.length > 2 && segments[1].match(/^[a-z]{2}(-[A-Z]{2})?$/)) {
      return '/' + segments.slice(2).join('/');
    }
    return pathname;
  };

  const currentPath = getPathWithoutLang(location.pathname);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className={cn(
            "flex items-center gap-2",
          )}>
            <SidebarMenuButton
              tooltip={t("CreateNewRental")}
              className={cn(
              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear",
              )}
            >
              <IconCirclePlusFilled />
              <span>{t("CreateNewRental")}</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">{t("inbox")}</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <LocalizedLink to={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    currentPath === item.url
                      ? "cursor-default"
                      : "cursor-pointer",
                  )}
                  isActive={currentPath === item.url}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </LocalizedLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
