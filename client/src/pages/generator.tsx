import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Code2, Copy, Download, Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { DeviceConfig, Repository } from "@shared/schema";

export default function Generator() {
  const { toast } = useToast();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [manifest, setManifest] = useState("https://github.com/NeedAlt-Room");
  const [kernelBranch, setKernelBranch] = useState("lineage-23.0-bpf-test");
  const [kernelClang, setKernelClang] = useState("zyc clang 22");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");

  const { data: devices } = useQuery<DeviceConfig[]>({
    queryKey: ["/api/devices"],
  });

  const { data: repositories } = useQuery<Repository[]>({
    queryKey: ["/api/repositories"],
    enabled: !!selectedDevice,
  });

  const deviceRepos = repositories?.filter(r => r.deviceId === selectedDevice);
  const selectedDeviceData = devices?.find(d => d.id === selectedDevice);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("POST", "/api/generate-script", {
        deviceId: selectedDevice,
        manifest,
        kernelBranch,
        kernelClang,
        notes: additionalNotes,
      });
      return result;
    },
    onSuccess: (data: any) => {
      setGeneratedScript(data.content);
      toast({
        title: "Script generated",
        description: "Build script has been generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/upload-to-github", {
        deviceId: selectedDevice,
        script: generatedScript,
      });
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Device trees have been uploaded to your GitHub account",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    toast({
      title: "Copied to clipboard",
      description: "Build script has been copied successfully",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedDeviceData?.codename || 'device'}_recipe.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Download started",
      description: "Build script is being downloaded",
    });
  };

  const handleGenerate = () => {
    if (!selectedDevice) {
      toast({
        title: "Device required",
        description: "Please select a device to generate the build script",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Build Script Generator</h1>
        <p className="text-sm text-muted-foreground">
          Generate LineageOS 23.0 compatible build scripts for your device
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Set up your build parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="device">Device</Label>
                <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                  <SelectTrigger id="device" data-testid="select-generator-device">
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices?.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.name} ({device.codename})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDeviceData && (
                <div className="rounded-md border border-border bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform</span>
                    <code className="font-mono">{selectedDeviceData.platform}</code>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Android Version</span>
                    <Badge variant="secondary">{selectedDeviceData.androidVersion}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">LineageOS</span>
                    <Badge variant="outline">{selectedDeviceData.lineageVersion}</Badge>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="manifest">Manifest Source</Label>
                <Input
                  id="manifest"
                  value={manifest}
                  onChange={(e) => setManifest(e.target.value)}
                  placeholder="https://github.com/NeedAlt-Room"
                  className="font-mono text-sm"
                  data-testid="input-manifest"
                />
                <p className="text-xs text-muted-foreground">
                  Source for the LineageOS manifest
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kernel-branch">Kernel Branch</Label>
                <Input
                  id="kernel-branch"
                  value={kernelBranch}
                  onChange={(e) => setKernelBranch(e.target.value)}
                  placeholder="lineage-23.0-bpf-test"
                  className="font-mono"
                  data-testid="input-kernel-branch"
                />
                <p className="text-xs text-muted-foreground">
                  Kernel tree branch for compilation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kernel-clang">Kernel Clang</Label>
                <Input
                  id="kernel-clang"
                  value={kernelClang}
                  onChange={(e) => setKernelClang(e.target.value)}
                  placeholder="zyc clang 22"
                  className="font-mono"
                  data-testid="input-kernel-clang"
                />
                <p className="text-xs text-muted-foreground">
                  Clang version for kernel compilation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Add any custom patches or modifications..."
                  rows={4}
                  data-testid="input-notes"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full"
                disabled={!selectedDevice || generateMutation.isPending}
                data-testid="button-generate"
              >
                <Code2 className="h-4 w-4" />
                {generateMutation.isPending ? "Generating..." : "Generate Build Script"}
              </Button>
            </CardContent>
          </Card>

          {deviceRepos && deviceRepos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Device Repositories</CardTitle>
                <CardDescription className="text-xs">
                  {deviceRepos.length} repositories configured
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deviceRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between rounded-md border border-border p-2 text-sm"
                    >
                      <div className="flex-1 truncate">
                        <code className="text-xs font-mono">{repo.name}</code>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {repo.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Script</CardTitle>
                  <CardDescription>Build script preview</CardDescription>
                </div>
                {generatedScript && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      data-testid="button-copy-generated"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      data-testid="button-download-generated"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedScript ? (
                <ScrollArea className="h-[500px] w-full rounded-md border bg-muted/50">
                  <pre className="p-4">
                    <code className="text-xs font-mono" data-testid="text-generated-script">
                      {generatedScript}
                    </code>
                  </pre>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-16">
                  <Code2 className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm font-medium">No script generated yet</p>
                  <p className="text-xs text-muted-foreground">
                    Configure and generate your build script
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {generatedScript && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload to GitHub</CardTitle>
                <CardDescription className="text-xs">
                  Push device trees to Gtajisan account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-chart-2 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Ready to upload</p>
                      <p className="text-xs text-muted-foreground">
                        This will create or update repositories in your GitHub account.
                        Existing repositories will be updated safely.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => uploadMutation.mutate()} 
                  className="w-full"
                  disabled={uploadMutation.isPending}
                  data-testid="button-upload-github"
                >
                  <Upload className="h-4 w-4" />
                  {uploadMutation.isPending ? "Uploading..." : "Upload to GitHub"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
