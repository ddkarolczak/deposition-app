import { IconDashboard, IconSettings } from "@tabler/icons-react";
import { MessageCircle, Upload, FileText, BarChart3, Users } from "lucide-react";
import { Link } from "react-router";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard as any,
    },
    {
      title: "Upload",
      url: "/dashboard/upload",
      icon: Upload as any,
    },
    {
      title: "Documents",
      url: "/dashboard/documents",
      icon: FileText as any,
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: BarChart3 as any,
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: MessageCircle as any,
    },
  ],
  navSecondary: [
    {
      title: "Team",
      url: "/dashboard/team",
      icon: Users as any,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings as any,
    },
  ],
};

export function AppSidebar({
  variant,
  user,
}: {
  variant: "sidebar" | "floating" | "inset";
  user: any;
}) {
  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/" prefetch="viewport">
              <span className="text-base font-semibold">Deposition Objection Tool</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
