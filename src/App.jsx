import html2canvas from 'html2canvas';
import React, { useEffect, useRef } from 'react';

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

// store
import useGanttStore from './store/useGanttStore';

export default function App() {
  const {
    projectTitle,
    projectSubtitle,
    tasks,
    categories,
    watermarkConfig,
    saveMode,
    saveFileName,
    undo,
    redo,
    setIsExporting,
    setModalOpen,
  } = useGanttStore();

  const chartRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    document.title = projectTitle;
  }, [projectTitle]);

  const handleConfirmSave = () => {
    if (saveMode === 'project') {
      executeSaveProject();
    } else {
      executeExportImage();
    }
  };

  const executeSaveProject = async () => {
    setModalOpen('save', false);
    const finalFileName = `${saveFileName}.json`;

    const projectData = {
      version: 4,
      createdAt: new Date().toISOString(),
      categories: categories,
      tasks: tasks,
      watermark: watermarkConfig,
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

  const executeExportImage = async () => {
    if (!html2canvas || !chartRef.current) {
      alert("組件尚未加載完成");
      return;
    }

    setModalOpen('save', false);

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

  return (
    <div className="flex flex-col h-screen bg-[#111827] text-gray-100 font-sans" ref={chartRef}>
      <Header />
      <GanttChart />
      <Legend />
      <WatermarkModal />
      <TaskModal />
      <CategoryModal />
      <SaveModal onSubmit={handleConfirmSave} />
      <DeleteConfirmModal />
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