/**
 * @typedef {Object} Task
 * @property {string} id - 任務的唯一識別碼。
 * @property {string} start - 任務的開始日期 (ISO 格式，如 '2023-01-01')。
 * @property {string} end - 任務的結束日期 (ISO 格式，如 '2023-01-05')。
 * @property {boolean} [milestone] - 標示此任務是否為里程碑（若是，則時長視為 0）。
 * @property {Array<string>} [dependencies] - 此任務所依賴的其他任務 ID 陣列。
 */

/**
 * @typedef {Object} CPMResult
 * @property {Array<string>} criticalTaskIds - 位於要徑上的任務 ID 陣列（slack === 0 的任務）。
 * @property {Object.<string, number>} slacks - 每個任務 ID 對應的寬裕時間（slack，即延遲而不會影響專案總時長的天數）。
 * @property {boolean} [hasCycle] - 若為 true，代表任務依賴關係中存在循環依賴 (Circular Dependency)。
 */

/**
 * 計算一組任務的要徑 (Critical Path)。
 * 採用關鍵路徑法 (Critical Path Method, CPM) 與拓撲排序 (Topological Sorting) 實作。
 * 
 * Edge cases 處理：
 * 1. 若 tasks 為空陣列或 undefined，回傳空的結果物件。
 * 2. 若 tasks 中存在循環依賴，演算法會偵測到並回傳 { criticalTaskIds: [], slacks: {}, hasCycle: true }，以避免無限迴圈。
 * 3. 里程碑 (milestone) 任務的 duration 會被強制設為 0。
 * 4. 忽略自我依賴或依賴了不存在任務的情況。
 *
 * @param {Array<Task>} tasks - 欲計算的任務陣列。
 * @returns {CPMResult} 包含要徑 ID、各任務寬裕時間以及是否包含循環依賴的物件。
 */
export function calculateCriticalPath(tasks) {
  if (!tasks || tasks.length === 0) {
    return { criticalTaskIds: [], slacks: {} };
  }

  const taskMap = {};
  const adj = {}; // task id -> list of successor task ids
  const inDegree = {};

  // 1. Initialize data structures
  tasks.forEach(t => {
    const startMs = new Date(t.start).getTime();
    const endMs = new Date(t.end).getTime();
    // Calculate duration in days (min 1, or 0 if milestone)
    let duration = Math.round((endMs - startMs) / (24 * 60 * 60 * 1000)) + 1;
    if (t.milestone) {
      duration = 0;
    }
    
    taskMap[t.id] = {
      id: t.id,
      duration,
      dependencies: t.dependencies || [],
      es: 0,
      ef: 0,
      ls: 0,
      lf: 0,
      slack: 0
    };
    adj[t.id] = [];
    inDegree[t.id] = 0;
  });

  // 2. Build adjacency list and calculate in-degrees
  tasks.forEach(t => {
    const deps = t.dependencies || [];
    deps.forEach(depId => {
      // Avoid self-dependency or non-existent tasks
      if (taskMap[depId] && depId !== t.id) {
        adj[depId].push(t.id);
        inDegree[t.id]++;
      }
    });
  });

  // 3. Topological Sort (Kahn's Algorithm)
  const queue = [];
  tasks.forEach(t => {
    if (inDegree[t.id] === 0) {
      queue.push(t.id);
    }
  });

  const topoOrder = [];
  while (queue.length > 0) {
    const u = queue.shift();
    topoOrder.push(u);
    const successors = adj[u] || [];
    successors.forEach(v => {
      inDegree[v]--;
      if (inDegree[v] === 0) {
        queue.push(v);
      }
    });
  }

  // Detect circular dependency
  const hasCycle = topoOrder.length !== tasks.length;
  if (hasCycle) {
    // If cycle is detected, we cannot compute CPM. Return empty results.
    return { criticalTaskIds: [], slacks: {}, hasCycle: true };
  }

  // 4. Forward Pass (Calculate Earliest Start & Earliest Finish)
  topoOrder.forEach(uId => {
    const u = taskMap[uId];
    let maxPredEf = 0;
    u.dependencies.forEach(depId => {
      const pred = taskMap[depId];
      if (pred && pred.ef > maxPredEf) {
        maxPredEf = pred.ef;
      }
    });
    u.es = maxPredEf;
    u.ef = u.es + u.duration;
  });

  // Project duration is the maximum EF of all tasks
  let projectDuration = 0;
  tasks.forEach(t => {
    const u = taskMap[t.id];
    if (u.ef > projectDuration) {
      projectDuration = u.ef;
    }
  });

  // 5. Backward Pass (Calculate Latest Finish & Latest Start)
  for (let i = topoOrder.length - 1; i >= 0; i--) {
    const uId = topoOrder[i];
    const u = taskMap[uId];
    const successors = adj[uId] || [];

    if (successors.length === 0) {
      u.lf = projectDuration;
    } else {
      let minSuccLs = Infinity;
      successors.forEach(vId => {
        const succ = taskMap[vId];
        if (succ && succ.ls < minSuccLs) {
          minSuccLs = succ.ls;
        }
      });
      u.lf = minSuccLs;
    }
    u.ls = u.lf - u.duration;
    u.slack = u.ls - u.es;
  }

  // 6. Identify Critical Path (slack === 0)
  const criticalTaskIds = [];
  const slacks = {};
  
  tasks.forEach(t => {
    const u = taskMap[t.id];
    slacks[t.id] = u.slack;
    if (u.slack === 0) {
      criticalTaskIds.push(t.id);
    }
  });

  return { criticalTaskIds, slacks, hasCycle: false };
}
