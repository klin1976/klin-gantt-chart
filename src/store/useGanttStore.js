import { create } from './zustand';

// constants
import { DEFAULT_CATEGORIES, INITIAL_TASKS } from '../constants';

const getInitialState = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(`klin_gantt_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error('Failed to parse saved state for key:', key, e);
    return defaultValue;
  }
};

const useGanttStore = create((set, get) => ({
  // --- Data State ---
  tasks: getInitialState('tasks', INITIAL_TASKS),
  categories: getInitialState('categories', DEFAULT_CATEGORIES),
  projectTitle: getInitialState('project_title', '專案甘特圖'),
  projectSubtitle: getInitialState('project_subtitle', '視覺化專案進度與時程規劃'),

  viewMode: 'day', // 'day', 'week', 'month'

  // --- Watermark State ---
  watermarkConfig: {
    text: getInitialState('watermark_text', ''),
    pos: getInitialState('watermark_pos', 'bottom-right'),
    color: getInitialState('watermark_color', '#94a3b8'),
    opacity: getInitialState('watermark_opacity', 0.3),
    fontSize: getInitialState('watermark_font_size', 24),
    rotate: getInitialState('watermark_rotate', -30),
  },

  // --- UI State ---
  modals: {
    add: false,
    save: false,
    category: false,
    watermark: false,
  },
  taskToDelete: null,
  editingId: null,
  isExporting: false,
  saveFileName: '',
  saveMode: 'project',
  draggedIndex: null,
  dragOverIndex: null,
  dragPosition: null,

  // --- Forms State ---
  newTask: {
    name: '',
    start: '',
    end: '',
    progress: 0,
    category: '',
    milestone: false,
    dependencies: []
  },
  newCategory: { label: '', color: '#000000' },

  // --- Undo/Redo State ---
  past: [],
  future: [],

  // --- Actions ---

  getSnapshot: () => {
    const state = get();
    return {
      tasks: state.tasks,
      categories: state.categories,
      projectTitle: state.projectTitle,
      projectSubtitle: state.projectSubtitle,
      watermark: state.watermarkConfig
    };
  },

  pushHistory: () => {
    const state = get();
    const current = state.getSnapshot();
    set({
      past: [...state.past, JSON.parse(JSON.stringify(current))],
      future: []
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;
    
    const current = state.getSnapshot();
    const previous = state.past[state.past.length - 1];
    
    set({
      past: state.past.slice(0, -1),
      future: [...state.future, JSON.parse(JSON.stringify(current))],
      tasks: previous.tasks,
      categories: previous.categories,
      projectTitle: previous.projectTitle,
      projectSubtitle: previous.projectSubtitle,
      watermarkConfig: previous.watermark || state.watermarkConfig
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const current = state.getSnapshot();
    const nextState = state.future[state.future.length - 1];
    
    set({
      past: [...state.past, JSON.parse(JSON.stringify(current))],
      future: state.future.slice(0, -1),
      tasks: nextState.tasks,
      categories: nextState.categories,
      projectTitle: nextState.projectTitle,
      projectSubtitle: nextState.projectSubtitle,
      watermarkConfig: nextState.watermark || state.watermarkConfig
    });
  },

  // State Setters
  setTasks: (tasks) => set({ tasks }),
  setCategories: (categories) => set({ categories }),
  setProjectTitle: (projectTitle) => set({ projectTitle }),
  setProjectSubtitle: (projectSubtitle) => set({ projectSubtitle }),
  setViewMode: (viewMode) => set({ viewMode }),
  
  setWatermarkConfig: (config) => set((state) => ({ watermarkConfig: { ...state.watermarkConfig, ...config } })),

  setModalOpen: (modalName, isOpen) => set((state) => ({
    modals: { ...state.modals, [modalName]: isOpen }
  })),

  setTaskToDelete: (taskToDelete) => set({ taskToDelete }),
  setEditingId: (editingId) => set({ editingId }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setSaveFileName: (saveFileName) => set({ saveFileName }),
  setSaveMode: (saveMode) => set({ saveMode }),
  setDraggedIndex: (draggedIndex) => set({ draggedIndex }),

  setNewTask: (update) => set((state) => ({ 
    newTask: typeof update === 'function' ? update(state.newTask) : { ...state.newTask, ...update } 
  })),
  setNewCategory: (update) => set((state) => ({ 
    newCategory: typeof update === 'function' ? update(state.newCategory) : { ...state.newCategory, ...update } 
  })),

  // Complex Actions
  handleAddCategory: () => {
    const state = get();
    if (!state.newCategory.label) return;
    state.pushHistory();
    const id = `cat_${Date.now()}`;
    set({
      categories: [...state.categories, { id, ...state.newCategory }],
      newCategory: { label: '', color: '#000000' }
    });
  },

  handleDeleteCategory: (id) => {
    const state = get();
    if (state.categories.length <= 1) {
      alert("至少需要保留一個類別");
      return;
    }
    const isInUse = state.tasks.some(t => t.category === id);
    if (isInUse) {
      if (!window.confirm("有任務正在使用此類別，刪除後這些任務將變為「未分類」或顯示異常。確定刪除？")) {
        return;
      }
    }
    state.pushHistory();
    set({ categories: state.categories.filter(c => c.id !== id) });
  },

  confirmDeleteTask: () => {
    const state = get();
    if (state.taskToDelete) {
      state.pushHistory();
      set({
        tasks: state.tasks.filter(t => t.id !== state.taskToDelete.id),
        taskToDelete: null
      });
    }
  },

  handleSaveTask: () => {
    const state = get();
    const { newTask, editingId, tasks, categories } = state;
    if (!newTask.name || !newTask.start) return;

    state.pushHistory();
    const finalTask = {
      ...newTask,
      progress: newTask.milestone ? 100 : Number(newTask.progress),
      end: newTask.milestone ? newTask.start : (newTask.end || newTask.start),
      dependencies: newTask.dependencies || []
    };

    let newTasks;
    if (editingId) {
      newTasks = tasks.map(t => t.id === editingId ? { ...finalTask, id: editingId } : t);
    } else {
      const id = Math.max(...tasks.map(t => (typeof t.id === 'number' ? t.id : 0)), 0) + 1;
      newTasks = [...tasks, { ...finalTask, id }];
    }

    set({
      tasks: newTasks,
      modals: { ...state.modals, add: false },
      newTask: {
        name: '',
        start: '',
        end: '',
        progress: 0,
        category: categories[0]?.id || '',
        milestone: false,
        dependencies: []
      },
      editingId: null
    });
  },

  handleDragStart: (index) => {
    set({ draggedIndex: index, dragOverIndex: null, dragPosition: null });
  },

  handleDragOver: (index, clientY, targetRect) => {
    const state = get();
    if (state.draggedIndex === null || state.draggedIndex === index) {
      if (state.dragOverIndex !== null) {
        set({ dragOverIndex: null, dragPosition: null });
      }
      return;
    }
    
    const threshold = targetRect.top + targetRect.height / 2;
    const position = clientY < threshold ? 'top' : 'bottom';
    
    if (state.dragOverIndex !== index || state.dragPosition !== position) {
      set({ dragOverIndex: index, dragPosition: position });
    }
  },

  handleDrop: () => {
    const state = get();
    if (state.draggedIndex === null || state.dragOverIndex === null) {
      set({ draggedIndex: null, dragOverIndex: null, dragPosition: null });
      return;
    }
    
    get().pushHistory();
    const newTasks = [...state.tasks];
    const [removed] = newTasks.splice(state.draggedIndex, 1);
    
    let insertIndex = state.dragOverIndex;
    if (state.draggedIndex < state.dragOverIndex) {
      if (state.dragPosition === 'top') insertIndex--;
    } else {
      if (state.dragPosition === 'bottom') insertIndex++;
    }
    
    newTasks.splice(insertIndex, 0, removed);
    
    set({ 
      tasks: newTasks, 
      draggedIndex: null, 
      dragOverIndex: null, 
      dragPosition: null 
    });
  },

  handleDragEnd: () => set({ draggedIndex: null, dragOverIndex: null, dragPosition: null }),

  loadProjectData: (data) => {
    const state = get();
    state.pushHistory();
    if (data.version && data.tasks) {
      set({
        tasks: data.tasks,
        ...(data.categories && { categories: data.categories }),
        ...(data.projectTitle && { projectTitle: data.projectTitle }),
        ...(data.projectSubtitle && { projectSubtitle: data.projectSubtitle }),
        ...(data.watermark && {
          watermarkConfig: {
            text: data.watermark.text || '',
            pos: data.watermark.pos || 'bottom-right',
            color: data.watermark.color || '#94a3b8',
            opacity: data.watermark.opacity !== undefined ? data.watermark.opacity : 0.3,
            fontSize: data.watermark.fontSize || 24,
            rotate: data.watermark.rotate !== undefined ? data.watermark.rotate : -30,
          }
        })
      });
    } else if (Array.isArray(data)) {
      set({
        tasks: data,
        categories: DEFAULT_CATEGORIES
      });
      alert('提示：您載入的是舊版專案檔，已自動套用預設類別。');
    } else {
      alert('檔案格式錯誤');
    }
  }

}));

// Auto save to localStorage listener
useGanttStore.subscribe((state, prevState) => {
  if (
    state.tasks !== prevState.tasks ||
    state.categories !== prevState.categories ||
    state.projectTitle !== prevState.projectTitle ||
    state.projectSubtitle !== prevState.projectSubtitle ||
    state.watermarkConfig !== prevState.watermarkConfig
  ) {
    try {
      localStorage.setItem('klin_gantt_tasks', JSON.stringify(state.tasks));
      localStorage.setItem('klin_gantt_categories', JSON.stringify(state.categories));
      localStorage.setItem('klin_gantt_project_title', JSON.stringify(state.projectTitle));
      localStorage.setItem('klin_gantt_project_subtitle', JSON.stringify(state.projectSubtitle));
      localStorage.setItem('klin_gantt_watermark_text', JSON.stringify(state.watermarkConfig.text));
      localStorage.setItem('klin_gantt_watermark_pos', JSON.stringify(state.watermarkConfig.pos));
      localStorage.setItem('klin_gantt_watermark_color', JSON.stringify(state.watermarkConfig.color));
      localStorage.setItem('klin_gantt_watermark_opacity', JSON.stringify(state.watermarkConfig.opacity));
      localStorage.setItem('klin_gantt_watermark_font_size', JSON.stringify(state.watermarkConfig.fontSize));
      localStorage.setItem('klin_gantt_watermark_rotate', JSON.stringify(state.watermarkConfig.rotate));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }
});

export default useGanttStore;
