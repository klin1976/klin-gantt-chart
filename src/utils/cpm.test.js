import { describe, it, expect } from 'vitest';
import { calculateCriticalPath } from './cpm';

describe('calculateCriticalPath', () => {
  it('should return empty result for empty tasks', () => {
    const result = calculateCriticalPath([]);
    expect(result).toEqual({ criticalTaskIds: [], slacks: {} });
  });

  it('should return empty result for undefined tasks', () => {
    const result = calculateCriticalPath();
    expect(result).toEqual({ criticalTaskIds: [], slacks: {} });
  });

  it('should correctly calculate critical path for sequential tasks', () => {
    const tasks = [
      { id: '1', start: '2023-01-01', end: '2023-01-02', dependencies: [] },
      { id: '2', start: '2023-01-03', end: '2023-01-04', dependencies: ['1'] },
    ];
    const result = calculateCriticalPath(tasks);
    expect(result.criticalTaskIds).toContain('1');
    expect(result.criticalTaskIds).toContain('2');
    expect(result.slacks['1']).toBe(0);
    expect(result.slacks['2']).toBe(0);
    expect(result.hasCycle).toBe(false);
  });

  it('should detect cycle in dependencies', () => {
    const tasks = [
      { id: '1', start: '2023-01-01', end: '2023-01-02', dependencies: ['2'] },
      { id: '2', start: '2023-01-03', end: '2023-01-04', dependencies: ['1'] },
    ];
    const result = calculateCriticalPath(tasks);
    expect(result.hasCycle).toBe(true);
  });

  it('should handle milestones correctly (duration 0)', () => {
    const tasks = [
      { id: '1', start: '2023-01-01', end: '2023-01-02', dependencies: [] },
      { id: '2', start: '2023-01-03', end: '2023-01-03', dependencies: ['1'], milestone: true },
    ];
    const result = calculateCriticalPath(tasks);
    expect(result.criticalTaskIds).toContain('1');
    expect(result.criticalTaskIds).toContain('2');
    expect(result.hasCycle).toBe(false);
  });

  it('should correctly calculate slack for parallel tasks', () => {
    const tasks = [
      { id: '1', start: '2023-01-01', end: '2023-01-02', dependencies: [] }, // duration 2
      { id: '2', start: '2023-01-01', end: '2023-01-01', dependencies: [] }, // duration 1
      { id: '3', start: '2023-01-03', end: '2023-01-03', dependencies: ['1', '2'] }, // duration 1
    ];
    const result = calculateCriticalPath(tasks);
    expect(result.criticalTaskIds).toContain('1');
    expect(result.criticalTaskIds).toContain('3');
    expect(result.criticalTaskIds).not.toContain('2');
    expect(result.slacks['1']).toBe(0);
    expect(result.slacks['2']).toBe(1);
    expect(result.slacks['3']).toBe(0);
  });
});
