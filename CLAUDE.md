# DecoCost — CLAUDE.md

室內裝潢材料成本估價 SaaS。本文件是 Claude Code 的專案說明，每次開啟此專案時自動載入。

---

## 快速啟動

```bash
npm run dev          # http://localhost:3000
npm run build        # 生產構建（含型別檢查）
npm run typecheck    # 僅型別檢查
npm run db:push      # 同步 Prisma schema 到 DB
npm run db:seed      # 植入初始材料資料（28 筆）
npm run db:studio    # Prisma Studio GUI
```

Demo 帳號：`demo@decoest.com` / `password123`

---

## 技術棧

| 層 | 技術 |
|---|---|
| 框架 | Next.js 15 App Router |
| 語言 | TypeScript（strict mode，禁用 any） |
| 樣式 | Tailwind CSS + shadcn/ui（手工實作於 `src/components/ui/`） |
| 表單 | React Hook Form + Zod |
| ORM | Prisma 5 |
| DB | PostgreSQL（Neon serverless） |
| 認證 | NextAuth v5（Credentials provider + JWT session） |
| 狀態 | React `useActionState`（Server Actions 回傳錯誤） |

---

## 專案架構

```
src/
├── app/
│   ├── (auth)/              # 登入 / 註冊（不走 dashboard layout）
│   ├── (dashboard)/         # 主應用（受 middleware 保護）
│   │   ├── dashboard/       # 總覽
│   │   ├── projects/        # 專案 CRUD + 估價子頁
│   │   │   └── [id]/
│   │   │       ├── cabinet/ # 系統櫃估價
│   │   │       └── ceiling/ # 天花板估價
│   │   └── materials/       # 材料管理
│   └── api/                 # REST API（供 client component fetch 用）
│       ├── auth/[...nextauth]/
│       ├── projects/
│       ├── estimate-items/
│       └── materials/
├── components/
│   ├── ui/                  # shadcn/ui 基礎元件
│   ├── cabinet/             # 系統櫃相關元件
│   ├── ceiling/             # 天花板相關元件
│   ├── materials/           # 材料管理元件
│   └── shared/              # 跨模組共用元件
├── lib/
│   ├── calculations/        # ⭐ 計算引擎（純函式）
│   ├── actions/             # Server Actions
│   ├── config/units.ts      # ⭐ 所有計算規則集中在此
│   ├── validations/         # Zod schemas
│   ├── auth.ts              # NextAuth 完整設定（含 bcryptjs）
│   ├── auth.config.ts       # Edge-compatible 設定（給 middleware 用）
│   └── db.ts                # Prisma singleton
└── types/                   # TypeScript 型別定義
```

---

## 核心規則（勿違反）

### 計算引擎
- `src/lib/calculations/` 內的函式必須是**純函式**，零副作用、零 UI 依賴
- 所有計算常數（才數換算、鉸鏈間距、天花板用量比例）集中在 `src/lib/config/units.ts`，不可在其他地方寫死數值
- `calculateCabinetUnit(input)` → `CabinetUnitResult`
- `calculateCabinetProject(units[])` → `CabinetProjectResult`
- `calculateCeilingMaterial(input)` → `CeilingResult`

### 認證分層
- `src/lib/auth.config.ts` — 僅含 Edge Runtime 相容設定，**不可引入 bcryptjs**
- `src/lib/auth.ts` — 完整設定，含 Credentials provider
- `src/middleware.ts` — 只引入 `auth.config`，不引入 `auth`

### Server Actions 型別
- 直接用於 `<form action={...}>` 的 action 必須回傳 `void | Promise<void>`
- 需要回傳錯誤的 action，用 `useActionState` 搭配 wrapper function（參考 `RegisterForm.tsx`）

### TypeScript
- 禁用 `any`（`tsconfig.json` strict mode）
- 所有型別定義在 `src/types/`
- Prisma 生成型別在 `@prisma/client`

---

## 資料庫 Schema

```
User → EstimateProject (1:N) → EstimateItem (1:N)
Material（獨立，被 UI 參照，不建 FK）
```

`EstimateItem.inputData` — 原始輸入 JSON（`CabinetUnitInput[]` 或 `CeilingInput`）
`EstimateItem.resultData` — 計算結果快照 JSON（可重新計算，此為快取）

---

## 擴充模組（預留）

新增模組（如地板、油漆）步驟：
1. `prisma/schema.prisma` → `ModuleType` enum 加新值
2. `src/types/` → 新增 input / result 型別
3. `src/lib/calculations/` → 新增純函式計算引擎
4. `src/lib/config/units.ts` → 新增計算常數
5. `src/components/` → 新增對應 UI 元件
6. `src/app/(dashboard)/projects/[id]/[module]/` → 新增頁面
7. `src/lib/actions/estimates.ts` → 新增 save/update action

---

## 環境變數

| 變數 | 說明 |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL 連線字串 |
| `AUTH_SECRET` | NextAuth JWT 簽名金鑰（`openssl rand -base64 32`） |
| `AUTH_URL` | 應用程式 URL（dev: `http://localhost:3000`） |

---

## 才數換算說明

```
1 才 = 30.3cm × 30.3cm = 918.09 cm²（台尺制）
可在 src/lib/config/units.ts 的 CAI_CM2 調整
```
