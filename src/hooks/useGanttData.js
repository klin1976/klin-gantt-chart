import { useMemo, useCallback } from 'react';
import { VIEW_MODES } from '../constants';

export default function useGanttData(tasks, viewMode) {
  const { minDate, maxDate, dateRange } = useMemo(() => {
    if (tasks.length === 0) return { minDate: new Date(), maxDate: new Date(), dateRange: [] };

    const starts = tasks.map(t => new Date(t.start).getTime());
    const ends = tasks.map(t => new Date(t.end).getTime());
    let min = new Date(Math.min(...starts));
    let max = new Date(Math.max(...ends));

    const normalize = (date, mode, isEnd = false) => {
      const d = new Date(date);
      if (mode === 'day') {
        if (!isEnd) d.setDate(d.getDate() - 2); else d.setDate(d.getDate() + 5);
      } else if (mode === 'week') {
        d.setDate(d.getDate() - d.getDay());
        if (!isEnd) d.setDate(d.getDate() - 7); else d.setDate(d.getDate() + 28);
      } else if (mode === 'month') {
        d.setDate(1);
        if (!isEnd) d.setMonth(d.getMonth() - 1); else d.setMonth(d.getMonth() + 6);
      } else if (mode === 'year') {
        d.setMonth(0, 1);
        if (!isEnd) d.setFullYear(d.getFullYear() - 1); else d.setFullYear(d.getFullYear() + 2);
      }
      return d;
    };

    min = normalize(min, viewMode);
    max = normalize(max, viewMode, true);

    const range = [];
    let curr = new Date(min);
    while (curr <= max) {
      range.push(new Date(curr));
      if (viewMode === 'day') curr.setDate(curr.getDate() + 1);
      else if (viewMode === 'week') curr.setDate(curr.getDate() + 7);
      else if (viewMode === 'month') curr.setMonth(curr.getMonth() + 1);
      else if (viewMode === 'year') curr.setFullYear(curr.getFullYear() + 1);
    }
    return { minDate: min, maxDate: max, dateRange: range };
  }, [tasks, viewMode]);

  const totalChartWidth = useMemo(() => {
    const baseWidth = dateRange.length * VIEW_MODES[viewMode].columnWidth;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth - 256 : 1000;
    const minWidth = viewportWidth * 1.5;

    if (viewMode === 'year' && dateRange.length > 0 && dateRange.length <= 5) {
      return Math.max(baseWidth, viewportWidth);
    }

    return Math.max(baseWidth, minWidth);
  }, [dateRange, viewMode]);

  const dateToPx = useCallback((dateInput) => {
    if (dateRange.length === 0) return 0;
    const date = new Date(dateInput);
    const mode = viewMode;
    const columnWidth = VIEW_MODES[mode].columnWidth;

    if (date < dateRange[0]) return 0;

    let colIndex = -1;
    for (let i = 0; i < dateRange.length; i++) {
      const d = dateRange[i];
      const next = i < dateRange.length - 1 ? dateRange[i + 1] : null;
      if (date >= d && (!next || date < next)) {
        colIndex = i;
        break;
      }
    }

    if (colIndex === -1) return dateRange.length * columnWidth;

    const dCurr = dateRange[colIndex];
    let dNext = new Date(dCurr);
    if (colIndex < dateRange.length - 1) {
      dNext = dateRange[colIndex + 1];
    } else {
      if (mode === 'day') dNext.setDate(dNext.getDate() + 1);
      else if (mode === 'week') dNext.setDate(dNext.getDate() + 7);
      else if (mode === 'month') dNext.setMonth(dNext.getMonth() + 1);
      else if (mode === 'year') dNext.setFullYear(dNext.getFullYear() + 1);
    }

    const progress = (date - dCurr) / (dNext - dCurr);
    return (colIndex + progress) * columnWidth;
  }, [dateRange, viewMode]);

  const getTaskStyle = useCallback((task) => {
    const left = dateToPx(task.start);
    const endPlusOne = new Date(task.end);
    endPlusOne.setDate(endPlusOne.getDate() + 1);
    const right = dateToPx(endPlusOne);

    return {
      left: `${left}px`,
      width: `${Math.max(right - left, 5)}px`
    };
  }, [dateToPx]);

  return {
    minDate,
    maxDate,
    dateRange,
    totalChartWidth,
    dateToPx,
    getTaskStyle
  };
}
