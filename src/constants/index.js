// 預設類別資料
export const DEFAULT_CATEGORIES = [
  { id: 'planning', label: '規劃', color: '#3b82f6' },
  { id: 'design', label: '設計', color: '#a855f7' },
  { id: 'development', label: '開發', color: '#10b981' },
  { id: 'testing', label: '測試', color: '#f59e0b' },
  { id: 'deploy', label: '部署', color: '#64748b' },
];

export const VIEW_MODES = {
  day: { label: '日', columnWidth: 60 },
  week: { label: '週', columnWidth: 150 },
  month: { label: '月', columnWidth: 180 },
  year: { label: '年', columnWidth: 225 },
};

export const INITIAL_TASKS = [
  { id: 1, name: '專案啟動與需求分析', start: '2023-11-01', end: '2023-11-05', progress: 100, category: 'planning' },
  { id: 2, name: 'UI/UX 設計原型', start: '2023-11-06', end: '2023-11-12', progress: 80, category: 'design' },
  { id: 3, name: '前端架構搭建', start: '2023-11-13', end: '2023-11-20', progress: 45, category: 'development' },
  { id: 4, name: '後端 API 開發', start: '2023-11-15', end: '2023-11-25', progress: 30, category: 'development' },
  { id: 5, name: '系統整合測試', start: '2023-11-26', end: '2023-11-30', progress: 0, category: 'testing' },
];
