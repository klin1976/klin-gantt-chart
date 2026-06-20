# Klin Gantt Chart - Antigravity 專案設定

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
