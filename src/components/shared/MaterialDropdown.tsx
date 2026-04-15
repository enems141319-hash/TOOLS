// src/components/shared/MaterialDropdown.tsx
"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MaterialRef } from "@/types";

interface MaterialOption {
  id: string;
  name: string;
  spec: string | null;
  unit: string;
  price: number;
  category: string;
}

interface Props {
  value: MaterialRef | null;
  onChange: (ref: MaterialRef | null) => void;
  categoryFilter?: string;
  placeholder?: string;
  disabled?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  BOARD: "板材",
  BACKING: "背板",
  HARDWARE: "五金",
  RAIL: "滑軌",
  TRIM: "踢腳板/封邊",
  CEILING_BOARD: "天花板板材",
  ANGLE_MATERIAL: "角材",
  OTHER: "其他",
};

export function MaterialDropdown({ value, onChange, categoryFilter, placeholder = "選擇材料", disabled }: Props) {
  const [materials, setMaterials] = useState<MaterialOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = categoryFilter
      ? `/api/materials?category=${categoryFilter}`
      : "/api/materials";

    fetch(url)
      .then((r) => r.json())
      .then((data: MaterialOption[]) => {
        setMaterials(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryFilter]);

  const grouped = materials.reduce(
    (acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    },
    {} as Record<string, MaterialOption[]>
  );

  const handleChange = (materialId: string) => {
    if (materialId === "__none__") {
      onChange(null);
      return;
    }
    const found = materials.find((m) => m.id === materialId);
    if (!found) return;
    onChange({
      materialId: found.id,
      materialName: `${found.name}${found.spec ? ` (${found.spec})` : ""}`,
      unit: found.unit,
      pricePerUnit: found.price,
    });
  };

  return (
    <Select
      value={value?.materialId ?? "__none__"}
      onValueChange={handleChange}
      disabled={disabled || loading}
    >
      <SelectTrigger className="w-full text-xs h-8">
        <SelectValue placeholder={loading ? "載入中…" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">
          <span className="text-muted-foreground">（不選擇）</span>
        </SelectItem>
        {Object.entries(grouped).map(([category, items]) => (
          <SelectGroup key={category}>
            <SelectLabel>{CATEGORY_LABELS[category] ?? category}</SelectLabel>
            {items.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                <span className="font-medium">{m.name}</span>
                {m.spec && <span className="ml-1 text-muted-foreground text-xs">{m.spec}</span>}
                <span className="ml-auto text-xs text-muted-foreground">
                  ${m.price}/{m.unit}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
