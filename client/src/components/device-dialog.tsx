import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertDeviceConfigSchema, type DeviceConfig } from "@shared/schema";
import { z } from "zod";

const formSchema = insertDeviceConfigSchema.extend({
  name: z.string().min(1, "Device name is required"),
  codename: z.string().min(1, "Codename is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  platform: z.string().min(1, "Platform is required"),
  androidVersion: z.string().min(1, "Android version is required"),
  lineageVersion: z.string().min(1, "LineageOS version is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface DeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: DeviceConfig | null;
}

export function DeviceDialog({ open, onOpenChange, device }: DeviceDialogProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: device?.name || "",
      codename: device?.codename || "",
      manufacturer: device?.manufacturer || "",
      platform: device?.platform || "",
      androidVersion: device?.androidVersion || "",
      lineageVersion: device?.lineageVersion || "",
      description: device?.description || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (device) {
        return apiRequest("PATCH", `/api/devices/${device.id}`, data);
      }
      return apiRequest("POST", "/api/devices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: device ? "Device updated" : "Device created",
        description: device 
          ? "Device configuration has been updated successfully"
          : "New device configuration has been created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{device ? "Edit Device" : "Add Device"}</DialogTitle>
          <DialogDescription>
            {device 
              ? "Update the device configuration details"
              : "Configure a new device tree for your custom ROM build"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Xiaomi Mi A2 Lite" 
                        {...field}
                        data-testid="input-device-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codename"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codename</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="daisy" 
                        className="font-mono"
                        {...field}
                        data-testid="input-codename"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Xiaomi" 
                        {...field}
                        data-testid="input-manufacturer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="msm8953" 
                        className="font-mono"
                        {...field}
                        data-testid="input-platform"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="androidVersion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Android Version</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="16" 
                        {...field}
                        data-testid="input-android-version"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lineageVersion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LineageOS Version</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="lineage-23.0" 
                        className="font-mono"
                        {...field}
                        data-testid="input-lineage-version"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this device configuration..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                data-testid="button-submit-device"
              >
                {createMutation.isPending ? "Saving..." : device ? "Update Device" : "Create Device"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
