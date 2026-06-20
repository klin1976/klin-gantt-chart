import React from 'react';
import { X, Stamp } from 'lucide-react';
import useGanttStore from '../../store/useGanttStore';

/**
 * Modal component for configuring the watermark settings for image export.
 * 
 * @returns {React.ReactElement|null} The WatermarkModal component or null if not open.
 */
export default function WatermarkModal() {
  const {
    modals,
    watermarkConfig,
    setWatermarkConfig,
    setModalOpen
  } = useGanttStore();

  const isOpen = modals.watermark;

  if (!isOpen) return null;

  const onClose = () => setModalOpen('watermark', false);

  const { text, color, opacity, fontSize, rotate, pos } = watermarkConfig;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-[90%] animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Stamp className="w-5 h-5 text-indigo-600" /> 浮水印設定</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">浮水印文字</label>
            <input
              type="text"
              value={text}
              onChange={e => setWatermarkConfig({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="例如：機密文件..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">顏色</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1.5 bg-white">
                <input
                  type="color"
                  value={color}
                  onChange={e => setWatermarkConfig({ color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs text-gray-500">{color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">透明度 ({Math.round(opacity * 100)}%)</label>
              <div className="flex items-center h-[46px]">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={e => setWatermarkConfig({ opacity: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">字體大小 ({fontSize}px)</label>
            <div className="flex items-center h-[46px]">
              <input
                type="range"
                min="12"
                max="128"
                step="2"
                value={fontSize}
                onChange={e => setWatermarkConfig({ fontSize: parseInt(e.target.value) })}
                className="w-full cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">旋轉角度 ({rotate}°)</label>
            <div className="flex items-center h-[46px]">
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={rotate}
                onChange={e => setWatermarkConfig({ rotate: parseInt(e.target.value) })}
                className="w-full cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">顯示位置</label>
            <div className="grid grid-cols-3 gap-2 h-24 bg-gray-100 rounded-lg p-2">
              <button
                onClick={() => setWatermarkConfig({ pos: 'top-left' })}
                className={`rounded border transition-colors ${pos === 'top-left' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'}`}
              >
                ↖
              </button>
              <div></div>
              <button
                onClick={() => setWatermarkConfig({ pos: 'top-right' })}
                className={`rounded border transition-colors ${pos === 'top-right' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'}`}
              >
                ↗
              </button>
              <div></div>
              <button
                onClick={() => setWatermarkConfig({ pos: 'center' })}
                className={`rounded border transition-colors ${pos === 'center' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'}`}
              >
                •
              </button>
              <div></div>
              <button
                onClick={() => setWatermarkConfig({ pos: 'bottom-left' })}
                className={`rounded border transition-colors ${pos === 'bottom-left' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'}`}
              >
                ↙
              </button>
              <div></div>
              <button
                onClick={() => setWatermarkConfig({ pos: 'bottom-right' })}
                className={`rounded border transition-colors ${pos === 'bottom-right' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'}`}
              >
                ↘
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">完成設定</button>
        </div>
      </div>
    </div>
  );
}
