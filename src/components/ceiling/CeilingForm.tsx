// src/components/ceiling/CeilingForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MaterialDropdown } from "@/components/shared/MaterialDropdown";
import { CeilingResultPanel } from "./CeilingResultPanel";
import { calculateCeilingMaterial } from "@/lib/calculations/ceiling";
import { saveCeilingEstimate, updateCeilingEstimate } from "@/lib/actions/estimates";
import type { CeilingInput, CeilingResult } from "@/types";

interface Props {
  projectId: string;
  itemId?: string;
  initialInput?: CeilingInput;
}

const DEFAULT_INPUT: CeilingInput = {
  areaPing: 5,
  autoArea: true,
  autoPerimeter: true,
  roomLengthM: 4,
  roomWidthM: 3,
  manualPerimeterM: undefined,
  angleMaterialRef: null,
  boardMaterialRef: null,
  perimeterAngleMaterialRef: null,
};

function calcAreaPing(lengthM?: number, widthM?: number): number {
  if (!lengthM || !widthM) return 0;
  return Math.round((lengthM * widthM / 3.30579) * 100) / 100;
}

export function CeilingForm({ projectId, itemId, initialInput }: Props) {
  const [input, setInput] = useState<CeilingInput>(initialInput ?? DEFAULT_INPUT);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const update = (patch: Partial<CeilingInput>) => setInput((prev) => ({ ...prev, ...patch }));

  const handleDimensionChange = (field: "roomLengthM" | "roomWidthM", value: number) => {
    const next = { ...input, [field]: value };
    if (input.autoArea) {
      const derived = calcAreaPing(
        field === "roomLengthM" ? value : input.roomLengthM,
        field === "roomWidthM" ? value : input.roomWidthM,
      );
      update({ [field]: value, areaPing: derived });
    } else {
      update({ [field]: value });
    }
  };

  let result: CeilingResult | null = null;
  try {
    result = calculateCeilingMaterial(input);
  } catch {
    result = null;
  }

  const handleSave = async () => {
    setSaving(true);
    const res = itemId
      ? await updateCeilingEstimate(itemId, { projectId, input })
      : await saveCeilingEstimate({ projectId, input });
    setSaving(false);
    setSaveMsg(res.success ? "已儲存！" : "儲存失敗");
    if (res.success) setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* 左：輸入 */}
      <div className="space-y-5">
        <section className="space-y-3">
          <h3 className="font-semibold text-sm border-b pb-1">天花板資訊</h3>

          {/* 房間長寬（永遠顯示） */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">房間長(m)</Label>
              <Input
                type="number" min={0.1} step={0.1} className="mt-1"
                value={input.roomLengthM ?? ""}
                onChange={(e) => handleDimensionChange("roomLengthM", Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">房間寬(m)</Label>
              <Input
                type="number" min={0.1} step={0.1} className="mt-1"
                value={input.roomWidthM ?? ""}
                onChange={(e) => handleDimensionChange("roomWidthM", Number(e.target.value))}
              />
            </div>
          </div>

          {/* 坪數：自動帶入或手動 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted-foreground">坪數</Label>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">由長寬自動計算</Label>
                <Switch
                  checked={input.autoArea}
                  onCheckedChange={(v) => {
                    const derived = v ? calcAreaPing(input.roomLengthM, input.roomWidthM) : input.areaPing;
                    update({ autoArea: v, areaPing: derived || input.areaPing });
                  }}
                />
              </div>
            </div>
            <Input
              type="number" min={0.1} step={0.5}
              value={input.areaPing}
              readOnly={input.autoArea}
              className={input.autoArea ? "bg-muted/30 text-muted-foreground" : ""}
              onChange={(e) => !input.autoArea && update({ areaPing: Number(e.target.value) })}
            />
            {input.autoArea && input.roomLengthM && input.roomWidthM && (
              <p className="text-xs text-muted-foreground mt-1">
                {input.roomLengthM} × {input.roomWidthM} m² ÷ 3.30579 = {input.areaPing} 坪
              </p>
            )}
          </div>

          {/* 周長 */}
          <div className="flex items-center gap-3">
            <Switch
              checked={input.autoPerimeter}
              onCheckedChange={(v) => update({ autoPerimeter: v })}
            />
            <Label className="text-xs">自動計算周長（由長寬）</Label>
          </div>

          {!input.autoPerimeter && (
            <div>
              <Label className="text-xs text-muted-foreground">手動周長(m)</Label>
              <Input
                type="number" min={0.1} step={0.1} className="mt-1"
                value={input.manualPerimeterM ?? ""}
                onChange={(e) => update({ manualPerimeterM: Number(e.target.value) })}
              />
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold text-sm border-b pb-1">材料選擇</h3>
          <div>
            <Label className="text-xs text-muted-foreground">天花角材</Label>
            <div className="mt-1">
              <MaterialDropdown
                value={input.angleMaterialRef}
                onChange={(ref) => update({ angleMaterialRef: ref })}
                categoryFilter="ANGLE_MATERIAL"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">矽酸鈣板</Label>
            <div className="mt-1">
              <MaterialDropdown
                value={input.boardMaterialRef}
                onChange={(ref) => update({ boardMaterialRef: ref })}
                categoryFilter="CEILING_BOARD"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">周邊角材（L型）</Label>
            <div className="mt-1">
              <MaterialDropdown
                value={input.perimeterAngleMaterialRef}
                onChange={(ref) => update({ perimeterAngleMaterialRef: ref })}
                categoryFilter="ANGLE_MATERIAL"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving || !result}>
            {saving ? "儲存中…" : "儲存估價"}
          </Button>
          {saveMsg && (
            <span className={`text-sm ${saveMsg.includes("失敗") ? "text-destructive" : "text-green-600"}`}>
              {saveMsg}
            </span>
          )}
        </div>
      </div>

      {/* 右：即時結果 */}
      <div className="xl:border-l xl:pl-6">
        <h3 className="font-semibold text-sm border-b pb-1 mb-4">即時計算結果</h3>
        {result ? (
          <CeilingResultPanel result={result} />
        ) : (
          <p className="text-sm text-muted-foreground">請填寫完整資料</p>
        )}
      </div>
    </div>
  );
}
