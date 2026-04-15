// src/lib/config/units.ts
// ⚠️  所有計算規則從這裡讀取，嚴禁在計算引擎或 UI 內寫死數值

export const UNIT_CONFIG = {
  // ── 才數換算 ──────────────────────────────────────────────────────────────
  // 1 才 = 1 台尺 × 1 台尺 = 30.3cm × 30.3cm = 918.09 cm²
  CAI_CM2: 918.09,

  // ── 門片鉸鏈規則 ──────────────────────────────────────────────────────────
  HINGE_SPACING_CM: 60,
  MIN_HINGES_PER_DOOR: 2,

  // ── 滑門滑軌 ──────────────────────────────────────────────────────────────
  SLIDING_RAIL_UNIT: "尺" as const,
  CM_PER_TAI_CHI: 30.3,

  // ── 天花板 ────────────────────────────────────────────────────────────────
  CEILING_ANGLE_PER_PING: 12,
  CEILING_BOARD_PER_PING: 2,
  CEILING_PERIMETER_ANGLE_LENGTH_CM: 243.84, // 8 英尺
  PING_TO_M2: 3.30579,

  // ── 精度 ──────────────────────────────────────────────────────────────────
  AREA_DECIMAL_PLACES: 4,
  COST_DECIMAL_PLACES: 0,
} as const;

export type UnitConfig = typeof UNIT_CONFIG;
