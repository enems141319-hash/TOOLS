// src/lib/actions/materials.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { MaterialCategory } from "@prisma/client";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

const materialSchema = z.object({
  category: z.nativeEnum(MaterialCategory),
  name: z.string().min(1, "名稱不能為空").max(100),
  spec: z.string().max(200).optional(),
  unit: z.string().min(1, "單位不能為空").max(20),
  price: z.coerce.number().positive("價格必須大於 0"),
  wasteRate: z.coerce.number().min(0).max(1).default(0.05),
});

export async function getMaterials(category?: MaterialCategory) {
  await requireUserId();
  return prisma.material.findMany({
    where: { isActive: true, ...(category ? { category } : {}) },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getMaterialsByCategory() {
  await requireUserId();
  const materials = await prisma.material.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const grouped = materials.reduce(
    (acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    },
    {} as Record<string, typeof materials>
  );

  return grouped;
}

export async function createMaterial(formData: FormData) {
  await requireUserId();

  const parsed = materialSchema.safeParse({
    category: formData.get("category"),
    name: formData.get("name"),
    spec: formData.get("spec") || undefined,
    unit: formData.get("unit"),
    price: formData.get("price"),
    wasteRate: formData.get("wasteRate") ?? 0.05,
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.material.create({ data: parsed.data });
  revalidatePath("/materials");
  return { success: true };
}

export async function updateMaterial(materialId: string, formData: FormData) {
  await requireUserId();

  const parsed = materialSchema.partial().safeParse({
    category: formData.get("category") || undefined,
    name: formData.get("name") || undefined,
    spec: formData.get("spec") || undefined,
    unit: formData.get("unit") || undefined,
    price: formData.get("price") || undefined,
    wasteRate: formData.get("wasteRate") || undefined,
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.material.update({ where: { id: materialId }, data: parsed.data });
  revalidatePath("/materials");
  return { success: true };
}

export async function toggleMaterialActive(materialId: string, isActive: boolean) {
  await requireUserId();
  await prisma.material.update({ where: { id: materialId }, data: { isActive } });
  revalidatePath("/materials");
  return { success: true };
}

export async function deleteMaterial(materialId: string) {
  await requireUserId();
  await prisma.material.delete({ where: { id: materialId } });
  revalidatePath("/materials");
  return { success: true };
}
