import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a single task bar or milestone indicator on the Gantt chart timeline.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.task - The task object containing details like name, progress, and milestone status.
 * @param {number} props.index - The index of the task in the list.
 * @param {Object} props.style - The inline style object for positioning the task bar.
 * @param {Object} props.categoryInfo - The category object containing color and label information.
 * @param {boolean} props.isCritical - Whether the task is on the critical path.
 * @returns {React.ReactElement} The TaskBar component.
 */
export default function TaskBar({ task, index, style, categoryInfo, isCritical }) {
  const isMilestone = task.milestone;

  if (isMilestone) {
    const leftVal = parseFloat(style.left) || 0;
    const widthVal = parseFloat(style.width) || 0;
    const centerLeft = leftVal + widthVal / 2 - 12; // Center 24px wide diamond in the slot

    return (
      <div className="h-[84px] relative flex items-center">
        <div
          className={`absolute w-6 h-6 border cursor-pointer hover:scale-110 hover:brightness-110 transition-all shadow-md ${
            isCritical ? 'border-red-500 shadow-red-500/40 ring-2 ring-red-500/50 shadow-lg' : 'border-white/40'
          }`}
          style={{
            left: `${centerLeft}px`,
            backgroundColor: categoryInfo.color,
            transform: 'rotate(45deg)',
          }}
          title={`${task.name}: ${task.start} (里程碑)`}
        />
        <div
          className={`absolute text-[15px] font-medium whitespace-nowrap pl-6 pointer-events-none select-none ${
            isCritical ? 'text-red-400 font-bold drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]' : 'text-gray-300'
          }`}
          style={{
            left: `${centerLeft + 12}px`
          }}
        >
          {task.name}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[84px] relative flex items-center">
      <div
        className={`absolute h-12 rounded-md shadow-sm border overflow-hidden cursor-pointer hover:brightness-110 transition-all group ${
          isCritical ? 'border-red-500 shadow-red-500/40 ring-2 ring-red-500/30' : 'border-white/20'
        }`}
        style={{
          left: style.left,
          width: style.width,
          backgroundColor: categoryInfo.color
        }}
        title={`${task.name}: ${task.start} 至 ${task.end}`}
      >
        <div className="h-full bg-white/30" style={{ width: `${task.progress}%` }} />
        <div className="absolute inset-0 flex items-center px-2">
          <span className="text-[15px] text-white font-medium whitespace-nowrap drop-shadow-md truncate w-full bar-text-content">
            {task.name} ({task.progress}%)
          </span>
        </div>
      </div>
    </div>
  );
}
