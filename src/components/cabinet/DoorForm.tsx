// src/components/cabinet/DoorForm.tsx
"use client";

import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialDropdown } from "@/components/shared/MaterialDropdown";
import { generateId } from "@/lib/utils";
import type { DoorInput, DoorType } from "@/types";

interface Props {
  doors: DoorInput[];
  onChange: (doors: DoorInput[]) => void;
}

function emptyDoor(): DoorInput {
  return {
    id: generateId(),
    type: "HINGED",
    name: "",
    widthCm: 45,
    heightCm: 90,
    quantity: 1,
    materialRef: null,
    hingeMaterialRef: null,
    railMaterialRef: null,
  };
}

export function DoorForm({ doors, onChange }: Props) {
  const update = (index: number, patch: Partial<DoorInput>) => {
    const next = doors.map((d, i) => (i === index ? { ...d, ...patch } : d));
    onChange(next);
  };

  const remove = (index: number) => onChange(doors.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">門片</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...doors, emptyDoor()])}>
          <Plus className="h-3 w-3 mr-1" />新增門片
        </Button>
      </div>

      {doors.length === 0 && (
        <p className="text-xs text-muted-foreground">尚未新增門片</p>
      )}

      {doors.map((door, i) => (
        <div key={door.id} className="border rounded-md p-3 space-y-2 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Select
                value={door.type}
                onValueChange={(v) => update(i, { type: v as DoorType })}
              >
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HINGED">鉸鏈門</SelectItem>
                  <SelectItem value="SLIDING">滑門</SelectItem>
                </SelectContent>
              </Select>
              <Input
                className="h-8 text-xs"
                placeholder="門片名稱（選填）"
                value={door.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} className="h-8 w-8 text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">寬(cm)</Label>
              <Input
                type="number" min={1} className="h-8 text-xs"
                value={door.widthCm}
                onChange={(e) => update(i, { widthCm: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">高(cm)</Label>
              <Input
                type="number" min={1} className="h-8 text-xs"
                value={door.heightCm}
                onChange={(e) => update(i, { heightCm: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">數量</Label>
              <Input
                type="number" min={1} className="h-8 text-xs"
                value={door.quantity}
                onChange={(e) => update(i, { quantity: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* 門片材料 */}
          <div className="grid grid-cols-1 gap-1.5">
            <div>
              <Label className="text-[10px] text-muted-foreground">門片材料</Label>
              <MaterialDropdown
                value={door.materialRef}
                onChange={(ref) => update(i, { materialRef: ref })}
                categoryFilter="BOARD"
              />
            </div>

            {door.type === "HINGED" && (
              <div>
                <Label className="text-[10px] text-muted-foreground">
                  鉸鏈（自動計算數量）
                </Label>
                <MaterialDropdown
                  value={door.hingeMaterialRef ?? null}
                  onChange={(ref) => update(i, { hingeMaterialRef: ref })}
                  categoryFilter="HARDWARE"
                />
              </div>
            )}

            {door.type === "SLIDING" && (
              <div>
                <Label className="text-[10px] text-muted-foreground">
                  滑軌（自動加上下各一）
                </Label>
                <MaterialDropdown
                  value={door.railMaterialRef ?? null}
                  onChange={(ref) => update(i, { railMaterialRef: ref })}
                  categoryFilter="RAIL"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
