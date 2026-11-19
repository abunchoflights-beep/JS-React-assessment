/**
 * CODING CHALLENGE 1: CORE JAVASCRIPT (Time Limit: 25 mins)
 *
 * Task 1A: Async Concurrency Pool (`runWithConcurrency`)
 *  frequently tests practical asynchronous flow control beyond simple `Promise.all`.
 * Implement `runWithConcurrency(tasks, limit)` which receives:
 *   - `tasks`: An array of functions, where each function `() => Promise<any>` starts an async task.
 *   - `limit`: Maximum number of tasks allowed to execute concurrently (integer >= 1).
 *
 * Requirements:
 *   1. Never have more than `limit` tasks in flight at the same time.
 *   2. Return a Promise that resolves to an array of results in the EXACT same order as `tasks`.
 *   3. If any task rejects, the returned Promise should reject immediately with that error.
 *   4. If `tasks` is empty, resolve immediately to `[]`.
 *
 * Task 1B: Deep Object Flatten (`flattenObject`)
 * Implement `flattenObject(obj, prefix = '')` that converts a deeply nested plain object
 * into a single-level object with dot-separated keys.
 *   - Preserve arrays and null/primitive values as leaf values (do NOT flatten arrays into index keys unless specified; keep arrays intact as values).
 *   - Empty nested plain objects `{}` should be ignored / omitted unless at root.
 *   - Example: `{ a: 1, b: { c: 2, d: { e: 3 } }, f: [4, 5] }`
 *     -> `{ 'a': 1, 'b.c': 2, 'b.d.e': 3, 'f': [4, 5] }`
 */

async function runWithConcurrency(tasks, limit) {
  // TODO: Implement your solution here
  throw new Error('Not implemented: runWithConcurrency');
}

function flattenObject(obj, prefix = '') {
  // TODO: Implement your solution here
  throw new Error('Not implemented: flattenObject');
}

module.exports = {
  runWithConcurrency,
  flattenObject,
};

