import React from 'react';
import { Calendar, Edit, Undo2, Redo2, Stamp, Settings, Download, Upload, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { VIEW_MODES } from '../../constants';

export default function Header({
  projectTitle,
  setProjectTitle,
  projectSubtitle,
  setProjectSubtitle,
  viewMode,
  setViewMode,
  watermarkText,
  isExporting,
  fileInputRef,
  onUndo,
  onRedo,
  onOpenWatermarkModal,
  onOpenCategoryModal,
  onOpenSaveModal,
  onOpenAddModal
}) {
  return (
    <header className="bg-[#1f2937] border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm z-20 gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 group">
          <Calendar className="w-9 h-9 text-indigo-500 flex-shrink-0" />
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="text-4xl font-bold text-gray-100 bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-900 rounded px-1 -ml-1 w-full transition-all hover:bg-gray-800/50"
              placeholder="專案名稱"
            />
            <Edit className="w-4 h-4 text-gray-500 absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 group/sub">
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              value={projectSubtitle}
              onChange={(e) => setProjectSubtitle(e.target.value)}
              className="text-xl text-gray-400 bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-900 rounded px-1 -ml-1 w-full transition-all hover:bg-gray-800/50 leading-relaxed py-1"
              placeholder="專案描述"
            />
            <Edit className="w-3 h-3 text-gray-500 absolute -right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/sub:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2" data-html2canvas-ignore="true">
        {/* Undo/Redo 控制按鈕 */}
        <div className="flex gap-1">
          <button
            onClick={onUndo}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm"
            title="復原 (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          {Object.entries(VIEW_MODES).map(([mode, { label }]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <button
          onClick={onOpenWatermarkModal}
          className={`bg-white border hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm ${watermarkText ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300'}`}
          title="設定匯出浮水印"
        >
          <Stamp className={`w-4 h-4 ${watermarkText ? 'text-indigo-600' : 'text-gray-500'}`} />
          <span className="hidden sm:inline">浮水印</span>
        </button>

        <button
          onClick={onOpenCategoryModal}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm"
          title="管理類別設定"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">類別</span>
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <button
          onClick={() => onOpenSaveModal('project')}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">儲存</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">載入</span>
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <button
          onClick={() => onOpenSaveModal('image')}
          disabled={isExporting}
          className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          <span className="hidden sm:inline">截圖</span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">新增</span>
        </button>
      </div>
    </header>
  );
}
