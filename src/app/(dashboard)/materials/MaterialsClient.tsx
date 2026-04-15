// src/app/(dashboard)/materials/MaterialsClient.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { MaterialForm } from "@/components/materials/MaterialForm";
import { deleteMaterial, toggleMaterialActive } from "@/lib/actions/materials";
import { useRouter } from "next/navigation";

interface MaterialData {
  id: string;
  category: string;
  name: string;
  spec?: string;
  unit: string;
  price: number;
  wasteRate: number;
  isActive: boolean;
}

type Props =
  | { action: "add" }
  | { action: "edit"; material: MaterialData };

export function MaterialsClient(props: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  if (props.action === "add") {
    return (
      <>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />新增材料
        </Button>

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background rounded-lg border shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">新增材料</h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
                  ✕
                </Button>
              </div>
              <MaterialForm onSuccess={handleSuccess} />
            </div>
          </div>
        )}
      </>
    );
  }

  // edit mode
  const { material } = props;

  const handleToggle = async () => {
    await toggleMaterialActive(material.id, !material.isActive);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm(`確定要刪除「${material.name}」？`)) return;
    await deleteMaterial(material.id);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost" size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={handleDelete}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-lg border shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">編輯材料</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={material.isActive ? "outline" : "default"}
                  size="sm"
                  onClick={handleToggle}
                >
                  {material.isActive ? "停用" : "啟用"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
                  ✕
                </Button>
              </div>
            </div>
            <MaterialForm
              materialId={material.id}
              defaultValues={material}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
