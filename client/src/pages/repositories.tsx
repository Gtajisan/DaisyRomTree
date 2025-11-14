import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Plus, GitBranch, Search, Upload, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { Repository } from "@shared/schema";
import { RepositoryDialog } from "@/components/repository-dialog";

const categoryColors: Record<string, string> = {
  device: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  vendor: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  kernel: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  hardware: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  external: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

const statusIcons = {
  synced: { icon: CheckCircle2, color: "text-status-online" },
  pending: { icon: Clock, color: "text-status-away" },
  error: { icon: AlertCircle, color: "text-status-busy" },
};

export default function Repositories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: repositories, isLoading } = useQuery<Repository[]>({
    queryKey: ["/api/repositories"],
  });

  const filteredRepos = repositories?.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (repo: Repository) => {
    setSelectedRepo(repo);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedRepo(null);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Repositories</h1>
          <p className="text-sm text-muted-foreground">
            Manage device tree repositories and dependencies
          </p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-repository">
          <Plus className="h-4 w-4" />
          Add Repository
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-repos"
        />
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
      ) : filteredRepos && filteredRepos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepos.map((repo) => {
            const StatusIcon = statusIcons[repo.status as keyof typeof statusIcons]?.icon || Clock;
            const statusColor = statusIcons[repo.status as keyof typeof statusIcons]?.color || "text-muted-foreground";

            return (
              <Card key={repo.id} data-testid={`card-repo-${repo.id}`} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                        <GitBranch className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base truncate">{repo.name}</CardTitle>
                        <CardDescription className="text-xs truncate">
                          {repo.path}
                        </CardDescription>
                      </div>
                    </div>
                    <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Branch</span>
                      <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                        {repo.branch}
                      </code>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Depth</span>
                      <span className="font-mono text-xs">{repo.depth}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${categoryColors[repo.category] || 'bg-muted'}`}
                    >
                      {repo.category}
                    </Badge>
                  </div>

                  <div className="rounded bg-muted p-2">
                    <code className="block truncate text-xs font-mono text-muted-foreground">
                      git clone --depth={repo.depth} --branch {repo.branch}
                    </code>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleEdit(repo)}
                    data-testid={`button-view-${repo.id}`}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <GitBranch className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">
              {searchQuery ? "No repositories found" : "No repositories configured"}
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search query"
                : "Add repositories for your device tree build"}
            </p>
            {!searchQuery && (
              <Button onClick={handleAdd} className="mt-6" data-testid="button-add-first-repo">
                <Plus className="h-4 w-4" />
                Add Repository
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <RepositoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        repository={selectedRepo}
      />
    </div>
  );
}
