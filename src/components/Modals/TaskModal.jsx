import React from 'react';
import { Save } from 'lucide-react';
import useGanttStore from '../../store/useGanttStore';

/**
 * Modal component for adding or editing a task.
 * Allows setting task name, dates, progress, category, milestone status, and dependencies.
 * 
 * @returns {React.ReactElement|null} The TaskModal component or null if not open.
 */
export default function TaskModal() {
  const {
    modals,
    editingId,
    newTask,
    setNewTask,
    categories,
    tasks,
    setModalOpen,
    handleSaveTask
  } = useGanttStore();

  const isOpen = modals.add;

  if (!isOpen) return null;

  const onClose = () => setModalOpen('add', false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[450px] animate-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">{editingId ? '編輯任務' : '新增任務'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任務名稱</label>
            <input
              type="text"
              value={newTask.name}
              onChange={e => setNewTask({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="milestone"
              checked={newTask.milestone || false}
              onChange={e => {
                const checked = e.target.checked;
                setNewTask({
                  milestone: checked,
                  end: checked ? newTask.start : newTask.end
                });
              }}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="milestone" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
              設為里程碑 (結束日期與開始日期相同，菱形視覺化)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={newTask.milestone ? "col-span-2" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newTask.milestone ? '里程碑日期' : '開始日期'}
              </label>
              <input
                type="date"
                value={newTask.start}
                onChange={e => {
                  const val = e.target.value;
                  setNewTask({
                    start: val,
                    end: newTask.milestone ? val : newTask.end
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>
            {!newTask.milestone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
                <input
                  type="date"
                  value={newTask.end}
                  onChange={e => setNewTask({ end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">類別</label>
              <select
                value={newTask.category}
                onChange={e => setNewTask({ category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">進度 (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                disabled={newTask.milestone}
                value={newTask.milestone ? 100 : newTask.progress}
                onChange={e => setNewTask({ progress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">前置任務 (依賴關係)</label>
            <div className="max-h-28 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1.5 bg-gray-50">
              {tasks
                .filter(t => t.id !== editingId)
                .map(t => {
                  const isChecked = newTask.dependencies?.includes(t.id);
                  return (
                    <label key={t.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-200/60 p-1 rounded transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={isChecked || false}
                        onChange={e => {
                          const currentDeps = newTask.dependencies || [];
                          if (e.target.checked) {
                            setNewTask({ dependencies: [...currentDeps, t.id] });
                          } else {
                            setNewTask({ dependencies: currentDeps.filter(id => id !== t.id) });
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{t.name}</span>
                    </label>
                  );
                })}
              {tasks.filter(t => t.id !== editingId).length === 0 && (
                <div className="text-xs text-gray-400 py-1 text-center">無其他任務可選擇</div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
          <button onClick={handleSaveTask} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2">
            <Save className="w-4 h-4" />儲存
          </button>
        </div>
      </div>
    </div>
  );
}
