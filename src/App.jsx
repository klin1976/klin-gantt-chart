import html2canvas from 'html2canvas';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// constants
import { DEFAULT_CATEGORIES, INITIAL_TASKS } from './constants';

// utils
import { getWatermarkStyle } from './utils/styleUtils';
import { calculateCriticalPath } from './utils/cpm';

// hooks
import useSyncScroll from './hooks/useSyncScroll';
import useGanttData from './hooks/useGanttData';

// components
import Header from './components/Header/Header';
import GanttChart from './components/GanttChart/GanttChart';
import Legend from './components/Legend/Legend';

// modals
import TaskModal from './components/Modals/TaskModal';
import CategoryModal from './components/Modals/CategoryModal';
import SaveModal from './components/Modals/SaveModal';
import WatermarkModal from './components/Modals/WatermarkModal';
import DeleteConfirmModal from './components/Modals/DeleteConfirmModal';

// 嘗試從 localStorage 讀取初始值
const getInitialState = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(`klin_gantt_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error('Failed to parse saved state for key:', key, e);
    return defaultValue;
  }
};

export default function App() {
  // 1. 狀態初始化
  const [tasks, setTasks] = useState(() => getInitialState('tasks', INITIAL_TASKS));
  const [categories, setCategories] = useState(() => getInitialState('categories', DEFAULT_CATEGORIES));

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Data state
  const [saveFileName, setSaveFileName] = useState('');
  const [saveMode, setSaveMode] = useState('project');

  // Watermark state
  const [watermarkText, setWatermarkText] = useState(() => getInitialState('watermark_text', ''));
  const [watermarkPos, setWatermarkPos] = useState(() => getInitialState('watermark_pos', 'bottom-right'));
  const [watermarkColor, setWatermarkColor] = useState(() => getInitialState('watermark_color', '#94a3b8'));
  const [watermarkOpacity, setWatermarkOpacity] = useState(() => getInitialState('watermark_opacity', 0.3));
  const [watermarkFontSize, setWatermarkFontSize] = useState(() => getInitialState('watermark_font_size', 24));
  const [watermarkRotate, setWatermarkRotate] = useState(() => getInitialState('watermark_rotate', -30));
  const [viewMode, setViewMode] = useState('day');

  // Project Info state
  const [projectTitle, setProjectTitle] = useState(() => getInitialState('project_title', '專案甘特圖'));
  const [projectSubtitle, setProjectSubtitle] = useState(() => getInitialState('project_subtitle', '視覺化專案進度與時程規劃'));

  // 2. Hooks & Refs
  const chartRef = useRef(null);
  const fileInputRef = useRef(null);
  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);
  const phantomScrollRef = useRef(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleScroll = useSyncScroll();
  const { dateRange, totalChartWidth, dateToPx, getTaskStyle } = useGanttData(tasks, viewMode);

  const { criticalTaskIds, slacks, hasCycle } = useMemo(() => {
    return calculateCriticalPath(tasks);
  }, [tasks]);

  // Undo/Redo
  const historyRef = useRef({
    past: [],
    future: []
  });

  const getSnapshot = useCallback(() => {
    return {
      tasks,
      categories,
      projectTitle,
      projectSubtitle,
      watermark: {
        text: watermarkText,
        pos: watermarkPos,
        color: watermarkColor,
        opacity: watermarkOpacity,
        fontSize: watermarkFontSize,
        rotate: watermarkRotate
      }
    };
  }, [tasks, categories, projectTitle, projectSubtitle, watermarkText, watermarkPos, watermarkColor, watermarkOpacity, watermarkFontSize, watermarkRotate]);

  const pushHistory = useCallback(() => {
    const current = getSnapshot();
    historyRef.current.past.push(JSON.parse(JSON.stringify(current)));
    historyRef.current.future = [];
  }, [getSnapshot]);

  const handleUndo = useCallback(() => {
    if (historyRef.current.past.length === 0) return;
    
    const current = getSnapshot();
    historyRef.current.future.push(JSON.parse(JSON.stringify(current)));

    const previous = historyRef.current.past.pop();
    
    if (previous) {
      setTasks(previous.tasks);
      setCategories(previous.categories);
      setProjectTitle(previous.projectTitle);
      setProjectSubtitle(previous.projectSubtitle);
      if (previous.watermark) {
        setWatermarkText(previous.watermark.text || '');
        setWatermarkPos(previous.watermark.pos || 'bottom-right');
        setWatermarkColor(previous.watermark.color || '#94a3b8');
        setWatermarkOpacity(previous.watermark.opacity !== undefined ? previous.watermark.opacity : 0.3);
        setWatermarkFontSize(previous.watermark.fontSize || 24);
        setWatermarkRotate(previous.watermark.rotate !== undefined ? previous.watermark.rotate : -30);
      }
    }
  }, [getSnapshot]);

  const handleRedo = useCallback(() => {
    if (historyRef.current.future.length === 0) return;

    const current = getSnapshot();
    historyRef.current.past.push(JSON.parse(JSON.stringify(current)));

    const nextState = historyRef.current.future.pop();
    if (nextState) {
      setTasks(nextState.tasks);
      setCategories(nextState.categories);
      setProjectTitle(nextState.projectTitle);
      setProjectSubtitle(nextState.projectSubtitle);
      if (nextState.watermark) {
        setWatermarkText(nextState.watermark.text || '');
        setWatermarkPos(nextState.watermark.pos || 'bottom-right');
        setWatermarkColor(nextState.watermark.color || '#94a3b8');
        setWatermarkOpacity(nextState.watermark.opacity !== undefined ? nextState.watermark.opacity : 0.3);
        setWatermarkFontSize(nextState.watermark.fontSize || 24);
        setWatermarkRotate(nextState.watermark.rotate !== undefined ? nextState.watermark.rotate : -30);
      }
    }
  }, [getSnapshot]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Tasks edit state
  const [newTask, setNewTask] = useState({
    name: '',
    start: '',
    end: '',
    progress: 0,
    category: 'planning',
    milestone: false,
    dependencies: []
  });

  const [newCategory, setNewCategory] = useState({ label: '', color: '#000000' });

  // Drag-and-drop
  const handleDragStart = (index) => {
    pushHistory();
    setDraggedIndex(index);
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newTasks = [...tasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(index, 0, removed);
    setTasks(newTasks);
    setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  // Auto save
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem('klin_gantt_tasks', JSON.stringify(tasks));
        localStorage.setItem('klin_gantt_categories', JSON.stringify(categories));
        localStorage.setItem('klin_gantt_project_title', JSON.stringify(projectTitle));
        localStorage.setItem('klin_gantt_project_subtitle', JSON.stringify(projectSubtitle));
        localStorage.setItem('klin_gantt_watermark_text', JSON.stringify(watermarkText));
        localStorage.setItem('klin_gantt_watermark_pos', JSON.stringify(watermarkPos));
        localStorage.setItem('klin_gantt_watermark_color', JSON.stringify(watermarkColor));
        localStorage.setItem('klin_gantt_watermark_opacity', JSON.stringify(watermarkOpacity));
        localStorage.setItem('klin_gantt_watermark_font_size', JSON.stringify(watermarkFontSize));
        localStorage.setItem('klin_gantt_watermark_rotate', JSON.stringify(watermarkRotate));
      } catch (e) {
        console.error('Failed to save state to localStorage', e);
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [tasks, categories, projectTitle, projectSubtitle, watermarkText, watermarkPos, watermarkColor, watermarkOpacity, watermarkFontSize, watermarkRotate]);

  useEffect(() => {
    document.title = projectTitle;
  }, [projectTitle]);

  const getCategoryInfo = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat || { label: '未分類', color: '#94a3b8' };
  };

  const handleAddCategory = () => {
    if (!newCategory.label) return;
    pushHistory();
    const id = `cat_${Date.now()}`;
    setCategories([...categories, { id, ...newCategory }]);
    setNewCategory({ label: '', color: '#000000' });
  };

  const handleDeleteCategory = (id) => {
    if (categories.length <= 1) {
      alert("至少需要保留一個類別");
      return;
    }
    const isInUse = tasks.some(t => t.category === id);
    if (isInUse) {
      if (!window.confirm("有任務正在使用此類別，刪除後這些任務將變為「未分類」或顯示異常。確定刪除？")) {
        return;
      }
    }
    pushHistory();
    setCategories(categories.filter(c => c.id !== id));
  };

  const initiateDelete = (task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      pushHistory();
      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    const defaultCat = categories.length > 0 ? categories[0].id : '';
    setNewTask({
      name: '',
      start: '',
      end: '',
      progress: 0,
      category: defaultCat,
      milestone: false,
      dependencies: []
    });
    setShowAddModal(true);
  };

  const handleEditTask = (task) => {
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
    setShowAddModal(true);
  };

  const handleSaveTask = () => {
    if (!newTask.name || !newTask.start) return;

    pushHistory();
    const finalTask = {
      ...newTask,
      progress: newTask.milestone ? 100 : Number(newTask.progress),
      end: newTask.milestone ? newTask.start : (newTask.end || newTask.start),
      dependencies: newTask.dependencies || []
    };

    if (editingId) {
      setTasks(tasks.map(t => t.id === editingId ? { ...finalTask, id: editingId } : t));
    } else {
      const id = Math.max(...tasks.map(t => (typeof t.id === 'number' ? t.id : 0)), 0) + 1;
      setTasks([...tasks, { ...finalTask, id }]);
    }

    setShowAddModal(false);
    setNewTask({
      name: '',
      start: '',
      end: '',
      progress: 0,
      category: categories[0]?.id || '',
      milestone: false,
      dependencies: []
    });
    setEditingId(null);
  };

  const handleOpenSaveModal = (mode) => {
    setSaveMode(mode);
    const dateStr = new Date().toISOString().slice(0, 10);
    const safeTitle = projectTitle.replace(/[\\/:*?"<>|]/g, '_').trim();
    const prefix = safeTitle || (mode === 'project' ? 'gantt_project' : '甘特圖截圖');
    setSaveFileName(`${prefix}_${dateStr}`);
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    if (saveMode === 'project') {
      executeSaveProject();
    } else {
      executeExportImage();
    }
  };

  const executeSaveProject = async () => {
    setShowSaveModal(false);
    const finalFileName = `${saveFileName}.json`;

    const projectData = {
      version: 4,
      createdAt: new Date().toISOString(),
      categories: categories,
      tasks: tasks,
      watermark: {
        text: watermarkText,
        pos: watermarkPos,
        color: watermarkColor,
        opacity: watermarkOpacity,
        fontSize: watermarkFontSize,
        rotate: watermarkRotate
      },
      projectTitle,
      projectSubtitle
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    try {
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: finalFileName,
            types: [{ description: 'JSON Project File', accept: { 'application/json': ['.json'] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          return;
        } catch (pickerError) {
          if (pickerError.name === 'AbortError') return;
          console.warn('Picker blocked or cancelled, trying fallback.');
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('儲存失敗:', err);
      alert('儲存失敗，請重試');
    }
  };

  const handleLoadProject = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        pushHistory();
        if (data.version && data.tasks) {
          setTasks(data.tasks);
          if (data.categories) setCategories(data.categories);
          if (data.watermark) {
            setWatermarkText(data.watermark.text || '');
            setWatermarkPos(data.watermark.pos || 'bottom-right');
            setWatermarkColor(data.watermark.color || '#94a3b8');
            setWatermarkOpacity(data.watermark.opacity !== undefined ? data.watermark.opacity : 0.3);
            setWatermarkFontSize(data.watermark.fontSize || 24);
            setWatermarkRotate(data.watermark.rotate !== undefined ? data.watermark.rotate : -30);
          }
          if (data.projectTitle) setProjectTitle(data.projectTitle);
          if (data.projectSubtitle) setProjectSubtitle(data.projectSubtitle);
        }
        else if (Array.isArray(data)) {
          setTasks(data);
          setCategories(DEFAULT_CATEGORIES);
          alert('提示：您載入的是舊版專案檔，已自動套用預設類別。');
        } else {
          alert('檔案格式錯誤');
        }
      } catch (err) {
        console.error(err);
        alert('無法解析檔案');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const executeExportImage = async () => {
    if (!html2canvas || !chartRef.current) {
      alert("組件尚未加載完成");
      return;
    }

    setShowSaveModal(false);

    let fileHandle = null;
    const finalFileName = `${saveFileName}.png`;

    if (window.showSaveFilePicker) {
      try {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: finalFileName,
          types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('File Picker failed, falling back to download', err);
      }
    }

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(chartRef.current, {
        useCORS: true,
        scale: 2,
        logging: false,
        onclone: (clonedDoc) => {
          const header = clonedDoc.querySelector('header');
          if (header) {
            header.style.display = 'flex';
            header.style.flexDirection = 'column';
            header.style.alignItems = 'center';
            header.style.justifyContent = 'center';
            header.style.padding = '60px 20px 30px 20px';
            header.style.height = 'auto';
            header.style.gap = '12px';
          }

          clonedDoc.querySelectorAll('header svg').forEach(el => el.style.display = 'none');

          const headerTitleSection = clonedDoc.querySelector('header > div:first-child');
          if (headerTitleSection) {
            const currentTitle = clonedDoc.querySelector('input[placeholder="專案名稱"]')?.value;
            const currentSubtitle = clonedDoc.querySelector('input[placeholder="專案描述"]')?.value;

            headerTitleSection.innerHTML = '';
            headerTitleSection.style.display = 'flex';
            headerTitleSection.style.flexDirection = 'column';
            headerTitleSection.style.alignItems = 'center';
            headerTitleSection.style.width = '100%';

            const newTitle = clonedDoc.createElement('div');
            newTitle.textContent = currentTitle;
            newTitle.style.fontSize = '42px';
            newTitle.style.fontWeight = 'bold';
            newTitle.style.color = '#fff';
            newTitle.style.textAlign = 'center';
            newTitle.style.lineHeight = '1.4';
            newTitle.style.marginBottom = '8px';
            headerTitleSection.appendChild(newTitle);

            const newSubtitle = clonedDoc.createElement('div');
            newSubtitle.textContent = currentSubtitle;
            newSubtitle.style.fontSize = '24px';
            newSubtitle.style.color = '#9ca3af';
            newSubtitle.style.textAlign = 'center';
            newSubtitle.style.lineHeight = '1.5';
            headerTitleSection.appendChild(newSubtitle);
          }
          clonedDoc.querySelectorAll('.task-text-container span').forEach(el => {
            el.style.overflow = 'visible';
            el.style.whiteSpace = 'normal';
            el.style.textOverflow = 'clip';
          });
          clonedDoc.querySelectorAll('.bar-text-content').forEach(el => {
            el.style.paddingTop = '3px';
            el.style.lineHeight = '1';
            el.style.overflow = 'visible';
          });
        }
      });

      if (fileHandle) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = finalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      console.error("截圖失敗:", error);
      alert("匯出圖片失敗");
    } finally {
      setIsExporting(false);
    }
  };

  const watermarkStyle = getWatermarkStyle(watermarkText, watermarkPos, watermarkColor, watermarkOpacity, watermarkFontSize, watermarkRotate);

  return (
    <div className="flex flex-col h-screen bg-[#111827] text-gray-100 font-sans" ref={chartRef}>
      <input type="file" ref={fileInputRef} onChange={handleLoadProject} accept=".json" className="hidden" />

      <Header
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}
        projectSubtitle={projectSubtitle}
        setProjectSubtitle={setProjectSubtitle}
        viewMode={viewMode}
        setViewMode={setViewMode}
        watermarkText={watermarkText}
        isExporting={isExporting}
        fileInputRef={fileInputRef}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenWatermarkModal={() => setShowWatermarkModal(true)}
        onOpenCategoryModal={() => setShowCategoryModal(true)}
        onOpenSaveModal={handleOpenSaveModal}
        onOpenAddModal={handleOpenAddModal}
      />

      <GanttChart
        tasks={tasks}
        draggedIndex={draggedIndex}
        viewMode={viewMode}
        dateRange={dateRange}
        totalChartWidth={totalChartWidth}
        dateToPx={dateToPx}
        getTaskStyle={getTaskStyle}
        getCategoryInfo={getCategoryInfo}
        headerScrollRef={headerScrollRef}
        bodyScrollRef={bodyScrollRef}
        phantomScrollRef={phantomScrollRef}
        onScroll={handleScroll}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onEditTask={handleEditTask}
        onDeleteTask={initiateDelete}
        watermarkText={watermarkText}
        watermarkStyle={watermarkStyle}
        criticalTaskIds={criticalTaskIds}
      />

      <Legend categories={categories} />

      <WatermarkModal
        isOpen={showWatermarkModal}
        watermarkText={watermarkText}
        setWatermarkText={setWatermarkText}
        watermarkColor={watermarkColor}
        setWatermarkColor={setWatermarkColor}
        watermarkOpacity={watermarkOpacity}
        setWatermarkOpacity={setWatermarkOpacity}
        watermarkFontSize={watermarkFontSize}
        setWatermarkFontSize={setWatermarkFontSize}
        watermarkRotate={watermarkRotate}
        setWatermarkRotate={setWatermarkRotate}
        watermarkPos={watermarkPos}
        setWatermarkPos={setWatermarkPos}
        onClose={() => setShowWatermarkModal(false)}
      />

      <TaskModal
        isOpen={showAddModal}
        editingId={editingId}
        newTask={newTask}
        setNewTask={setNewTask}
        categories={categories}
        tasks={tasks}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSaveTask}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        categories={categories}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onChangeColor={(id, color) => setCategories(categories.map(c => c.id === id ? { ...c, color } : c))}
        onChangeLabel={(id, label) => setCategories(categories.map(c => c.id === id ? { ...c, label } : c))}
        onClose={() => setShowCategoryModal(false)}
      />

      <SaveModal
        isOpen={showSaveModal}
        saveMode={saveMode}
        saveFileName={saveFileName}
        setSaveFileName={setSaveFileName}
        onClose={() => setShowSaveModal(false)}
        onSubmit={handleConfirmSave}
      />

      <DeleteConfirmModal
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 12px; height: 12px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; border-radius: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 6px; border: 2px solid #1f2937; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #818cf8; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}