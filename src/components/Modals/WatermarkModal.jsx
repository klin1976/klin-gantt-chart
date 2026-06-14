import React from 'react';
import { X, Stamp } from 'lucide-react';

export default function WatermarkModal({
  isOpen,
  watermarkText,
  setWatermarkText,
  watermarkColor,
  setWatermarkColor,
  watermarkOpacity,
  setWatermarkOpacity,
  watermarkFontSize,
  setWatermarkFontSize,
  watermarkRotate,
  setWatermarkRotate,
  watermarkPos,
  setWatermarkPos,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-[90%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Stamp className="w-5 h-5 text-indigo-600" /> 浮水印設定</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">浮水印文字</label>
            <input
              type="text"
              value={watermarkText}
              onChange={e => setWatermarkText(e.target.value)}
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
                  value={watermarkColor}
                  onChange={e => setWatermarkColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs text-gray-500">{watermarkColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">透明度 ({Math.round(watermarkOpacity * 100)}%)</label>
              <div className="flex items-center h-[46px]">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={watermarkOpacity}
                  onChange={e => setWatermarkOpacity(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">字體大小 ({watermarkFontSize}px)</label>
            <div className="flex items-center h-[46px]">
              <input
                type="range"
                min="12"
                max="128"
                step="2"
                value={watermarkFontSize}
                onChange={e => setWatermarkFontSize(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">旋轉角度 ({watermarkRotate}°)</label>
            <div className="flex items-center h-[46px]">
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={watermarkRotate}
                onChange={e => setWatermarkRotate(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">顯示位置</label>
            <div className="grid grid-cols-3 gap-2 h-24 bg-gray-100 rounded-lg p-2">
              <button
                onClick={() => setWatermarkPos('top-left')}
                className={`rounded border transition-colors ${watermarkPos === 'top-left' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'}`}
              >
                ↖
              </button>
              <div></div>
              <button
                onClick={() => setWatermarkPos('top-right')}
                className={`rounded border transition-colors ${watermarkPos === 'top-right' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'}`}
              >
                ↗
              </button>
              <div></div>
              <button
                onClick={() => setWatermarkPos('center')}
                className={`rounded border transition-colors ${watermarkPos === 'center' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'}`}
              >
                •
              </button>
              <div></div>
              <button
                onClick={() => setWatermarkPos('bottom-left')}
                className={`rounded border transition-colors ${watermarkPos === 'bottom-left' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'}`}
              >
                ↙
              </button>
              <div></div>
              <button
                onClick={() => setWatermarkPos('bottom-right')}
                className={`rounded border transition-colors ${watermarkPos === 'bottom-right' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'}`}
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
