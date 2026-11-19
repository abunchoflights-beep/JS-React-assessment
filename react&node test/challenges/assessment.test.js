const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('node:stream');

const useSolutions = process.env.TEST_SOLUTIONS === 'true';

const jsChallenge = useSolutions
  ? require('./solutions.js')
  : require('./1-javascript-async-and-data.js');
const reactChallenge = useSolutions
  ? require('./solutions.js')
  : require('./2-react-hooks-and-state.js');
const nodeChallenge = useSolutions
  ? require('./solutions.js')
  : require('./3-node-streams-and-middleware.js');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('BairesDev Coding Challenge 1: Core JavaScript', () => {
  it('1A: runWithConcurrency respects concurrency limit and preserves order', async () => {
    let inFlight = 0;
    let maxInFlight = 0;

    const durations = [60, 10, 40, 20, 30];
    const tasks = durations.map((ms, idx) => async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await delay(ms);
      inFlight--;
      return `result-${idx}`;
    });

    const results = await jsChallenge.runWithConcurrency(tasks, 2);
    assert.equal(maxInFlight, 2, 'Should never exceed concurrency limit of 2');
    assert.deepEqual(results, [
      'result-0',
      'result-1',
      'result-2',
      'result-3',
      'result-4',
    ]);
  });

  it('1B: flattenObject flattens nested objects while preserving arrays and primitives', () => {
    const input = {
      user: {
        name: 'Elena',
        address: {
          city: 'Buenos Aires',
          zip: 1001,
        },
        roles: ['admin', 'editor'],
        emptyObj: {},
      },
      active: true,
      meta: null,
    };

    const output = jsChallenge.flattenObject(input);
    assert.deepEqual(output, {
      'user.name': 'Elena',
      'user.address.city': 'Buenos Aires',
      'user.address.zip': 1001,
      'user.roles': ['admin', 'editor'],
      active: true,
      meta: null,
    });
  });
});

describe('BairesDev Coding Challenge 2: React Hooks & State', () => {
  it('2A: createSearchController debounces requests and ignores out-of-order stale responses', async () => {
    // Request for "rea" takes 120ms, while subsequent request for "react" takes 20ms
    const mockFetch = async (query) => {
      if (query === 'rea') {
        await delay(120);
        return ['stale-rea-result'];
      }
      if (query === 'react') {
        await delay(20);
        return ['fresh-react-result'];
      }
      return [];
    };

    const controller = reactChallenge.createSearchController(mockFetch, 30);

    // Trigger first search ("rea") and let debounce fire
    controller.search('rea');
    await delay(40); // "rea" request is now in flight (120ms)

    // Trigger second search ("react") while "rea" is still in flight
    controller.search('react');
    await delay(160); // Wait for both "react" and the slower "rea" to finish

    const finalState = controller.getState();
    assert.equal(finalState.query, 'react');
    assert.equal(finalState.loading, false);
    assert.deepEqual(
      finalState.data,
      ['fresh-react-result'],
      'Stale slow response for "rea" must not overwrite newer "react" result'
    );
    controller.cleanup();
  });

  it('2B: taskBoardReducer performs immutable updates without mutating previous state', () => {
    const initialState = Object.freeze({
      tasks: Object.freeze([
        Object.freeze({ id: 't1', title: 'Write unit tests', column: 'todo', done: false }),
      ]),
    });

    const stateAfterAdd = reactChallenge.taskBoardReducer(initialState, {
      type: 'ADD_TASK',
      payload: { id: 't2', title: 'Deploy service', column: 'todo' },
    });
    assert.equal(stateAfterAdd.tasks.length, 2);
    assert.notEqual(stateAfterAdd.tasks, initialState.tasks);

    const stateAfterMove = reactChallenge.taskBoardReducer(stateAfterAdd, {
      type: 'MOVE_TASK',
      payload: { id: 't1', targetColumn: 'in-progress' },
    });
    assert.equal(stateAfterMove.tasks[0].column, 'in-progress');
    assert.equal(initialState.tasks[0].column, 'todo');

    const stateAfterToggle = reactChallenge.taskBoardReducer(stateAfterMove, {
      type: 'TOGGLE_DONE',
      payload: { id: 't1' },
    });
    assert.equal(stateAfterToggle.tasks[0].done, true);
  });
});

describe('BairesDev Coding Challenge 3: Node.js Streams & Express Middleware', () => {
  it('3A: createRateLimiter enforces rolling window per IP and sets X-RateLimit headers', () => {
    let currentTime = 1000;
    const limiter = nodeChallenge.createRateLimiter({
      windowMs: 1000,
      maxRequests: 2,
      nowFn: () => currentTime,
    });

    const callMiddleware = (ip) => {
      const headers = {};
      let statusCode = 200;
      let jsonBody = null;
      let nextCalled = false;

      const req = { ip };
      const res = {
        setHeader(k, v) {
          headers[k] = v;
        },
        status(code) {
          statusCode = code;
          return this;
        },
        json(payload) {
          jsonBody = payload;
          return this;
        },
      };
      const next = () => {
        nextCalled = true;
      };

      limiter(req, res, next);
      return { headers, statusCode, jsonBody, nextCalled };
    };

    // Request 1 at t=1000ms -> allowed (remaining: 1)
    const r1 = callMiddleware('10.0.0.1');
    assert.equal(r1.nextCalled, true);
    assert.equal(r1.headers['X-RateLimit-Remaining'], '1');

    // Request 2 at t=1400ms -> allowed (remaining: 0)
    currentTime = 1400;
    const r2 = callMiddleware('10.0.0.1');
    assert.equal(r2.nextCalled, true);
    assert.equal(r2.headers['X-RateLimit-Remaining'], '0');

    // Request 3 at t=1800ms -> blocked with 429
    currentTime = 1800;
    const r3 = callMiddleware('10.0.0.1');
    assert.equal(r3.nextCalled, false);
    assert.equal(r3.statusCode, 429);
    assert.deepEqual(r3.jsonBody, { error: 'Too Many Requests' });

    // Request 4 at t=2100ms (Request 1 at t=1000ms has expired from the 1000ms window!) -> allowed
    currentTime = 2100;
    const r4 = callMiddleware('10.0.0.1');
    assert.equal(r4.nextCalled, true);
    assert.equal(r4.headers['X-RateLimit-Remaining'], '0');
  });

  it('3B: aggregateLogStream parses chunked NDJSON streams and computes metrics', async () => {
    // Intentionally split JSON lines across chunk boundaries
    const chunks = [
      '{"level":"info","service":"api","latencyMs":40}\n{"level":"err',
      'or","service":"db","latencyMs":110}\nINVALID_JSON_LINE\n{"level":"info","service":"api","latencyMs":60}',
    ];
    const stream = Readable.from(chunks);
    const summary = await nodeChallenge.aggregateLogStream(stream);

    assert.deepEqual(summary, {
      totalValidLines: 3,
      malformedLines: 1,
      byLevel: { info: 2, error: 1 },
      avgLatencyMs: 70,
    });
  });
});

