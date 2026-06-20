# Legacy Project Upgrade Report - 2026-06-20

## 1. 範圍 (Scope)
本報告針對 `klin-gantt-chart` 舊專案進行設定補強與治理檢查，盤點專案資產，分析設定缺口，並按照 `#09 舊專案補強懶人包` 規格將其對接至 Obsidian 駕駛艙與 `AGENTS.md` 工作模式。

## 2. 既有資產盤點 (Existing Assets)
- **程式碼與架構**：React (v19) + Vite + Tailwind CSS，使用 ESM CDN 載入 Firebase Web SDK 進行雲端同步。
- **文件資產**：
  - `AGENTS.md`（原有專案約束、已完成開發階段、工作流規範）
  - `README.md`（專案簡介與說明）
  - `task.md`（開發工作追蹤）
  - `ConversationRecord.md` / `ConversationRecord.txt`（Agent 對話紀錄）
- **同步與部署**：GitHub Pages 部署，Playwright E2E 自動化測試。

## 3. 發現之缺口 (Gaps Found)
- **#07 工作模式缺口**：`AGENTS.md` 中缺乏專案名稱、主要工作目錄、預設分支及對應的 Obsidian Vault 路徑定義，亦缺乏明確的 `startup-sync` 與 `shutdown-sync` 同步入口定義。
- **API 規格缺口**：本專案缺乏明確的資料儲存或 API 互動定義，雖然在 Phase 4 引入了 Firebase 同步，但並未明記資料結構。
- **Obsidian 駕駛艙缺口**：第二大腦（Obsidian Vault）中缺乏對應的 `klin-gantt-chart` 專案駕駛艙。

## 4. 已執行的變更與建議 (Changes Made or Recommended)
- **已修改** `AGENTS.md`：
  - 補上 `#07 專案工作模式` 區塊，指明專案路徑、分支與 Obsidian Vault 絕對路徑。
  - 補上 `API 規格維護規則`，定義本專案使用 Firestore `users/{userId}` 儲存 `ganttData` 的規格。
- **已建立** Obsidian 專案駕駛艙 `專案工作流程.md`：
  - 路徑：`j:\我的雲端硬碟\secondbrain\secondbrain\klin-gantt-chart\專案工作流程.md`
  - 記錄了專案進度、下一步以及 Firebase 的安全防護決策。
- **建議安全性更新**：
  - 檢查 `firebase.js` 中是否留有敏感資訊。

## 5. 治理衝突檢查 (Governance Conflicts)
- **文件衝突**：無。專案內目前並無其他過時的文件或相互矛盾的開發規範。
- **功能引用衝突**：無。無已廢棄功能的代碼殘留。
- **進度重複記錄**：已在 `AGENTS.md` 工作模式中限制「不要把每日進度寫進 AGENTS.md」，未來開發的每日細微進度與待辦應移至 Obsidian 駕駛艙中維護，避免雙寫衝突。

## 6. 待確認決策 (Remaining Decisions)
- **Firebase 配置安全性**：`src/services/firebase.js` 目前使用 Placeholder 配置（如 `apiKey: "YOUR_API_KEY"`）。在進行生產環境部署或發布到 GitHub Pages 前，需確定如何注入真實 Firebase 配置，防止配置洩露或發布失敗。

## 7. 驗證 (Validation)
- 經 `git status` 與 `git diff` 驗證，僅修改了 `AGENTS.md` 與建立了 `docs/legacy_project_upgrade_report_20260620.md`。
- 本地 `AGENTS.md` 的原有業務規則與技術棧宣告完整保留。
- 已執行靜態掃描，無敏感 secrets 洩露。
