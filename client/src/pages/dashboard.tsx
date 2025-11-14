import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, GitBranch, FileCode, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeviceConfig, Repository, BuildScript } from "@shared/schema";

export default function Dashboard() {
  const { data: devices, isLoading: devicesLoading } = useQuery<DeviceConfig[]>({
    queryKey: ["/api/devices"],
  });

  const { data: repositories, isLoading: reposLoading } = useQuery<Repository[]>({
    queryKey: ["/api/repositories"],
  });

  const { data: buildScripts, isLoading: scriptsLoading } = useQuery<BuildScript[]>({
    queryKey: ["/api/build-scripts"],
  });

  const stats = [
    {
      title: "Active Devices",
      value: devices?.length || 0,
      icon: Smartphone,
      description: "Configured device trees",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      testId: "stat-devices",
    },
    {
      title: "Repositories",
      value: repositories?.length || 0,
      icon: GitBranch,
      description: "Tracked repositories",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      testId: "stat-repositories",
    },
    {
      title: "Build Scripts",
      value: buildScripts?.length || 0,
      icon: FileCode,
      description: "Generated scripts",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      testId: "stat-scripts",
    },
    {
      title: "Last Activity",
      value: "Today",
      icon: Activity,
      description: "Recent changes",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      testId: "stat-activity",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your custom ROM device tree configurations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {devicesLoading || reposLoading || scriptsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid={`${stat.testId}-value`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href="/devices"
              className="flex flex-col gap-2 rounded-md border border-border bg-card p-4 transition-colors hover-elevate active-elevate-2"
              data-testid="link-add-device"
            >
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Add Device</div>
                <div className="text-xs text-muted-foreground">Configure new device tree</div>
              </div>
            </a>

            <a
              href="/generator"
              className="flex flex-col gap-2 rounded-md border border-border bg-card p-4 transition-colors hover-elevate active-elevate-2"
              data-testid="link-generate-script"
            >
              <FileCode className="h-5 w-5 text-chart-2" />
              <div>
                <div className="font-medium">Generate Script</div>
                <div className="text-xs text-muted-foreground">Create build script</div>
              </div>
            </a>

            <a
              href="/repositories"
              className="flex flex-col gap-2 rounded-md border border-border bg-card p-4 transition-colors hover-elevate active-elevate-2"
              data-testid="link-manage-repos"
            >
              <GitBranch className="h-5 w-5 text-chart-3" />
              <div>
                <div className="font-medium">Manage Repos</div>
                <div className="text-xs text-muted-foreground">View repositories</div>
              </div>
            </a>

            <a
              href="/build-scripts"
              className="flex flex-col gap-2 rounded-md border border-border bg-card p-4 transition-colors hover-elevate active-elevate-2"
              data-testid="link-view-scripts"
            >
              <FileCode className="h-5 w-5 text-chart-4" />
              <div>
                <div className="font-medium">View Scripts</div>
                <div className="text-xs text-muted-foreground">Browse build scripts</div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Devices</CardTitle>
            <CardDescription>Latest configured device trees</CardDescription>
          </CardHeader>
          <CardContent>
            {devicesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : devices && devices.length > 0 ? (
              <div className="space-y-4">
                {devices.slice(0, 3).map((device) => (
                  <div
                    key={device.id}
                    className="flex items-start gap-4"
                    data-testid={`device-${device.id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{device.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {device.codename} • {device.lineageVersion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Smartphone className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm font-medium">No devices yet</p>
                <p className="text-xs text-muted-foreground">
                  Add your first device to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
