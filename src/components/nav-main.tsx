import { type Icon } from "@tabler/icons-react";
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

import CreateNewRental from "./navmenu/createNewRental";
import CreateNewUnit from "./navmenu/createNewUnit";

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

  const getPathWithoutLang = (pathname: string) => {
    const segments = pathname.split("/");
    if (segments.length > 2 && segments[1].match(/^[a-z]{2}(-[A-Z]{2})?$/)) {
      return "/" + segments.slice(2).join("/");
    }
    return pathname;
  };

  const currentPath = getPathWithoutLang(location.pathname);
  console.log(currentPath);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            {currentPath === "/dash/real-estates" ? (
              <CreateNewUnit />
            ) : (
              <CreateNewRental />
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <LocalizedLink to={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    currentPath.startsWith(item.url)
                      ? "cursor-default"
                      : "cursor-pointer",
                  )}
                  isActive={
                    item.url === "/dash"
                      ? currentPath === "/dash"
                      : currentPath.startsWith(item.url)
                  }
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
