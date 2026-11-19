/**
 * REFERENCE SOLUTIONS FOR CODING CHALLENGES (JS, React, Node.js)
 * Run `npm run test:solutions` to verify all reference solutions pass the test suite.
 */

// ============================================================================
// CHALLENGE 1: CORE JAVASCRIPT
// ============================================================================

async function runWithConcurrency(tasks, limit) {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];
  const concurrency = Math.max(1, Math.min(limit, tasks.length));
  const results = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

function flattenObject(obj, prefix = '') {
  const result = {};
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !(value instanceof RegExp)
    ) {
      const nested = flattenObject(value, fullKey);
      Object.assign(result, nested);
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

// ============================================================================
// CHALLENGE 2: REACT STATE, STALE CLOSURES & RACE CONDITIONS
// ============================================================================

function createSearchController(fetchFn, delayMs = 200) {
  let state = {
    query: '',
    data: null,
    loading: false,
    error: null,
  };
  let timerId = null;
  let activeRequestId = 0;
  let isDisposed = false;

  function search(query) {
    if (isDisposed) return;
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }

    // Increment request ID to invalidate any earlier in-flight requests
    const requestId = ++activeRequestId;
    state = { ...state, query, loading: true, error: null };

    timerId = setTimeout(async () => {
      timerId = null;
      if (isDisposed || requestId !== activeRequestId) return;
      try {
        const result = await fetchFn(query);
        // Only commit state if this is still the latest request and not cleaned up
        if (!isDisposed && requestId === activeRequestId) {
          state = { ...state, data: result, loading: false, error: null };
        }
      } catch (err) {
        if (!isDisposed && requestId === activeRequestId) {
          state = {
            ...state,
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      }
    }, delayMs);
  }

  function cleanup() {
    isDisposed = true;
    activeRequestId++;
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function getState() {
    return { ...state };
  }

  return { search, cleanup, getState };
}

function taskBoardReducer(state, action) {
  if (!action || typeof action.type !== 'string') return state;

  switch (action.type) {
    case 'ADD_TASK': {
      const { id, title, column } = action.payload;
      return {
        ...state,
        tasks: [
          ...state.tasks,
          { id, title, column, done: false },
        ],
      };
    }
    case 'MOVE_TASK': {
      const { id, targetColumn } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, column: targetColumn } : task
        ),
      };
    }
    case 'TOGGLE_DONE': {
      const { id } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, done: !task.done } : task
        ),
      };
    }
    default:
      return state;
  }
}

// ============================================================================
// CHALLENGE 3: NODE.JS STREAMS & EXPRESS MIDDLEWARE
// ============================================================================

function createRateLimiter({
  windowMs = 60000,
  maxRequests = 5,
  nowFn = () => Date.now(),
} = {}) {
  const ipTimestamps = new Map();

  return function rateLimiterMiddleware(req, res, next) {
    const ip = req.ip || '127.0.0.1';
    const now = nowFn();
    const windowStart = now - windowMs;

    const history = ipTimestamps.get(ip) || [];
    const validTimestamps = history.filter((ts) => ts > windowStart);

    res.setHeader('X-RateLimit-Limit', String(maxRequests));

    if (validTimestamps.length >= maxRequests) {
      ipTimestamps.set(ip, validTimestamps);
      res.setHeader('X-RateLimit-Remaining', '0');
      return res.status(429).json({ error: 'Too Many Requests' });
    }

    validTimestamps.push(now);
    ipTimestamps.set(ip, validTimestamps);
    const remaining = Math.max(0, maxRequests - validTimestamps.length);
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    return next();
  };
}

async function aggregateLogStream(readableStream) {
  let totalValidLines = 0;
  let malformedLines = 0;
  let totalLatency = 0;
  const byLevel = {};
  let remainder = '';

  function processLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && typeof parsed.level === 'string') {
        totalValidLines++;
        byLevel[parsed.level] = (byLevel[parsed.level] || 0) + 1;
        if (typeof parsed.latencyMs === 'number' && !Number.isNaN(parsed.latencyMs)) {
          totalLatency += parsed.latencyMs;
        }
      } else {
        malformedLines++;
      }
    } catch {
      malformedLines++;
    }
  }

  for await (const chunk of readableStream) {
    remainder += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    const lines = remainder.split('\n');
    remainder = lines.pop() ?? '';
    for (const line of lines) {
      processLine(line);
    }
  }

  if (remainder.trim()) {
    processLine(remainder);
  }

  const avgLatencyMs =
    totalValidLines > 0 ? Number((totalLatency / totalValidLines).toFixed(2)) : 0;

  return {
    totalValidLines,
    malformedLines,
    byLevel,
    avgLatencyMs,
  };
}

module.exports = {
  runWithConcurrency,
  flattenObject,
  createSearchController,
  taskBoardReducer,
  createRateLimiter,
  aggregateLogStream,
};

