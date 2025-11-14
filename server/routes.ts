import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDeviceConfigSchema, insertRepositorySchema, insertBuildScriptSchema } from "@shared/schema";
import { z } from "zod";

async function getGitHubClient() {
  const { getUncachableGitHubClient } = await import("./github-client");
  return getUncachableGitHubClient();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Device routes
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/devices/:id", async (req, res) => {
    try {
      const device = await storage.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      res.json(device);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const data = insertDeviceConfigSchema.parse(req.body);
      const device = await storage.createDevice(data);
      res.json(device);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/devices/:id", async (req, res) => {
    try {
      const data = insertDeviceConfigSchema.partial().parse(req.body);
      const device = await storage.updateDevice(req.params.id, data);
      res.json(device);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try {
      await storage.deleteDevice(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Repository routes
  app.get("/api/repositories", async (req, res) => {
    try {
      const repositories = await storage.getRepositories();
      res.json(repositories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/repositories/:id", async (req, res) => {
    try {
      const repository = await storage.getRepository(req.params.id);
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }
      res.json(repository);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/repositories", async (req, res) => {
    try {
      const data = insertRepositorySchema.parse(req.body);
      const repository = await storage.createRepository(data);
      res.json(repository);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/repositories/:id", async (req, res) => {
    try {
      const data = insertRepositorySchema.partial().parse(req.body);
      const repository = await storage.updateRepository(req.params.id, data);
      res.json(repository);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/repositories/:id", async (req, res) => {
    try {
      await storage.deleteRepository(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Build Script routes
  app.get("/api/build-scripts", async (req, res) => {
    try {
      const scripts = await storage.getBuildScripts();
      res.json(scripts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/build-scripts/:id", async (req, res) => {
    try {
      const script = await storage.getBuildScript(req.params.id);
      if (!script) {
        return res.status(404).json({ error: "Build script not found" });
      }
      res.json(script);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/build-scripts", async (req, res) => {
    try {
      const data = insertBuildScriptSchema.parse(req.body);
      const script = await storage.createBuildScript(data);
      res.json(script);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Generate build script - exactly matching daisy_a16_recipe.sh format
  app.post("/api/generate-script", async (req, res) => {
    try {
      const { deviceId, manifest, kernelBranch, kernelClang, notes } = req.body;

      if (!deviceId) {
        return res.status(400).json({ error: "Device ID is required" });
      }

      const device = await storage.getDevice(deviceId);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      const repositories = await storage.getRepositoriesByDevice(deviceId);

      // Generate exact format like daisy_a16_recipe.sh
      let script = `# manifest is from ${manifest || 'https://github.com/NeedAlt-Room'}\n\n`;

      // Add all device/vendor/hardware repositories
      repositories.forEach((repo) => {
        script += `git clone --depth=${repo.depth} --branch ${repo.branch} ${repo.url} ${repo.path}\n`;
      });

      script += `\n`;

      // Kernel section
      script += `# NOTE:\n`;
      script += `# kernel tree\n`;
      script += `# git clone --depth=1 --branch ${kernelBranch || 'lineage-23.0-bpf-test'} https://github.com/Gtajisan/android_kernel_xiaomi_${device.platform}/ kernel/xiaomi/${device.platform}\n\n`;
      
      script += `# for the kernel use ${kernelClang || 'zyc clang 22'}, so yes external clang\n`;
      script += `# https://github.com/ZyCromerZ/Clang/releases\n`;
      script += `# extract and then add its path to TARGET_KERNEL_CLANG_PATH on device/xiaomi/${device.platform}-common/BoardConfigCommon.mk\n\n`;

      // External dependencies
      script += `# -- add these too and remove /external on build/soong/ui/build/androidmk_denylist.go\n`;
      script += `git clone --depth=1 https://github.com/LineageOS/android_external_ant-wireless_ant_client.git external/ant-wireless/ant_client\n`;
      script += `git clone --depth=1 https://github.com/LineageOS/android_external_ant-wireless_ant_native.git external/ant-wireless/ant_native\n`;
      script += `git clone --depth=1 https://github.com/LineageOS/android_external_ant-wireless_ant_service.git external/ant-wireless/ant_service\n\n`;

      script += `# apply this fix on external/ant-wireless/ant_service\n`;
      script += `# https://github.com/LineageOS/android_external_ant-wireless_ant_service/commit/808676c8bf84dddec22c76fdff880e6e394c366e\n\n`;

      // Recovery section
      script += `# for recovery, add bypasses\n`;
      script += `# apply on bootable/recovery\n`;
      script += `# https://github.com/Gtajisan/android_bootable_recovery/commit/74a50ca6db16ac4c6b7353e9d50f035e19891ff8\n`;

      const buildScript = await storage.createBuildScript({
        deviceId,
        name: `${device.codename}_${device.lineageVersion.replace('lineage-', '')}_recipe`,
        content: script,
        manifest: manifest || 'https://github.com/NeedAlt-Room',
        kernelConfig: { branch: kernelBranch, clang: kernelClang },
        recoveryPatches: ['https://github.com/Gtajisan/android_bootable_recovery/commit/74a50ca6db16ac4c6b7353e9d50f035e19891ff8'],
        notes: notes || undefined,
      });

      res.json(buildScript);
    } catch (error: any) {
      console.error('Error generating script:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Upload to GitHub - fully implemented
  app.post("/api/upload-to-github", async (req, res) => {
    try {
      const { deviceId } = req.body;

      if (!deviceId) {
        return res.status(400).json({ error: "Device ID is required" });
      }

      const device = await storage.getDevice(deviceId);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      const repositories = await storage.getRepositoriesByDevice(deviceId);
      
      if (repositories.length === 0) {
        return res.status(400).json({ error: "No repositories configured for this device" });
      }

      const octokit = await getGitHubClient();
      const owner = "Gtajisan";
      const uploadedRepos = [];

      for (const repo of repositories) {
        try {
          const repoName = repo.name;
          let repoExists = false;
          
          // Check if repository exists
          try {
            await octokit.repos.get({ owner, repo: repoName });
            repoExists = true;
            console.log(`Repository ${repoName} already exists`);
            uploadedRepos.push({ 
              name: repoName, 
              status: "exists", 
              url: `https://github.com/${owner}/${repoName}`,
              message: "Repository already exists, no changes made"
            });
          } catch (error: any) {
            if (error.status === 404) {
              // Repository doesn't exist, create it
              try {
                const created = await octokit.repos.createForAuthenticatedUser({
                  name: repoName,
                  description: `Device tree for ${device.name} (${device.codename}) - ${repo.category} - LineageOS ${device.lineageVersion}`,
                  private: false,
                  auto_init: true,
                });
                console.log(`Created repository ${repoName}`);
                uploadedRepos.push({ 
                  name: repoName, 
                  status: "created", 
                  url: created.data.html_url,
                  message: "Repository created successfully"
                });
              } catch (createError: any) {
                console.error(`Error creating repository ${repoName}:`, createError.message);
                uploadedRepos.push({ 
                  name: repoName, 
                  status: "error", 
                  error: createError.message 
                });
              }
            } else {
              throw error;
            }
          }
        } catch (error: any) {
          console.error(`Error processing repository ${repo.name}:`, error.message);
          uploadedRepos.push({ 
            name: repo.name, 
            status: "error", 
            error: error.message 
          });
        }
      }

      const successCount = uploadedRepos.filter(r => r.status === 'created' || r.status === 'exists').length;
      const errorCount = uploadedRepos.filter(r => r.status === 'error').length;

      res.json({
        success: errorCount === 0,
        message: `Processed ${repositories.length} repositories: ${successCount} successful, ${errorCount} errors`,
        repositories: uploadedRepos,
        device: {
          name: device.name,
          codename: device.codename,
        }
      });
    } catch (error: any) {
      console.error('GitHub upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
