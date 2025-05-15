"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";

import { Calendar, Home, Inbox, Search, Settings, Plus, ChartNoAxesGantt, ChartArea, User2, ChevronDown, ChevronUp, Pencil} from "lucide-react";
import {
  SidebarHeader,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { ModeToggle } from "@/components/theme-toggle";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Create",
    url: "/create",
    icon: Plus,
  },
  {
    title: "Manage",
    url: "/manage",
    icon: ChartNoAxesGantt,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartArea,
  },
  // {
  //   title: "Settings",
  //   url: "/settings",
  //   icon: Settings,
  // },
];

export function AppSidebar({ ...props }) {

  const { user, logout } = useContext(AuthContext);
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user?.username}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                {/* <DropdownMenuItem>
                  <span>Settings</span>
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={logout}>
                  <span>Sign out</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ModeToggle/>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {/* <!-- OneTrust Cookies Settings button start --> */}
                  <button id="ot-sdk-btn" class="ot-sdk-show-settings">Cookie Settings</button>
                  {/* <!-- OneTrust Cookies Settings button end --> */}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
