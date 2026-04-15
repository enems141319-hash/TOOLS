// src/app/(dashboard)/materials/page.tsx

import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MaterialsClient } from "./MaterialsClient";

export const metadata: Metadata = { title: "材料管理" };

const CATEGORY_LABELS: Record<string, string> = {
  BOARD:          "板材",
  BACKING:        "背板",
  HARDWARE:       "五金",
  RAIL:           "滑軌",
  TRIM:           "踢腳板/封邊",
  CEILING_BOARD:  "天花板板材",
  ANGLE_MATERIAL: "角材",
  OTHER:          "其他",
};

export default async function MaterialsPage() {
  await auth();

  const materials = await prisma.material.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  const grouped = materials.reduce(
    (acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    },
    {} as Record<string, typeof materials>
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">材料管理</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {materials.length} 種材料 · {materials.filter((m) => m.isActive).length} 啟用中
          </p>
        </div>
        <MaterialsClient action="add" />
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <Card key={category}>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              {CATEGORY_LABELS[category] ?? category}
              <Badge variant="outline" className="text-xs font-normal">{items.length}</Badge>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left px-5 py-2 font-medium text-xs text-muted-foreground">名稱</th>
                  <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground">規格</th>
                  <th className="text-right px-3 py-2 font-medium text-xs text-muted-foreground">單位</th>
                  <th className="text-right px-3 py-2 font-medium text-xs text-muted-foreground">單價</th>
                  <th className="text-right px-3 py-2 font-medium text-xs text-muted-foreground">損耗率</th>
                  <th className="text-center px-3 py-2 font-medium text-xs text-muted-foreground">狀態</th>
                  <th className="px-5 py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((m, idx) => (
                  <tr
                    key={m.id}
                    className={`border-t hover:bg-muted/20 transition-colors ${!m.isActive ? "opacity-50" : ""}`}
                  >
                    <td className="px-5 py-2.5 font-medium">{m.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{m.spec ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right">{m.unit}</td>
                    <td className="px-3 py-2.5 text-right font-semibold">
                      {formatCurrency(Number(m.price))}
                    </td>
                    <td className="px-3 py-2.5 text-right text-muted-foreground">
                      {(Number(m.wasteRate) * 100).toFixed(0)}%
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge variant={m.isActive ? "default" : "outline"} className="text-xs">
                        {m.isActive ? "啟用" : "停用"}
                      </Badge>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <MaterialsClient
                        action="edit"
                        material={{
                          id: m.id,
                          category: m.category,
                          name: m.name,
                          spec: m.spec ?? undefined,
                          unit: m.unit,
                          price: Number(m.price),
                          wasteRate: Number(m.wasteRate),
                          isActive: m.isActive,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
