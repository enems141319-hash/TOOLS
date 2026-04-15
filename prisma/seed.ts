// prisma/seed.ts

import { PrismaClient, MaterialCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MATERIALS: Array<{
  category: MaterialCategory;
  name: string;
  spec: string | null;
  unit: string;
  price: number;
  wasteRate: number;
  sortOrder: number;
}> = [
  // ── 板材 ──
  { category: "BOARD", name: "木心板", spec: "3×6尺 18mm", unit: "才", price: 55, wasteRate: 0.08, sortOrder: 10 },
  { category: "BOARD", name: "木心板", spec: "4×8尺 18mm", unit: "才", price: 52, wasteRate: 0.08, sortOrder: 11 },
  { category: "BOARD", name: "夾板（柳安）", spec: "4×8尺 12mm", unit: "才", price: 40, wasteRate: 0.06, sortOrder: 20 },
  { category: "BOARD", name: "夾板（柳安）", spec: "4×8尺 18mm", unit: "才", price: 55, wasteRate: 0.06, sortOrder: 21 },
  { category: "BOARD", name: "密底板（MDF）", spec: "4×8尺 18mm", unit: "才", price: 38, wasteRate: 0.05, sortOrder: 30 },
  { category: "BOARD", name: "密底板（MDF）", spec: "4×8尺 12mm", unit: "才", price: 28, wasteRate: 0.05, sortOrder: 31 },
  { category: "BOARD", name: "塑合板（系統板）", spec: "4×8尺 18mm 素面", unit: "才", price: 60, wasteRate: 0.05, sortOrder: 40 },
  { category: "BOARD", name: "塑合板（系統板）", spec: "4×8尺 18mm 木紋", unit: "才", price: 75, wasteRate: 0.05, sortOrder: 41 },
  // ── 背板 ──
  { category: "BACKING", name: "夾板（背板用）", spec: "4×8尺 4mm", unit: "才", price: 18, wasteRate: 0.06, sortOrder: 10 },
  { category: "BACKING", name: "夾板（背板用）", spec: "4×8尺 6mm", unit: "才", price: 22, wasteRate: 0.06, sortOrder: 11 },
  { category: "BACKING", name: "矽酸鈣板（背板）", spec: "3×6尺 6mm", unit: "才", price: 25, wasteRate: 0.05, sortOrder: 20 },
  // ── 五金 ──
  { category: "HARDWARE", name: "鉸鏈（普通）", spec: "35mm 全蓋", unit: "個", price: 35, wasteRate: 0, sortOrder: 10 },
  { category: "HARDWARE", name: "鉸鏈（緩衝）", spec: "35mm 全蓋 軟關", unit: "個", price: 85, wasteRate: 0, sortOrder: 11 },
  { category: "HARDWARE", name: "鉸鏈（半蓋）", spec: "35mm 半蓋", unit: "個", price: 35, wasteRate: 0, sortOrder: 12 },
  { category: "HARDWARE", name: "把手（鋁合金）", spec: "128mm 孔距", unit: "個", price: 120, wasteRate: 0, sortOrder: 20 },
  { category: "HARDWARE", name: "層板粒", spec: "5mm", unit: "個", price: 5, wasteRate: 0, sortOrder: 30 },
  // ── 滑軌 ──
  { category: "RAIL", name: "拉門上滑軌", spec: "鋁製 寬45mm", unit: "尺", price: 180, wasteRate: 0, sortOrder: 10 },
  { category: "RAIL", name: "拉門下滑軌", spec: "鋁製 寬45mm", unit: "尺", price: 160, wasteRate: 0, sortOrder: 11 },
  { category: "RAIL", name: "抽屜滑軌（三節）", spec: "45kg 45cm", unit: "對", price: 350, wasteRate: 0, sortOrder: 20 },
  // ── 封邊/踢腳板 ──
  { category: "TRIM", name: "踢腳板（實木）", spec: "7cm×1.2cm", unit: "尺", price: 45, wasteRate: 0.1, sortOrder: 10 },
  { category: "TRIM", name: "踢腳板（PVC）", spec: "7cm", unit: "尺", price: 20, wasteRate: 0.1, sortOrder: 11 },
  { category: "TRIM", name: "封邊條（PVC）", spec: "2mm", unit: "尺", price: 8, wasteRate: 0.05, sortOrder: 20 },
  // ── 天花板角材 ──
  { category: "ANGLE_MATERIAL", name: "木角材", spec: "1×1.2寸 8尺", unit: "支", price: 65, wasteRate: 0.05, sortOrder: 10 },
  { category: "ANGLE_MATERIAL", name: "輕鋼架角材", spec: "38×12mm", unit: "支", price: 85, wasteRate: 0.05, sortOrder: 20 },
  { category: "ANGLE_MATERIAL", name: "周邊角材（L型）", spec: "輕鋼架用", unit: "支", price: 55, wasteRate: 0.05, sortOrder: 30 },
  // ── 天花板板材 ──
  { category: "CEILING_BOARD", name: "矽酸鈣板", spec: "3×6尺 6mm", unit: "片", price: 280, wasteRate: 0.08, sortOrder: 10 },
  { category: "CEILING_BOARD", name: "矽酸鈣板", spec: "3×6尺 9mm", unit: "片", price: 380, wasteRate: 0.08, sortOrder: 11 },
  { category: "CEILING_BOARD", name: "輕鋼架天花板", spec: "60×60cm", unit: "片", price: 120, wasteRate: 0.05, sortOrder: 20 },
];

async function main() {
  console.log("🌱 開始植入種子資料...");

  const hashedPassword = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@decoest.com" },
    update: {},
    create: { name: "示範用戶", email: "demo@decoest.com", password: hashedPassword },
  });
  console.log(`✅ 建立用戶: ${demoUser.email}`);

  await prisma.material.deleteMany();
  const created = await prisma.material.createMany({ data: MATERIALS });
  console.log(`✅ 植入材料: ${created.count} 筆`);

  await prisma.estimateProject.upsert({
    where: { id: "demo-project-001" },
    update: {},
    create: {
      id: "demo-project-001",
      userId: demoUser.id,
      name: "示範專案 - 三房裝潢",
      clientName: "陳先生",
      notes: "系統自動建立的示範專案",
    },
  });
  console.log("✅ 建立示範專案");
  console.log("🎉 種子資料植入完成！");
}

main()
  .catch((e) => { console.error("❌ Seed 失敗:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
