import { z } from "zod";

// Device Configuration Schema
export const insertDeviceConfigSchema = z.object({
  name: z.string(),
  codename: z.string(),
  manufacturer: z.string(),
  platform: z.string(),
  androidVersion: z.string(),
  lineageVersion: z.string(),
  description: z.string().optional(),
});

export const deviceConfigSchema = insertDeviceConfigSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InsertDeviceConfig = z.infer<typeof insertDeviceConfigSchema>;
export type DeviceConfig = z.infer<typeof deviceConfigSchema>;

// Repository Schema
export const insertRepositorySchema = z.object({
  deviceId: z.string(),
  name: z.string(),
  url: z.string(),
  branch: z.string(),
  path: z.string(),
  depth: z.string().default("1"),
  category: z.string(),
  status: z.string().default("pending"),
});

export const repositorySchema = insertRepositorySchema.extend({
  id: z.string(),
  createdAt: z.date(),
});

export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type Repository = z.infer<typeof repositorySchema>;

// Build Script Schema
export const insertBuildScriptSchema = z.object({
  deviceId: z.string(),
  name: z.string(),
  content: z.string(),
  manifest: z.string().optional(),
  kernelConfig: z.any().optional(),
  recoveryPatches: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const buildScriptSchema = insertBuildScriptSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InsertBuildScript = z.infer<typeof insertBuildScriptSchema>;
export type BuildScript = z.infer<typeof buildScriptSchema>;
