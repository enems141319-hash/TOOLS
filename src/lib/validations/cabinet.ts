// src/lib/validations/cabinet.ts

import { z } from "zod";

export const materialRefSchema = z.object({
  materialId: z.string().min(1),
  materialName: z.string().min(1),
  unit: z.string().min(1),
  pricePerUnit: z.number().nonnegative(),
}).nullable();

export const doorInputSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["HINGED", "SLIDING"]),
  name: z.string(),
  widthCm: z.number().positive("寬度必須大於 0"),
  heightCm: z.number().positive("高度必須大於 0"),
  quantity: z.number().int().positive("數量必須大於 0"),
  materialRef: materialRefSchema,
  hingeMaterialRef: materialRefSchema.optional(),
  railMaterialRef: materialRefSchema.optional(),
});

export const middleDividerSchema = z.object({
  id: z.string().min(1),
  widthCm: z.number().positive("寬度必須大於 0"),
  heightCm: z.number().positive("高度必須大於 0"),
  quantity: z.number().int().positive("數量必須大於 0"),
  materialRef: materialRefSchema,
});

export const shelfSchema = z.object({
  id: z.string().min(1),
  widthCm: z.number().positive("寬度必須大於 0"),
  depthCm: z.number().positive("深度必須大於 0"),
  quantity: z.number().int().positive("數量必須大於 0"),
  materialRef: materialRefSchema,
});

export const kickPlateSchema = z.object({
  widthCm: z.number().positive("寬度必須大於 0"),
  heightCm: z.number().positive("高度必須大於 0"),
  materialRef: materialRefSchema,
}).nullable();

export const cabinetUnitInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "桶身名稱不能為空"),
  widthCm: z.number().positive("寬度必須大於 0").max(500, "寬度不超過 500cm"),
  depthCm: z.number().positive("深度必須大於 0").max(200, "深度不超過 200cm"),
  heightCm: z.number().positive("高度必須大於 0").max(300, "高度不超過 300cm"),
  quantity: z.number().int().positive("數量必須大於 0").max(20),
  hasBackPanel: z.boolean(),
  panelMaterialRef: materialRefSchema,
  backPanelMaterialRef: materialRefSchema,
  middleDividers: z.array(middleDividerSchema),
  shelves: z.array(shelfSchema),
  doors: z.array(doorInputSchema),
  kickPlate: kickPlateSchema,
});

export const cabinetProjectInputSchema = z.object({
  projectId: z.string().min(1),
  label: z.string().optional(),
  units: z.array(cabinetUnitInputSchema).min(1, "至少需要一個桶身"),
});

export type CabinetProjectInputDTO = z.infer<typeof cabinetProjectInputSchema>;
