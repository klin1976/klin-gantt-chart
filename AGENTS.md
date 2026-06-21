# Klin Gantt Chart - Antigravity 專案設定

## 專案工作模式（#07 固定入口）

**專案名稱：** klin-gantt-chart  
**專案用途：** React 甘特圖 web app，支援 Firebase 同步與 Drag-and-Drop  
**主要工作目錄：** 專案根目錄（相對於實際掛載路徑）  
**預設 branch：** main（依目前 Git worktree 為準，不自動切換 branch）

### Obsidian 對應筆記

**Obsidian vault：** `..\..\secondbrain\secondbrain` (相對於本專案根目錄)  
**專案駕駛艙：** `klin-gantt-chart/專案工作流程.md`  
**收工時優先更新：** 同上。

### 同步規則

**開工時：** 使用 `startup-sync`（此專案目前以手動讀取為主），讀本檔與 Obsidian 駕駛艙，檢查 Git，不自動 pull / commit / push。  
**收工時：** 使用 `shutdown-sync`（此專案目前以手動更新為主），更新 Obsidian 駕駛艙，必要時更新固定規則。  
**新專案初始化時：** 舊專案不重跑初始化，只補缺。

### 不要做

- 不要把每日進度寫進 AGENTS.md。
- 不要建立第二份 canonical API spec。
- 不要自動納入無關 Git 變更。
- 不要寫入 secrets 或正式資料。

---

## API 規格維護規則

本專案無傳統 REST API 接口，僅使用 Firebase Firestore 雲端同步。
Firestore 儲存結構規格定義如下：
- **Collection**: `users`
- **Document ID**: `{userId}`
- **Field**: `ganttData` (包含任務列表、依賴關係及配置的 JSON 結構)

若 Firestore 資料表結構、Collection 或欄位改變，必須同步更新 `AGENTS.md` 中的規格定義。

---

## 專案核心架構與約束

1. **核心技術棧**：React (v19) + Vite + Tailwind CSS。
2. **特別限制（重要 ⚠️）**：
   - 因專案位於 Google 雲端硬碟，頻繁的本機 `npm install` 會導致同步鎖死錯誤（例如 `EBADF`）。
   - **開發限制**：請勿隨意執行 `npm install` 引入重度第三方依賴。
   - **策略**：
     - 若需要新套件，優先使用 **ESM CDN 載入方式**（例如 Firebase Web SDK 經由 CDN 載入）。
     - 狀態管理採用 **原生自製極簡 Store** 替代 Zustand 以避開安裝限制。
3. **部署環境**：GitHub Pages (`https://klin1976.github.io/klin-gantt-chart`)。
4. **測試機制**：Playwright E2E 測試，配有 GitHub Actions 於 `.github/workflows/e2e.yml` 自動執行。

## 已完成的開發階段

- **Phase 1-3**：
  - 本地 `localStorage` 自動儲存與復原。
  - Undo/Redo 歷史紀錄（Ctrl+Z / Ctrl+Y）。
  - 大元件 `App.jsx` 的拆分與模組化重構（拆為 components, hooks, utils, constants）。
  - 任務依賴與里程碑（SVG 折線依賴箭頭）、關鍵路徑（CPM）計算與高亮。
- **Phase 4**：
  - CSS 原生平滑微動畫（Modals 平滑彈出）。
  - TaskList 原生拖拽優化（新增拖曳提示線與位置預覽）。
  - 整合 Firebase Web SDK（經由 ESM CDN），實作 Google OAuth 一鍵登入與 Firestore 雲端資料同步。
  - 補齊 PropTypes 驗證、JSDoc 與 `CONTRIBUTING.md`。

## 工作流規範

- **開工流程**：讀取 `AGENTS.md`、專案筆記、`git status`、回報狀態。不自動 pull/commit/push。
- **收工流程**：檢查敏感資料、更新專案對話紀錄與筆記、檢查 git diff、確認後手動 commit + push。
