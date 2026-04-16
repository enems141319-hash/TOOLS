// src/components/cabinet/CabinetUnitList.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CabinetUnitForm } from "./CabinetUnitForm";
import { formatCurrency, generateId } from "@/lib/utils";
import { calculateCabinetUnit } from "@/lib/calculations/cabinet";
import { saveCabinetEstimate, updateCabinetEstimate } from "@/lib/actions/estimates";
import type { CabinetUnitInput } from "@/types";

interface Props {
  projectId: string;
  itemId?: string;
  initialUnits?: CabinetUnitInput[];
}

function emptyUnit(): CabinetUnitInput {
  return {
    id: generateId(),
    name: "新桶身",
    widthCm: 90,
    depthCm: 60,
    heightCm: 240,
    quantity: 1,
    hasBackPanel: true,
    panelMaterialRef: null,
    backPanelMaterialRef: null,
    middleDividers: [],
    shelves: [],
    doors: [],
    kickPlate: null,
  };
}

export function CabinetUnitList({ projectId, itemId, initialUnits }: Props) {
  const [units, setUnits] = useState<CabinetUnitInput[]>(initialUnits ?? [emptyUnit()]);
  const [expandedId, setExpandedId] = useState<string>(units[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const updateUnit = (id: string, updated: CabinetUnitInput) =>
    setUnits((prev) => prev.map((u) => (u.id === id ? updated : u)));

  const duplicateUnit = (unit: CabinetUnitInput) => {
    const clone: CabinetUnitInput = { ...unit, id: generateId(), name: `${unit.name} (複製)` };
    setUnits((prev) => [...prev, clone]);
    setExpandedId(clone.id);
  };

  const removeUnit = (id: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const projectTotal = units.reduce(
    (acc, u) => acc + calculateCabinetUnit(u).summary.totalCost,
    0
  );

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    const result = itemId
      ? await updateCabinetEstimate(itemId, { projectId, units })
      : await saveCabinetEstimate({ projectId, units });
    setSaving(false);
    setSaveMsg(result.success ? "已儲存！" : "儲存失敗，請稍後再試");
    if (result.success) setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* 桶身列表 */}
      {units.map((unit) => {
        const result = calculateCabinetUnit(unit);
        const isExpanded = expandedId === unit.id;

        return (
          <div key={unit.id} className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center gap-2 px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? "" : unit.id)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              <span className="font-medium flex-1">{unit.name}</span>
              <Badge variant="outline" className="text-xs">
                {unit.widthCm} × {unit.depthCm} × {unit.heightCm} cm
              </Badge>
              <Badge variant="secondary" className="text-xs">×{unit.quantity}</Badge>
              <span className="font-semibold text-primary text-sm">
                {formatCurrency(result.summary.totalCost)}
              </span>
              <Button
                type="button" variant="ghost" size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); duplicateUnit(unit); }}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                type="button" variant="ghost" size="icon"
                className="h-7 w-7 text-destructive"
                onClick={(e) => { e.stopPropagation(); removeUnit(unit.id); }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Body */}
            {isExpanded && (
              <div className="p-4">
                <CabinetUnitForm
                  unit={unit}
                  onChange={(updated) => updateUnit(unit.id, updated)}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* 新增桶身 */}
      <Button
        type="button" variant="outline" className="w-full border-dashed"
        onClick={() => {
          const u = emptyUnit();
          setUnits((prev) => [...prev, u]);
          setExpandedId(u.id);
        }}
      >
        <Plus className="h-4 w-4 mr-2" />新增桶身
      </Button>

      <Separator />

      {/* 總計 + 儲存 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{units.length} 個桶身</p>
          <p className="text-xl font-bold text-primary">
            總計：{formatCurrency(projectTotal)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-sm ${saveMsg.includes("失敗") ? "text-destructive" : "text-green-600"}`}>
              {saveMsg}
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "儲存中…" : "儲存估價"}
          </Button>
        </div>
      </div>
    </div>
  );
}
