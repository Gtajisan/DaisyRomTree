import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Smartphone, Edit, Trash2, GitBranch } from "lucide-react";
import type { DeviceConfig } from "@shared/schema";
import { DeviceDialog } from "@/components/device-dialog";

export default function Devices() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig | null>(null);

  const { data: devices, isLoading } = useQuery<DeviceConfig[]>({
    queryKey: ["/api/devices"],
  });

  const handleEdit = (device: DeviceConfig) => {
    setSelectedDevice(device);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedDevice(null);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Devices</h1>
          <p className="text-sm text-muted-foreground">
            Manage your device configurations and trees
          </p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-device">
          <Plus className="h-4 w-4" />
          Add Device
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : devices && devices.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <Card key={device.id} data-testid={`card-device-${device.id}`} className="hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{device.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {device.manufacturer}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(device)}
                      data-testid={`button-edit-${device.id}`}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Codename</span>
                    <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                      {device.codename}
                    </code>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Platform</span>
                    <span className="font-medium">{device.platform}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {device.lineageVersion}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Android {device.androidVersion}
                  </Badge>
                </div>

                {device.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {device.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Smartphone className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No devices configured</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Get started by adding your first device configuration
            </p>
            <Button onClick={handleAdd} className="mt-6" data-testid="button-add-first-device">
              <Plus className="h-4 w-4" />
              Add Device
            </Button>
          </CardContent>
        </Card>
      )}

      <DeviceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        device={selectedDevice}
      />
    </div>
  );
}
