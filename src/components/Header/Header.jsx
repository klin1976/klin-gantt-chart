import React, { useRef, useState, useEffect } from 'react';
import { Calendar, Edit, Undo2, Redo2, Stamp, Settings, Download, Upload, Loader2, Image as ImageIcon, Plus, LogIn, LogOut, CloudUpload, CloudDownload } from 'lucide-react';
import { VIEW_MODES } from '../../constants';
import useGanttStore from '../../store/useGanttStore';
import { loginWithGoogle, logout, subscribeToAuthChanges, syncDataToFirestore, getDataFromFirestore } from '../../services/firebase';

export default function Header() {
  const {
    projectTitle,
    setProjectTitle,
    projectSubtitle,
    setProjectSubtitle,
    viewMode,
    setViewMode,
    watermarkConfig,
    isExporting,
    undo,
    redo,
    setModalOpen,
    loadProjectData,
    tasks,
    categories
  } = useGanttStore();

  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLoadProject = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        loadProjectData(data);
      } catch (err) {
        console.error(err);
        alert('無法解析檔案');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert('登入失敗');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      alert('登出失敗');
    }
  };

  const handleSyncToCloud = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const projectData = {
        version: 4,
        createdAt: new Date().toISOString(),
        categories,
        tasks,
        watermark: watermarkConfig,
        projectTitle,
        projectSubtitle
      };
      await syncDataToFirestore(user.uid, projectData);
      alert('成功同步至雲端');
    } catch (error) {
      alert('雲端同步失敗');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromCloud = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const data = await getDataFromFirestore(user.uid);
      if (data) {
        loadProjectData(data);
        alert('成功從雲端載入');
      } else {
        alert('雲端無存檔資料');
      }
    } catch (error) {
      alert('從雲端載入失敗');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="bg-[#1f2937] border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm z-20 gap-4">
      <input type="file" ref={fileInputRef} onChange={handleLoadProject} accept=".json" className="hidden" />
      <div className="flex-1">
        <div className="flex items-center gap-2 group">
          <Calendar className="w-9 h-9 text-indigo-500 flex-shrink-0" />
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="text-4xl font-bold text-gray-100 bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-900 rounded px-1 -ml-1 w-full transition-all hover:bg-gray-800/50"
              placeholder="專案名稱"
            />
            <Edit className="w-4 h-4 text-gray-500 absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 group/sub">
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              value={projectSubtitle}
              onChange={(e) => setProjectSubtitle(e.target.value)}
              className="text-xl text-gray-400 bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-900 rounded px-1 -ml-1 w-full transition-all hover:bg-gray-800/50 leading-relaxed py-1"
              placeholder="專案描述"
            />
            <Edit className="w-3 h-3 text-gray-500 absolute -right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/sub:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end" data-html2canvas-ignore="true">
        {user ? (
          <div className="flex gap-1 items-center mr-2">
            <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-500" title={user.email} />
            <button onClick={handleSyncToCloud} disabled={isSyncing} className="bg-[#374151] hover:bg-[#4b5563] text-gray-200 p-2 rounded-lg transition-colors shadow-sm ml-2" title="同步至雲端">
              <CloudUpload className="w-4 h-4" />
            </button>
            <button onClick={handleLoadFromCloud} disabled={isSyncing} className="bg-[#374151] hover:bg-[#4b5563] text-gray-200 p-2 rounded-lg transition-colors shadow-sm" title="從雲端載入">
              <CloudDownload className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="bg-red-900/50 hover:bg-red-800/50 text-red-200 p-2 rounded-lg transition-colors shadow-sm ml-1" title="登出">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm mr-2" title="Google 登入">
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">登入</span>
          </button>
        )}

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <div className="flex gap-1">
          <button
            onClick={undo}
            className="bg-[#374151] hover:bg-[#4b5563] text-gray-200 p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm"
            title="復原 (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            className="bg-[#374151] hover:bg-[#4b5563] text-gray-200 p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <div className="flex bg-[#374151] p-1 rounded-lg">
          {Object.entries(VIEW_MODES).map(([mode, { label }]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === mode ? 'bg-[#4f46e5] text-white shadow-sm' : 'text-gray-300 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <button
          onClick={() => setModalOpen('watermark', true)}
          className={`bg-[#374151] border hover:bg-[#4b5563] text-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm ${watermarkConfig.text ? 'border-indigo-400 bg-indigo-900/30' : 'border-transparent'}`}
          title="設定匯出浮水印"
        >
          <Stamp className={`w-4 h-4 ${watermarkConfig.text ? 'text-indigo-400' : 'text-gray-300'}`} />
          <span className="hidden sm:inline">浮水印</span>
        </button>

        <button
          onClick={() => setModalOpen('category', true)}
          className="bg-[#374151] hover:bg-[#4b5563] text-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm border border-transparent"
          title="管理類別設定"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">類別</span>
        </button>

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <button
          onClick={() => {
            useGanttStore.getState().setSaveMode('project');
            const dateStr = new Date().toISOString().slice(0, 10);
            const safeTitle = projectTitle.replace(/[\\/:*?"<>|]/g, '_').trim();
            const prefix = safeTitle || 'gantt_project';
            useGanttStore.getState().setSaveFileName(`${prefix}_${dateStr}`);
            setModalOpen('save', true);
          }}
          className="bg-[#374151] hover:bg-[#4b5563] text-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm border border-transparent"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">儲存</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#374151] hover:bg-[#4b5563] text-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm border border-transparent"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">載入</span>
        </button>

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <button
          onClick={() => {
            useGanttStore.getState().setSaveMode('image');
            const dateStr = new Date().toISOString().slice(0, 10);
            const safeTitle = projectTitle.replace(/[\\/:*?"<>|]/g, '_').trim();
            const prefix = safeTitle || '甘特圖截圖';
            useGanttStore.getState().setSaveFileName(`${prefix}_${dateStr}`);
            setModalOpen('save', true);
          }}
          disabled={isExporting}
          className={`bg-[#374151] hover:bg-[#4b5563] text-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm border border-transparent ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          <span className="hidden sm:inline">截圖</span>
        </button>

        <button
          onClick={() => {
            useGanttStore.getState().setEditingId(null);
            const defaultCat = useGanttStore.getState().categories.length > 0 ? useGanttStore.getState().categories[0].id : '';
            useGanttStore.getState().setNewTask({
              name: '',
              start: '',
              end: '',
              progress: 0,
              category: defaultCat,
              milestone: false,
              dependencies: []
            });
            setModalOpen('add', true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm border border-transparent"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">新增</span>
        </button>
      </div>
    </header>
  );
}
