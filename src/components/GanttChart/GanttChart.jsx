import React from 'react';
import TimelineHeader from './TimelineHeader';
import TaskList from './TaskList';
import TaskBar from './TaskBar';
import TodayIndicator from './TodayIndicator';
import { VIEW_MODES } from '../../constants';

export default function GanttChart({
  tasks,
  draggedIndex,
  viewMode,
  dateRange,
  totalChartWidth,
  dateToPx,
  getTaskStyle,
  getCategoryInfo,
  headerScrollRef,
  bodyScrollRef,
  phantomScrollRef,
  onScroll,
  onDragStart,
  onDragOver,
  onDragEnd,
  onEditTask,
  onDeleteTask,
  watermarkText,
  watermarkStyle,
  criticalTaskIds = []
}) {
  return (
    <div id="gantt-capture-root" className="flex-1 overflow-hidden flex flex-col relative bg-[#111827]">
      <TimelineHeader
        dateRange={dateRange}
        viewMode={viewMode}
        totalChartWidth={totalChartWidth}
        headerScrollRef={headerScrollRef}
        onScroll={() => onScroll(headerScrollRef, [bodyScrollRef, phantomScrollRef])}
      />

      <div className="flex-1 overflow-auto flex">
        <TaskList
          tasks={tasks}
          draggedIndex={draggedIndex}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          criticalTaskIds={criticalTaskIds}
        />

        <div
          ref={bodyScrollRef}
          onScroll={() => onScroll(bodyScrollRef, [headerScrollRef, phantomScrollRef])}
          className="flex-1 overflow-x-auto relative custom-scrollbar bg-[#111827]"
        >
          <div className="relative" style={{ width: `${totalChartWidth}px`, height: `${Math.max(tasks.length * 84, 300)}px` }}>
            <div className="absolute inset-0 flex pointer-events-none">
              {dateRange.map((date, i) => (
                <div
                  key={i}
                  style={{ width: VIEW_MODES[viewMode].columnWidth }}
                  className="flex-shrink-0 border-r border-gray-800 h-full bg-transparent"
                />
              ))}
            </div>

            <TodayIndicator positionPx={dateToPx(new Date())} />

            {/* SVG Canvas for dependency connections */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full"
              style={{ zIndex: 5 }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4b5563" />
                </marker>
                <marker
                  id="arrow-critical"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                </marker>
              </defs>
              {tasks.map((task, index) => {
                const deps = task.dependencies || [];
                const currentStyle = getTaskStyle(task);
                const isCurrentMilestone = task.milestone;
                
                const x2 = (parseFloat(currentStyle.left) || 0) + (isCurrentMilestone ? (parseFloat(currentStyle.width) || 0) / 2 : 0);
                const y2 = index * 84 + 42;

                return deps.map(depId => {
                  const depIndex = tasks.findIndex(t => t.id === depId);
                  if (depIndex === -1) return null;
                  const depTask = tasks[depIndex];
                  const depStyle = getTaskStyle(depTask);
                  const isDepMilestone = depTask.milestone;
                  
                  const x1 = (parseFloat(depStyle.left) || 0) + (isDepMilestone ? (parseFloat(depStyle.width) || 0) / 2 : (parseFloat(depStyle.width) || 0));
                  const y1 = depIndex * 84 + 42;

                  const isCriticalConnection = criticalTaskIds.includes(depTask.id) && criticalTaskIds.includes(task.id);
                  const color = isCriticalConnection ? '#ef4444' : '#4b5563';
                  const strokeWidth = isCriticalConnection ? 2.5 : 1.5;
                  const markerId = isCriticalConnection ? 'url(#arrow-critical)' : 'url(#arrow)';

                  // Route: Fold lines
                  const offset = 16;
                  let d = '';
                  if (x2 >= x1 + offset) {
                    const midX = (x1 + x2) / 2;
                    d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
                  } else {
                    const midY = (y1 + y2) / 2;
                    d = `M ${x1} ${y1} L ${x1 + offset} ${y1} L ${x1 + offset} ${midY} L ${x2 - offset} ${midY} L ${x2 - offset} ${y2} L ${x2} ${y2}`;
                  }

                  return (
                    <path
                      key={`${depId}-${task.id}`}
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={strokeWidth}
                      markerEnd={markerId}
                    />
                  );
                });
              })}
            </svg>

            <div className="absolute top-0 left-0 w-full pt-[4px] z-10">
              {tasks.map((task, index) => {
                const style = getTaskStyle(task);
                const categoryInfo = getCategoryInfo(task.category);
                const isCritical = criticalTaskIds.includes(task.id);
                return (
                  <TaskBar
                    key={task.id}
                    task={task}
                    index={index}
                    style={style}
                    categoryInfo={categoryInfo}
                    isCritical={isCritical}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {watermarkText.trim() && (
        <div style={watermarkStyle}>
          {watermarkText}
        </div>
      )}

      <div
        ref={phantomScrollRef}
        onScroll={() => onScroll(phantomScrollRef, [bodyScrollRef, headerScrollRef])}
        className="h-5 overflow-x-scroll overflow-y-hidden custom-scrollbar bg-[#111827] border-t border-gray-700 sticky bottom-0 z-30"
        style={{ marginLeft: '384px' }}
        data-html2canvas-ignore="true"
      >
        <div style={{ width: `${totalChartWidth}px`, height: '1px' }} />
      </div>
    </div>
  );
}
