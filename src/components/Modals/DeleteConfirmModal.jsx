import React from 'react';
import { AlertTriangle } from 'lucide-react';
import useGanttStore from '../../store/useGanttStore';

/**
 * Modal component for confirming the deletion of a task.
 * 
 * @returns {React.ReactElement|null} The DeleteConfirmModal component or null if no task is selected for deletion.
 */
export default function DeleteConfirmModal() {
  const { taskToDelete, setTaskToDelete, confirmDeleteTask } = useGanttStore();

  if (!taskToDelete) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80 max-w-[90%] text-center animate-in zoom-in duration-200">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">確認刪除</h3>
        <p className="text-sm text-gray-500 mb-6">您確定要刪除「<span className="font-medium text-gray-700">{taskToDelete.name}</span>」嗎？</p>
        <div className="flex gap-3 w-full">
          <button onClick={() => setTaskToDelete(null)} className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            取消
          </button>
          <button onClick={confirmDeleteTask} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm">
            刪除
          </button>
        </div>
      </div>
    </div>
  );
}
