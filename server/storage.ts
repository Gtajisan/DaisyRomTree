import { type DeviceConfig, type InsertDeviceConfig, type Repository, type InsertRepository, type BuildScript, type InsertBuildScript } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getDevices(): Promise<DeviceConfig[]>;
  getDevice(id: string): Promise<DeviceConfig | undefined>;
  getDeviceByCodename(codename: string): Promise<DeviceConfig | undefined>;
  createDevice(device: InsertDeviceConfig): Promise<DeviceConfig>;
  updateDevice(id: string, device: Partial<InsertDeviceConfig>): Promise<DeviceConfig>;
  deleteDevice(id: string): Promise<void>;

  getRepositories(): Promise<Repository[]>;
  getRepository(id: string): Promise<Repository | undefined>;
  getRepositoriesByDevice(deviceId: string): Promise<Repository[]>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  updateRepository(id: string, repository: Partial<InsertRepository>): Promise<Repository>;
  deleteRepository(id: string): Promise<void>;

  getBuildScripts(): Promise<BuildScript[]>;
  getBuildScript(id: string): Promise<BuildScript | undefined>;
  getBuildScriptsByDevice(deviceId: string): Promise<BuildScript[]>;
  createBuildScript(script: InsertBuildScript): Promise<BuildScript>;
  updateBuildScript(id: string, script: Partial<InsertBuildScript>): Promise<BuildScript>;
  deleteBuildScript(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private devices: Map<string, DeviceConfig>;
  private repositories: Map<string, Repository>;
  private buildScripts: Map<string, BuildScript>;

  constructor() {
    this.devices = new Map();
    this.repositories = new Map();
    this.buildScripts = new Map();
  }

  async getDevices(): Promise<DeviceConfig[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: string): Promise<DeviceConfig | undefined> {
    return this.devices.get(id);
  }

  async getDeviceByCodename(codename: string): Promise<DeviceConfig | undefined> {
    return Array.from(this.devices.values()).find(
      (device) => device.codename === codename,
    );
  }

  async createDevice(insertDevice: InsertDeviceConfig): Promise<DeviceConfig> {
    const id = randomUUID();
    const now = new Date();
    const device: DeviceConfig = { 
      ...insertDevice, 
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: string, updates: Partial<InsertDeviceConfig>): Promise<DeviceConfig> {
    const device = this.devices.get(id);
    if (!device) {
      throw new Error("Device not found");
    }
    const updated = { ...device, ...updates, updatedAt: new Date() };
    this.devices.set(id, updated);
    return updated;
  }

  async deleteDevice(id: string): Promise<void> {
    this.devices.delete(id);
  }

  async getRepositories(): Promise<Repository[]> {
    return Array.from(this.repositories.values());
  }

  async getRepository(id: string): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }

  async getRepositoriesByDevice(deviceId: string): Promise<Repository[]> {
    return Array.from(this.repositories.values()).filter(
      (repo) => repo.deviceId === deviceId,
    );
  }

  async createRepository(insertRepo: InsertRepository): Promise<Repository> {
    const id = randomUUID();
    const repository: Repository = { 
      ...insertRepo, 
      id,
      createdAt: new Date(),
    };
    this.repositories.set(id, repository);
    return repository;
  }

  async updateRepository(id: string, updates: Partial<InsertRepository>): Promise<Repository> {
    const repository = this.repositories.get(id);
    if (!repository) {
      throw new Error("Repository not found");
    }
    const updated = { ...repository, ...updates };
    this.repositories.set(id, updated);
    return updated;
  }

  async deleteRepository(id: string): Promise<void> {
    this.repositories.delete(id);
  }

  async getBuildScripts(): Promise<BuildScript[]> {
    return Array.from(this.buildScripts.values());
  }

  async getBuildScript(id: string): Promise<BuildScript | undefined> {
    return this.buildScripts.get(id);
  }

  async getBuildScriptsByDevice(deviceId: string): Promise<BuildScript[]> {
    return Array.from(this.buildScripts.values()).filter(
      (script) => script.deviceId === deviceId,
    );
  }

  async createBuildScript(insertScript: InsertBuildScript): Promise<BuildScript> {
    const id = randomUUID();
    const now = new Date();
    const script: BuildScript = { 
      ...insertScript, 
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.buildScripts.set(id, script);
    return script;
  }

  async updateBuildScript(id: string, updates: Partial<InsertBuildScript>): Promise<BuildScript> {
    const script = this.buildScripts.get(id);
    if (!script) {
      throw new Error("Build script not found");
    }
    const updated = { ...script, ...updates, updatedAt: new Date() };
    this.buildScripts.set(id, updated);
    return updated;
  }

  async deleteBuildScript(id: string): Promise<void> {
    this.buildScripts.delete(id);
  }
}

export const storage = new MemStorage();
