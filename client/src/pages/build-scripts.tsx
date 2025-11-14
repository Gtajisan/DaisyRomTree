import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCode, Plus, Copy, Download, Eye } from "lucide-react";
import type { BuildScript } from "@shared/schema";
import { BuildScriptDialog } from "@/components/build-script-dialog";
import { useToast } from "@/hooks/use-toast";

export default function BuildScripts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<BuildScript | null>(null);
  const { toast } = useToast();

  const { data: buildScripts, isLoading } = useQuery<BuildScript[]>({
    queryKey: ["/api/build-scripts"],
  });

  const handleView = (script: BuildScript) => {
    setSelectedScript(script);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedScript(null);
    setDialogOpen(true);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Build script has been copied successfully",
    });
  };

  const handleDownload = (script: BuildScript) => {
    const blob = new Blob([script.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.name}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Download started",
      description: "Build script is being downloaded",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Build Scripts</h1>
          <p className="text-sm text-muted-foreground">
            Manage generated build scripts for LineageOS
          </p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-script">
          <Plus className="h-4 w-4" />
          New Script
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : buildScripts && buildScripts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {buildScripts.map((script) => (
            <Card key={script.id} data-testid={`card-script-${script.id}`} className="hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <FileCode className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{script.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(script.createdAt!).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {script.manifest && (
                  <div className="rounded bg-muted p-2">
                    <p className="text-xs text-muted-foreground">Manifest</p>
                    <code className="block truncate text-xs font-mono">
                      {script.manifest}
                    </code>
                  </div>
                )}

                {script.notes && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {script.notes}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(script)}
                    data-testid={`button-view-${script.id}`}
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(script.content)}
                    data-testid={`button-copy-${script.id}`}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(script)}
                    data-testid={`button-download-${script.id}`}
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <FileCode className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No build scripts yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Generate your first build script from the Script Generator
            </p>
            <Button onClick={handleAdd} className="mt-6" data-testid="button-add-first-script">
              <Plus className="h-4 w-4" />
              Create Script
            </Button>
          </CardContent>
        </Card>
      )}

      <BuildScriptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        script={selectedScript}
      />
    </div>
  );
}
