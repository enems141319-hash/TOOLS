// src/components/cabinet/CabinetUnitForm.tsx
"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MaterialDropdown } from "@/components/shared/MaterialDropdown";
import { DoorForm } from "./DoorForm";
import { InternalPartsForm } from "./InternalPartsForm";
import { KickPlateForm } from "./KickPlateForm";
import { CabinetResultPanel } from "./CabinetResultPanel";
import { calculateCabinetUnit } from "@/lib/calculations/cabinet";
import type { CabinetUnitInput, CabinetUnitResult } from "@/types";

interface Props {
  unit: CabinetUnitInput;
  onChange: (unit: CabinetUnitInput) => void;
  onResult?: (result: CabinetUnitResult) => void;
}

export function CabinetUnitForm({ unit, onChange, onResult }: Props) {
  const update = (patch: Partial<CabinetUnitInput>) => onChange({ ...unit, ...patch });

  const result = calculateCabinetUnit(unit);

  useEffect(() => {
    onResult?.(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* 左：輸入區 */}
      <div className="space-y-5">
        {/* 基本尺寸 */}
        <section className="space-y-3">
          <h3 className="font-semibold text-sm border-b pb-1">基本尺寸</h3>
          <div>
            <Label className="text-xs text-muted-foreground">桶身名稱</Label>
            <Input
              className="mt-1"
              value={unit.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="例：主臥衣櫃左側"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["widthCm", "depthCm", "heightCm"] as const).map((field) => (
              <div key={field}>
                <Label className="text-xs text-muted-foreground">
                  {field === "widthCm" ? "寬(cm)" : field === "depthCm" ? "深(cm)" : "高(cm)"}
                </Label>
                <Input
                  type="number" min={1} className="mt-1"
                  value={unit[field]}
                  onChange={(e) => update({ [field]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">數量（相同規格幾組）</Label>
            <Input
              type="number" min={1} max={20} className="mt-1 w-24"
              value={unit.quantity}
              onChange={(e) => update({ quantity: Number(e.target.value) })}
            />
          </div>
        </section>

        {/* 板材選料 */}
        <section className="space-y-3">
          <h3 className="font-semibold text-sm border-b pb-1">板材選料</h3>
          <div>
            <Label className="text-xs text-muted-foreground">主板材（側板/頂板/底板）</Label>
            <div className="mt-1">
              <MaterialDropdown
                value={unit.panelMaterialRef}
                onChange={(ref) => update({ panelMaterialRef: ref })}
                categoryFilter="BOARD"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={unit.hasBackPanel}
              onCheckedChange={(v) => update({ hasBackPanel: v })}
            />
            <Label className="text-xs">含背板</Label>
          </div>
          {unit.hasBackPanel && (
            <div>
              <Label className="text-xs text-muted-foreground">背板材料</Label>
              <div className="mt-1">
                <MaterialDropdown
                  value={unit.backPanelMaterialRef}
                  onChange={(ref) => update({ backPanelMaterialRef: ref })}
                  categoryFilter="BACKING"
                />
              </div>
            </div>
          )}
        </section>

        <Separator />

        {/* 內部構件 */}
        <InternalPartsForm
          middleDividers={unit.middleDividers}
          shelves={unit.shelves}
          onMiddleDividersChange={(v) => update({ middleDividers: v })}
          onShelvesChange={(v) => update({ shelves: v })}
        />

        <Separator />

        {/* 門片 */}
        <DoorForm
          doors={unit.doors}
          onChange={(v) => update({ doors: v })}
        />

        <Separator />

        {/* 踢腳板 */}
        <KickPlateForm
          value={unit.kickPlate}
          onChange={(v) => update({ kickPlate: v })}
        />
      </div>

      {/* 右：即時結果 */}
      <div className="xl:border-l xl:pl-6">
        <h3 className="font-semibold text-sm border-b pb-1 mb-4">即時計算結果</h3>
        <CabinetResultPanel result={result} />
      </div>
    </div>
  );
}
