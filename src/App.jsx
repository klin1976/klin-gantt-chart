import html2canvas from 'html2canvas';
import React, { useState, useMemo, useRef, useEffect } from 'react';
// 在線上預覽環境中，我們移除 import，改用下方的 useEffect 載入 CDN
// import html2canvas from 'html2canvas'; 
import { Calendar, Plus, Trash2, Save, Image as ImageIcon, Loader2, Download, Upload, AlertTriangle, Edit, X, Settings, Palette, Info, Stamp } from 'lucide-react';

// 預設類別資料
const DEFAULT_CATEGORIES = [
  { id: 'planning', label: '規劃', color: '#3b82f6' },
  { id: 'design', label: '設計', color: '#a855f7' },
  { id: 'development', label: '開發', color: '#10b981' },
  { id: 'testing', label: '測試', color: '#f59e0b' },
  { id: 'deploy', label: '部署', color: '#64748b' },
];

const INITIAL_TASKS = [
  { id: 1, name: '專案啟動與需求分析', start: '2023-11-01', end: '2023-11-05', progress: 100, category: 'planning' },
  { id: 2, name: 'UI/UX 設計原型', start: '2023-11-06', end: '2023-11-12', progress: 80, category: 'design' },
  { id: 3, name: '前端架構搭建', start: '2023-11-13', end: '2023-11-20', progress: 45, category: 'development' },
  { id: 4, name: '後端 API 開發', start: '2023-11-15', end: '2023-11-25', progress: 30, category: 'development' },
  { id: 5, name: '系統整合測試', start: '2023-11-26', end: '2023-11-30', progress: 0, category: 'testing' },
];

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

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
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkPos, setWatermarkPos] = useState('bottom-right');
  const [watermarkColor, setWatermarkColor] = useState('#94a3b8');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkFontSize, setWatermarkFontSize] = useState(24);
  const [watermarkRotate, setWatermarkRotate] = useState(-30); // 新增：旋轉角度狀態

  // Project Info state
  const [projectTitle, setProjectTitle] = useState('專案甘特圖');
  const [projectSubtitle, setProjectSubtitle] = useState('視覺化專案進度與時程規劃');

  const [newTask, setNewTask] = useState({
    name: '',
    start: '',
    end: '',
    progress: 0,
    category: 'planning'
  });

  const [newCategory, setNewCategory] = useState({ label: '', color: '#000000' });

  const chartRef = useRef(null);
  const fileInputRef = useRef(null);

  // 修正：在預覽環境中，動態載入 html2canvas
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Sync project title to document title
  useEffect(() => {
    document.title = projectTitle;
  }, [projectTitle]);

  const { minDate, maxDate, totalDays, dateRange } = useMemo(() => {
    if (tasks.length === 0) return { minDate: new Date(), maxDate: new Date(), totalDays: 0, dateRange: [] };

    const starts = tasks.map(t => new Date(t.start).getTime());
    const ends = tasks.map(t => new Date(t.end).getTime());

    let min = new Date(Math.min(...starts));
    min.setDate(min.getDate() - 2);

    let max = new Date(Math.max(...ends));
    max.setDate(max.getDate() + 5);

    const diffTime = Math.abs(max - min);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const range = [];
    for (let i = 0; i <= days; i++) {
      const d = new Date(min);
      d.setDate(d.getDate() + i);
      range.push(d);
    }

    return { minDate: min, maxDate: max, totalDays: days, dateRange: range };
  }, [tasks]);

  const getTaskStyle = (task) => {
    const startDate = new Date(task.start);
    const endDate = new Date(task.end);
    const startDiff = (startDate - minDate) / (1000 * 60 * 60 * 24);
    const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

    return {
      left: `${startDiff * 40}px`,
      width: `${duration * 40}px`
    };
  };

  // Helper: 產生浮水印樣式物件 (更新：支援旋轉)
  const getWatermarkStyle = () => {
    const baseStyle = {
      position: 'absolute',
      color: watermarkColor,
      opacity: watermarkOpacity,
      fontWeight: 'bold',
      pointerEvents: 'none',
      zIndex: 9999,
      whiteSpace: 'nowrap',
      fontFamily: 'sans-serif',
      fontSize: `${watermarkFontSize}px`,
      transformOrigin: 'center', // 確保旋轉中心正確
    };

    if (watermarkPos === 'center') {
      return {
        ...baseStyle,
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${watermarkRotate}deg)`, // 應用旋轉
        padding: '10px 40px',
      };
    }

    // 角落位置也支援旋轉
    const cornerStyle = {
      ...baseStyle,
      transform: `rotate(${watermarkRotate}deg)`
    };

    if (watermarkPos.includes('top')) cornerStyle.top = '20px';
    if (watermarkPos.includes('bottom')) cornerStyle.bottom = '20px';
    if (watermarkPos.includes('left')) cornerStyle.left = '20px';
    if (watermarkPos.includes('right')) cornerStyle.right = '20px';

    return cornerStyle;
  };

  const getCategoryInfo = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat || { label: '未分類', color: '#94a3b8' };
  };

  const handleAddCategory = () => {
    if (!newCategory.label) return;
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
    setCategories(categories.filter(c => c.id !== id));
  };

  const initiateDelete = (task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    const defaultCat = categories.length > 0 ? categories[0].id : '';
    setNewTask({ name: '', start: '', end: '', progress: 0, category: defaultCat });
    setShowAddModal(true);
  };

  const handleEditTask = (task) => {
    setEditingId(task.id);
    setNewTask({
      name: task.name,
      start: task.start,
      end: task.end,
      progress: task.progress,
      category: task.category
    });
    setShowAddModal(true);
  };

  const handleSaveTask = () => {
    if (!newTask.name || !newTask.start || !newTask.end) return;

    if (editingId) {
      setTasks(tasks.map(t => t.id === editingId ? { ...newTask, id: editingId, progress: Number(newTask.progress) } : t));
    } else {
      const id = Math.max(...tasks.map(t => t.id), 0) + 1;
      setTasks([...tasks, { ...newTask, id, progress: Number(newTask.progress) }]);
    }

    setShowAddModal(false);
    setNewTask({ name: '', start: '', end: '', progress: 0, category: categories[0]?.id || '' });
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
      version: 4, // Version bump for rotation support
      createdAt: new Date().toISOString(),
      categories: categories,
      tasks: tasks,
      watermark: {
        text: watermarkText,
        pos: watermarkPos,
        color: watermarkColor,
        opacity: watermarkOpacity,
        fontSize: watermarkFontSize,
        rotate: watermarkRotate // 儲存旋轉角度
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

        if (data.version && data.tasks) {
          setTasks(data.tasks);
          if (data.categories) setCategories(data.categories);
          if (data.watermark) {
            setWatermarkText(data.watermark.text || '');
            setWatermarkPos(data.watermark.pos || 'bottom-right');
            setWatermarkColor(data.watermark.color || '#94a3b8');
            setWatermarkOpacity(data.watermark.opacity !== undefined ? data.watermark.opacity : 0.3);
            setWatermarkFontSize(data.watermark.fontSize || 24);
            setWatermarkRotate(data.watermark.rotate !== undefined ? data.watermark.rotate : -30); // 載入旋轉角度
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
    if (!window.html2canvas || !chartRef.current) {
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

      const canvas = await window.html2canvas(chartRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#f9fafb',
        logging: false,
        onclone: (clonedDoc) => {
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

  const formatDate = (date) => `${date.getMonth() + 1}/${date.getDate()}`;
  const getDayName = (date) => ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-20 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 group">
            <Calendar className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="text-2xl font-bold text-gray-800 bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-200 rounded px-1 -ml-1 w-full transition-all hover:bg-gray-100/50"
                placeholder="專案名稱"
              />
              <Edit className="w-4 h-4 text-gray-300 absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2 group/sub">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                value={projectSubtitle}
                onChange={(e) => setProjectSubtitle(e.target.value)}
                className="text-sm text-gray-500 bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-100 rounded px-1 -ml-1 w-full transition-all hover:bg-gray-100/50"
                placeholder="專案描述"
              />
              <Edit className="w-3 h-3 text-gray-300 absolute -right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/sub:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleLoadProject} accept=".json" className="hidden" />

          <button onClick={() => setShowWatermarkModal(true)} className={`bg-white border hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm ${watermarkText ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300'}`} title="設定匯出浮水印">
            <Stamp className={`w-4 h-4 ${watermarkText ? 'text-indigo-600' : 'text-gray-500'}`} />
            <span className="hidden sm:inline">浮水印</span>
          </button>

          <button onClick={() => setShowCategoryModal(true)} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm" title="管理類別設定">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">類別</span>
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          <button onClick={() => handleOpenSaveModal('project')} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">儲存</span>
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">載入</span>
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          <button onClick={() => handleOpenSaveModal('image')} disabled={isExporting} className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            <span className="hidden sm:inline">截圖</span>
          </button>

          <button onClick={handleOpenAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">新增</span>
          </button>
        </div>
      </header>

      <div id="gantt-capture-root" ref={chartRef} className="flex-1 overflow-hidden flex flex-col relative bg-gray-50">
        <div className="flex border-b border-gray-200 bg-white">
          <div className="w-64 flex-shrink-0 border-r border-gray-200 p-4 font-semibold bg-gray-50 text-gray-700 flex items-center justify-between z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
            <span>任務名稱</span>
            <span className="text-xs font-normal text-gray-500">進度</span>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
            <div className="flex" style={{ width: `${dateRange.length * 40}px` }}>
              {dateRange.map((date, i) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <div key={i} className={`flex-shrink-0 w-[40px] border-r border-gray-100 flex flex-col items-center justify-center py-2 text-xs ${isWeekend ? 'bg-gray-50' : 'bg-white'}`}>
                    <span className={`font-medium ${isWeekend ? 'text-red-400' : 'text-gray-600'}`}>
                      {formatDate(date)}
                    </span>
                    <span className="text-gray-400 scale-75 transform">
                      {getDayName(date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex">
          <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-h-full">
            {tasks.map(task => (
              <div key={task.id} className="h-14 border-b border-gray-100 px-4 flex items-center justify-between hover:bg-gray-50 group">
                <div className="flex flex-col min-w-0 pr-2 justify-center task-text-container">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed py-0.5 block" title={task.name}>{task.name}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis leading-normal block">{task.start} ~ {task.end}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{task.progress}%</span>
                  <button onClick={() => handleEditTask(task)} className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => initiateDelete(task)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">尚無任務</div>}
          </div>

          <div className="flex-1 overflow-x-auto relative custom-scrollbar bg-white">
            <div className="relative" style={{ width: `${dateRange.length * 40}px`, height: `${Math.max(tasks.length * 56, 300)}px` }}>
              <div className="absolute inset-0 flex pointer-events-none">
                {dateRange.map((date, i) => {
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const isToday = new Date().toDateString() === date.toDateString();
                  return (
                    <div key={i} className={`flex-shrink-0 w-[40px] border-r border-gray-100 h-full ${isWeekend ? 'bg-gray-50/50' : ''} ${isToday ? 'bg-yellow-50/30' : ''}`}>
                      {isToday && <div className="w-full h-full border-l-2 border-yellow-400 opacity-20"></div>}
                    </div>
                  );
                })}
              </div>

              <div className="absolute top-0 left-0 w-full pt-[4px]">
                {tasks.map((task, index) => {
                  const style = getTaskStyle(task);
                  const categoryInfo = getCategoryInfo(task.category);

                  return (
                    <div key={task.id} className="h-14 relative flex items-center" style={{ top: `${index * 0}px` }}>
                      <div
                        className="absolute h-8 rounded-md shadow-sm border border-white/20 overflow-hidden cursor-pointer hover:brightness-110 transition-all group"
                        style={{
                          left: style.left,
                          width: style.width,
                          backgroundColor: categoryInfo.color
                        }}
                        title={`${task.name}: ${task.start} 至 ${task.end}`}
                      >
                        <div className="h-full bg-white/30" style={{ width: `${task.progress}%` }} />
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-[10px] text-white font-medium whitespace-nowrap drop-shadow-md truncate w-full bar-text-content">
                            {task.name} ({task.progress}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {watermarkText.trim() && (
          <div style={getWatermarkStyle()}>
            {watermarkText}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-3 flex gap-6 text-sm overflow-x-auto">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 flex-shrink-0">
            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></span>
            <span className="text-gray-600">{cat.label}</span>
          </div>
        ))}
      </div>

      {showWatermarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-[90%]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Stamp className="w-5 h-5 text-indigo-600" /> 浮水印設定</h2>
              <button onClick={() => setShowWatermarkModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">浮水印文字</label>
                <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="例如：機密文件..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">顏色</label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1.5 bg-white">
                    <input type="color" value={watermarkColor} onChange={e => setWatermarkColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <span className="text-xs text-gray-500">{watermarkColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">透明度 ({Math.round(watermarkOpacity * 100)}%)</label>
                  <div className="flex items-center h-[46px]">
                    <input type="range" min="0.1" max="1" step="0.1" value={watermarkOpacity} onChange={e => setWatermarkOpacity(parseFloat(e.target.value))} className="w-full cursor-pointer accent-indigo-600" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">字體大小 ({watermarkFontSize}px)</label>
                <div className="flex items-center h-[46px]">
                  <input type="range" min="12" max="128" step="2" value={watermarkFontSize} onChange={e => setWatermarkFontSize(parseInt(e.target.value))} className="w-full cursor-pointer accent-indigo-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">旋轉角度 ({watermarkRotate}°)</label>
                <div className="flex items-center h-[46px]">
                  <input type="range" min="-180" max="180" step="5" value={watermarkRotate} onChange={e => setWatermarkRotate(parseInt(e.target.value))} className="w-full cursor-pointer accent-indigo-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">顯示位置</label>
                <div className="grid grid-cols-3 gap-2 h-24 bg-gray-100 rounded-lg p-2">
                  <button onClick={() => setWatermarkPos('top-left')} className={`rounded border transition-colors ${watermarkPos === 'top-left' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>↖</button>
                  <div></div>
                  <button onClick={() => setWatermarkPos('top-right')} className={`rounded border transition-colors ${watermarkPos === 'top-right' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>↗</button>
                  <div></div>
                  <button onClick={() => setWatermarkPos('center')} className={`rounded border transition-colors ${watermarkPos === 'center' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>•</button>
                  <div></div>
                  <button onClick={() => setWatermarkPos('bottom-left')} className={`rounded border transition-colors ${watermarkPos === 'bottom-left' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>↙</button>
                  <div></div>
                  <button onClick={() => setWatermarkPos('bottom-right')} className={`rounded border transition-colors ${watermarkPos === 'bottom-right' ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>↘</button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowWatermarkModal(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">完成設定</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (Standard) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{editingId ? '編輯任務' : '新增任務'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任務名稱</label>
                <input type="text" value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label><input type="date" value={newTask.start} onChange={e => setNewTask({ ...newTask, start: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label><input type="date" value={newTask.end} onChange={e => setNewTask({ ...newTask, end: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">類別</label>
                  <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">進度 (%)</label><input type="number" min="0" max="100" value={newTask.progress} onChange={e => setNewTask({ ...newTask, progress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSaveTask} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"><Save className="w-4 h-4" />儲存</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal (Standard) */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[400px] max-w-[90%]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Palette className="w-5 h-5" /> 類別管理</h2>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <input type="color" value={cat.color} onChange={(e) => {
                    setCategories(categories.map(c => c.id === cat.id ? { ...c, color: e.target.value } : c));
                  }} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={cat.label} onChange={(e) => {
                    setCategories(categories.map(c => c.id === cat.id ? { ...c, label: e.target.value } : c));
                  }} className="flex-1 bg-transparent border-b border-transparent focus:border-indigo-300 outline-none px-1" />
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">新增類別</h3>
              <div className="flex gap-2">
                <input type="color" value={newCategory.color} onChange={e => setNewCategory({ ...newCategory, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200 p-1" />
                <input type="text" placeholder="類別名稱 (如: 行銷)" value={newCategory.label} onChange={e => setNewCategory({ ...newCategory, label: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                <button onClick={handleAddCategory} disabled={!newCategory.label} className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal (Standard) */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-[90%]">
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
                  <input type="text" value={saveFileName} onChange={e => setSaveFileName(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="輸入檔名..." autoFocus />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500 text-sm">
                    {saveMode === 'project' ? '.json' : '.png'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleConfirmSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"><Download className="w-4 h-4" />確認儲存</button>
            </div>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 max-w-[90%] text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">確認刪除</h3>
            <p className="text-sm text-gray-500 mb-6">您確定要刪除「<span className="font-medium text-gray-700">{taskToDelete.name}</span>」嗎？</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setTaskToDelete(null)} className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm">刪除</button>
            </div>
          </div>
        </div>
      )}
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }`}</style>
    </div>
  );
}