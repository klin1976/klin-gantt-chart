import React from 'react';
import PropTypes from 'prop-types';
import { GripVertical, Edit, Trash2 } from 'lucide-react';
import useGanttStore from '../../store/useGanttStore';

/**
 * Renders the list of tasks with drag-and-drop support, edit, and delete actions.
 * 
 * @param {Object} props - The component props.
 * @param {Array<string>} [props.criticalTaskIds=[]] - Array of task IDs that are on the critical path.
 * @returns {React.ReactElement} The TaskList component.
 */
export default function TaskList({ criticalTaskIds = [] }) {
  const {
    tasks,
    draggedIndex,
    dragOverIndex,
    dragPosition,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    setTaskToDelete,
    setEditingId,
    setNewTask,
    setModalOpen,
  } = useGanttStore();

  const onEditTask = (task) => {
    setEditingId(task.id);
    setNewTask({
      name: task.name,
      start: task.start,
      end: task.end,
      progress: task.progress,
      category: task.category,
      milestone: task.milestone || false,
      dependencies: task.dependencies || []
    });
    setModalOpen('add', true);
  };

  const onDeleteTask = (task) => {
    setTaskToDelete(task);
  };

  return (
    <div className="w-96 flex-shrink-0 bg-[#1a202c] border-r border-gray-700 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] min-h-full">
      {tasks.map((task, index) => {
        const isCritical = criticalTaskIds.includes(task.id);
        return (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => {
              // Store index in dataTransfer just in case
              e.dataTransfer.effectAllowed = 'move';
              handleDragStart(index);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              const rect = e.currentTarget.getBoundingClientRect();
              handleDragOver(index, e.clientY, rect);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop();
            }}
            onDragEnd={handleDragEnd}
            className={`h-[84px] border-b border-gray-700/50 px-4 flex items-center justify-between hover:bg-gray-800/50 group cursor-grab active:cursor-grabbing transition-colors duration-200 ${
              draggedIndex === index ? 'opacity-30 bg-indigo-900/30' : ''
            } ${
              dragOverIndex === index && dragPosition === 'top' ? 'drag-over-top' : ''
            } ${
              dragOverIndex === index && dragPosition === 'bottom' ? 'drag-over-bottom' : ''
            } ${isCritical ? 'border-l-[6px] border-l-red-500 bg-red-950/10' : ''}`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <GripVertical className="w-5 h-5 text-gray-600 flex-shrink-0 group-hover:text-gray-400 transition-colors" />
              <div className="flex flex-col min-w-0 pr-2 justify-center task-text-container">
                <span className="text-xl font-medium text-gray-200 whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed py-0.5 flex items-center gap-2" title={task.name}>
                  {task.name}
                  {isCritical && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white font-bold select-none shrink-0">
                      關鍵
                    </span>
                  )}
                </span>
                <span className="text-[15px] text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis leading-normal block">
                  {task.start} ~ {task.end}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0" data-html2canvas-ignore="true">
              <span className="text-sm px-2 py-1 rounded-full bg-gray-800 text-gray-400">
                {task.milestone ? '里程碑' : `${task.progress}%`}
              </span>
              <button onClick={() => onEditTask(task)} className="text-gray-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => onDeleteTask(task)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
      {tasks.length === 0 && <div className="p-8 text-center text-gray-500 text-base">尚無任務</div>}
    </div>
  );
}

TaskList.propTypes = {
  criticalTaskIds: PropTypes.arrayOf(PropTypes.string)
};
