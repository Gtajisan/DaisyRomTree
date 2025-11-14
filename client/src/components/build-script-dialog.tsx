import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy } from "lucide-react";
import type { BuildScript } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface BuildScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script: BuildScript | null;
}

export function BuildScriptDialog({ open, onOpenChange, script }: BuildScriptDialogProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (script) {
      navigator.clipboard.writeText(script.content);
      toast({
        title: "Copied to clipboard",
        description: "Build script has been copied successfully",
      });
    }
  };

  if (!script) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{script.name}</DialogTitle>
              <DialogDescription>
                Build script for LineageOS
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              data-testid="button-copy-script"
            >
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[500px] w-full rounded-md border bg-muted/50">
          <pre className="p-4">
            <code className="text-xs font-mono">{script.content}</code>
          </pre>
        </ScrollArea>

        {script.notes && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium">Notes</p>
            <p className="mt-1 text-sm text-muted-foreground">{script.notes}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
