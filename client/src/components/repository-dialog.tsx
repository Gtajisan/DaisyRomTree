import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertRepositorySchema, type Repository, type DeviceConfig } from "@shared/schema";
import { z } from "zod";

const formSchema = insertRepositorySchema.extend({
  deviceId: z.string().min(1, "Device is required"),
  name: z.string().min(1, "Repository name is required"),
  url: z.string().url("Valid URL is required"),
  branch: z.string().min(1, "Branch is required"),
  path: z.string().min(1, "Path is required"),
  category: z.string().min(1, "Category is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface RepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository?: Repository | null;
}

export function RepositoryDialog({ open, onOpenChange, repository }: RepositoryDialogProps) {
  const { toast } = useToast();

  const { data: devices } = useQuery<DeviceConfig[]>({
    queryKey: ["/api/devices"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceId: repository?.deviceId || "",
      name: repository?.name || "",
      url: repository?.url || "",
      branch: repository?.branch || "16",
      path: repository?.path || "",
      depth: repository?.depth || "1",
      category: repository?.category || "device",
      status: repository?.status || "pending",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (repository) {
        return apiRequest("PATCH", `/api/repositories/${repository.id}`, data);
      }
      return apiRequest("POST", "/api/repositories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
      toast({
        title: repository ? "Repository updated" : "Repository added",
        description: repository 
          ? "Repository configuration has been updated successfully"
          : "New repository has been added successfully",
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
          <DialogTitle>{repository ? "Edit Repository" : "Add Repository"}</DialogTitle>
          <DialogDescription>
            {repository 
              ? "Update the repository configuration"
              : "Add a new repository for your device tree"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-device">
                        <SelectValue placeholder="Select a device" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {devices?.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} ({device.codename})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="android_device_xiaomi_daisy" 
                        className="font-mono"
                        {...field}
                        data-testid="input-repo-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="device">Device</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="kernel">Kernel</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://github.com/Gtajisan/android_device_xiaomi_daisy" 
                      className="font-mono text-sm"
                      {...field}
                      data-testid="input-repo-url"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Full GitHub repository URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="16" 
                        className="font-mono"
                        {...field}
                        data-testid="input-branch"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="depth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clone Depth</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1" 
                        className="font-mono"
                        {...field}
                        data-testid="input-depth"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="synced">Synced</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local Path</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="device/xiaomi/daisy" 
                      className="font-mono"
                      {...field}
                      data-testid="input-path"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Target path in the build environment
                  </FormDescription>
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
                data-testid="button-submit-repo"
              >
                {createMutation.isPending ? "Saving..." : repository ? "Update" : "Add Repository"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
