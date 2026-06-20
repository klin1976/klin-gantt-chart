import React from 'react';
import { X, Palette, Trash2, Plus } from 'lucide-react';
import useGanttStore from '../../store/useGanttStore';

/**
 * Modal component for managing project categories (colors and labels).
 * 
 * @returns {React.ReactElement|null} The CategoryModal component or null if not open.
 */
export default function CategoryModal() {
  const {
    modals,
    categories,
    newCategory,
    setNewCategory,
    handleAddCategory,
    handleDeleteCategory,
    setCategories,
    setModalOpen
  } = useGanttStore();

  const isOpen = modals.category;

  if (!isOpen) return null;

  const onClose = () => setModalOpen('category', false);

  const onChangeColor = (id, color) => {
    setCategories(categories.map(c => c.id === id ? { ...c, color } : c));
  };

  const onChangeLabel = (id, label) => {
    setCategories(categories.map(c => c.id === id ? { ...c, label } : c));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[400px] max-w-[90%] animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Palette className="w-5 h-5" /> 類別管理</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg hover:bg-gray-50">
              <input
                type="color"
                value={cat.color}
                onChange={(e) => onChangeColor(cat.id, e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={cat.label}
                onChange={(e) => onChangeLabel(cat.id, e.target.value)}
                className="flex-1 bg-transparent border-b border-transparent focus:border-indigo-300 outline-none px-1 text-gray-900"
              />
              <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-500 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">新增類別</h3>
          <div className="flex gap-2">
            <input
              type="color"
              value={newCategory.color}
              onChange={e => setNewCategory({ color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200 p-1"
            />
            <input
              type="text"
              placeholder="類別名稱 (如: 行銷)"
              value={newCategory.label}
              onChange={e => setNewCategory({ label: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.label}
              className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
