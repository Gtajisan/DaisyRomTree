import { 
  Smartphone, 
  Code2, 
  GitBranch, 
  FileCode, 
  LayoutDashboard,
  Settings,
  Github
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    testId: "nav-dashboard",
  },
  {
    title: "Devices",
    url: "/devices",
    icon: Smartphone,
    testId: "nav-devices",
  },
  {
    title: "Repositories",
    url: "/repositories",
    icon: GitBranch,
    testId: "nav-repositories",
  },
  {
    title: "Build Scripts",
    url: "/build-scripts",
    icon: FileCode,
    testId: "nav-build-scripts",
  },
  {
    title: "Script Generator",
    url: "/generator",
    icon: Code2,
    testId: "nav-generator",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary">
            <Code2 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">ROM Builder</span>
            <span className="text-xs text-muted-foreground">Device Tree Manager</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/50 p-3">
          <Github className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs font-medium">GitHub Connected</span>
            <span className="text-xs text-muted-foreground">Gtajisan</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
