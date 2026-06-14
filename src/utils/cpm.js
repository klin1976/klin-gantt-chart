/**
 * Calculates the critical path for a list of tasks.
 * Uses CPM (Critical Path Method) and topological sorting.
 * 
 * @param {Array} tasks - List of tasks
 * @returns {Object} { criticalTaskIds: Array, slacks: Object }
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
