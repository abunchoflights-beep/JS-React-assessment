/**
 * CODING CHALLENGE 2: REACT STATE, STALE CLOSURES & RACE CONDITIONS (Time Limit: 25 mins)
 *
 * In React coding assessments, you are often tested on:
 *   1. Race conditions & cleanup in `useEffect` when a search query changes rapidly.
 *   2. Preventing unnecessary re-computations & optimizing derived state (search/filter/sort).
 *
 * Task 2A: Race-Condition-Safe Async Search Controller (`createSearchController`)
 * Simulate the core logic of a `useDebouncedSearch(fetchFn, delayMs)` custom hook.
 * Given an async `fetchFn(query)` and `delayMs`:
 *   - Calling `controller.search(query)` debounces calls by `delayMs`.
 *   - If `controller.search(newQuery)` is called again before `delayMs` elapses, cancel the previous timer.
 *   - CRITICAL (Stale Response Trap): If Request #1 ("rea") is slow (takes 300ms) and Request #2 ("react")
 *     is fast (takes 50ms), Request #1's resolution MUST BE IGNORED so it never overwrites Request #2's state!
 *   - Calling `controller.cleanup()` (like a `useEffect` cleanup function) cancels any pending timer
 *     and ignores any in-flight responses.
 *   - `controller.getState()` returns `{ query, data, loading, error }`.
 *
 * Task 2B: Immutable State Reducer for Todo/Task Board (`taskBoardReducer`)
 * Implement a pure React reducer `taskBoardReducer(state, action)` supporting:
 *   - `{ type: 'ADD_TASK', payload: { id, title, column } }`
 *   - `{ type: 'MOVE_TASK', payload: { id, targetColumn } }`
 *   - `{ type: 'TOGGLE_DONE', payload: { id } }`
 *   Must NEVER mutate the incoming `state` or task objects in place (React referential equality check!).
 */

function createSearchController(fetchFn, delayMs = 200) {
  // TODO: Implement your solution here
  throw new Error('Not implemented: createSearchController');
}

function taskBoardReducer(state, action) {
  // TODO: Implement your solution here
  throw new Error('Not implemented: taskBoardReducer');
}

module.exports = {
  createSearchController,
  taskBoardReducer,
};

