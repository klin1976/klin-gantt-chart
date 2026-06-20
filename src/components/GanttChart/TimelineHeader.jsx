import React from 'react';
import PropTypes from 'prop-types';
import { VIEW_MODES } from '../../constants';

/**
 * Renders the header of the Gantt chart timeline with dates and days/weeks.
 * 
 * @param {Object} props - The component props.
 * @param {Array<Date>} props.dateRange - Array of Date objects representing the timeline range.
 * @param {string} props.viewMode - Current view mode ('day', 'week', 'month', 'year').
 * @param {number} props.totalChartWidth - Total width of the timeline in pixels.
 * @param {React.MutableRefObject} props.headerScrollRef - Ref for the header container to sync scrolling.
 * @param {Function} props.onScroll - Scroll event handler.
 * @returns {React.ReactElement} The TimelineHeader component.
 */
export default function TimelineHeader({ dateRange, viewMode, totalChartWidth, headerScrollRef, onScroll }) {
  // 原 getHeaderLabel
  const getLabel = (date) => {
    if (viewMode === 'day') {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    if (viewMode === 'week') {
      const end = new Date(date);
      end.setDate(end.getDate() + 6);
      return `${date.getMonth() + 1}/${date.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
    }
    if (viewMode === 'month') return `${date.getFullYear()}/${date.getMonth() + 1}`;
    if (viewMode === 'year') return `${date.getFullYear()}`;
    return '';
  };

  // 原 getHeaderSubLabel
  const getSubLabel = (date) => {
    if (viewMode === 'day') {
      return ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
    }
    if (viewMode === 'week') {
      // 取得週別
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const wNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `W${wNum}`;
    }
    if (viewMode === 'month') return '月份';
    if (viewMode === 'year') return '年份';
    return '';
  };

  return (
    <div className="flex border-b border-gray-700 bg-[#1f2937]">
      <div className="w-96 flex-shrink-0 border-r border-gray-700 p-4 font-semibold bg-[#1a202c] text-gray-300 flex items-center justify-between z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
        <span className="text-base">任務名稱</span>
        <span className="text-sm font-normal text-gray-500">進度</span>
      </div>
      <div
        ref={headerScrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar"
      >
        <div className="flex" style={{ width: `${totalChartWidth}px` }}>
          {dateRange.map((date, i) => {
            const isWeekend = viewMode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            return (
              <div
                key={i}
                style={{ width: VIEW_MODES[viewMode].columnWidth }}
                className={`flex-shrink-0 border-r border-gray-700 flex flex-col items-center justify-center py-3 text-sm ${isWeekend ? 'bg-gray-800/50' : 'bg-transparent'}`}
              >
                <span className={`font-medium ${isWeekend ? 'text-rose-500' : 'text-gray-300'}`}>
                  {getLabel(date)}
                </span>
                <span className="text-gray-500 scale-75 transform">
                  {getSubLabel(date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

TimelineHeader.propTypes = {
  dateRange: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  viewMode: PropTypes.oneOf(['day', 'week', 'month', 'year']).isRequired,
  totalChartWidth: PropTypes.number.isRequired,
  headerScrollRef: PropTypes.shape({ current: PropTypes.any }),
  onScroll: PropTypes.func.isRequired
};
