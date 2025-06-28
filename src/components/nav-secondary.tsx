"use client";

import * as React from "react";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/i18n/components/LanguageSwitcher";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";
import { useLocation } from "react-router";
import { cn } from "@/lib/utils";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const location = useLocation();
  
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
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={cn(
                  currentPath === item.url
                    ? "cursor-default"
                    : "cursor-pointer",
                )}
                isActive={currentPath === item.url}
              >
                <LocalizedLink to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </LocalizedLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <LanguageSwitcher className="w-full" />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
