import React from 'react';
import PropTypes from 'prop-types';
import { Save, Image as ImageIcon, Info, Download } from 'lucide-react';
import useGanttStore from '../../store/useGanttStore';

/**
 * Modal component for saving the project data or exporting as an image.
 * 
 * @param {Object} props - The component props.
 * @param {Function} props.onSubmit - The function to call when confirming the save/export.
 * @returns {React.ReactElement|null} The SaveModal component or null if not open.
 */
export default function SaveModal({ onSubmit }) {
  const {
    modals,
    saveMode,
    saveFileName,
    setSaveFileName,
    setModalOpen
  } = useGanttStore();

  const isOpen = modals.save;

  if (!isOpen) return null;

  const onClose = () => setModalOpen('save', false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-[90%] animate-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          {saveMode === 'project' ? <Save className="w-5 h-5 text-indigo-600" /> : <ImageIcon className="w-5 h-5 text-indigo-600" />}
          {saveMode === 'project' ? '儲存專案' : '匯出圖片'}
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2 mb-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-semibold mb-1">關於選擇儲存位置：</p>
              若未跳出選擇視窗，請檢查瀏覽器設定：設定 &gt; 下載 &gt; 開啟「下載前詢問每個檔案的儲存位置」。
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">檔案名稱</label>
            <div className="flex items-center">
              <input
                type="text"
                value={saveFileName}
                onChange={e => setSaveFileName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="輸入檔名..."
                autoFocus
              />
              <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500 text-sm">
                {saveMode === 'project' ? '.json' : '.png'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
          <button onClick={onSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2">
            <Download className="w-4 h-4" />確認儲存
          </button>
        </div>
      </div>
    </div>
  );
}

SaveModal.propTypes = {
  onSubmit: PropTypes.func.isRequired
};
