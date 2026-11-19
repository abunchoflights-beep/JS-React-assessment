# Online Skills Assessment: JavaScript, React & Node.js

This practice suite mirrors the exact structure, pacing, question styles, and edge-case traps used in **automated technical assessments**:
- **Part 1: Core JavaScript & ES6+ (15 Questions)** — Event Loop (microtask vs. macrotask ordering), closures & lexical scope, `this` binding, shallow vs. deep immutability, `Promise` combinators, TDZ/hoisting, `return await` inside `try/catch`, `WeakMap`, and generators.
- **Part 2: React 18 & Hooks (15 Questions)** — State batching & closure snapshots, stale closures in `useEffect`, Fiber linked-list Hook rules, `React.memo` & referential equality traps, list `key` reconciliation bugs, `useEffect` cleanup order, Context re-renders, Error Boundaries, `useLayoutEffect`, and `useTransition`.
- **Part 3: Node.js & Express (15 Questions)** — `process.nextTick` vs. `setImmediate` inside I/O callbacks, CommonJS `exports` vs. `module.exports`, Express 4-argument error middleware `(err, req, res, next)`, `ERR_HTTP_HEADERS_SENT`, Streams & backpressure (`highWaterMark` / `'drain'`), `libuv` thread pool vs. kernel async I/O, `Buffer.alloc` vs. `Buffer.allocUnsafe`, `worker_threads` vs. `cluster`, and graceful shutdown.
- **Part 4: Timed Practical Coding Challenges (3 Modules / 6 Tasks)** — Executable via `npm test` (`node --test`).

---

## How to Use This Suite

1. **Interactive Timed Web Simulator**: Open [index.html](file:///c:/Users/davie/Documents/dev2026/react&node%20test/index.html) in your browser for a timed 60-minute assessment simulator with question flagging, section filtering, instant study-mode explanations, and an in-browser code runner.
2. **Hands-On IDE Coding Challenges**:
   - Edit [1-javascript-async-and-data.js](file:///c:/Users/davie/Documents/dev2026/react&node%20test/challenges/1-javascript-async-and-data.js), [2-react-hooks-and-state.js](file:///c:/Users/davie/Documents/dev2026/react&node%20test/challenges/2-react-hooks-and-state.js), and [3-node-streams-and-middleware.js](file:///c:/Users/davie/Documents/dev2026/react&node%20test/challenges/3-node-streams-and-middleware.js).
   - Run `npm test` to test your implementations against [assessment.test.js](file:///c:/Users/davie/Documents/dev2026/react&node%20test/challenges/assessment.test.js).
   - Run `npm run test:solutions` to verify the reference solutions in [solutions.js](file:///c:/Users/davie/Documents/dev2026/react&node%20test/challenges/solutions.js).

---

## Part 1: Core JavaScript (Questions 1–15)

### Q1. Event Loop & Promise Unwrapping
What is the exact console output order when the following JavaScript code executes?
```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve()
  .then(() => {
    console.log('3');
    return Promise.resolve('4');
  })
  .then((val) => console.log(val));

queueMicrotask(() => console.log('5'));

console.log('6');
```
- **A)** `1`, `6`, `3`, `5`, `4`, `2`
- **B)** `1`, `6`, `3`, `4`, `5`, `2`
- **C)** `1`, `6`, `5`, `3`, `4`, `2`
- **D)** `1`, `3`, `5`, `4`, `6`, `2`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: A (`1`, `6`, `3`, `5`, `4`, `2`)**
Synchronous logs run first (`1`, `6`). Then the microtask queue runs FIFO: the first `.then()` logs `3` and returns `Promise.resolve('4')` (returning a Promise inside `.then()` requires an extra microtask tick to unwrap according to the Promises/A+ spec). Meanwhile, `queueMicrotask` is already next in the microtask queue and logs `5`. Next, the unwrapped promise resolves and logs `4`. Finally, the macrotask (`setTimeout`) logs `2`.
</details>

---

### Q2. Closures & Block Scope (`var` vs `let`)
What will the following snippet log to the console?
```javascript
const funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(() => i);
}
for (let j = 0; j < 3; j++) {
  funcs.push(() => j);
}
console.log(funcs.map(fn => fn()).join(','));
```
- **A)** `0,1,2,0,1,2`
- **B)** `3,3,3,0,1,2`
- **C)** `2,2,2,0,1,2`
- **D)** `3,3,3,3,3,3`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B (`3,3,3,0,1,2`)**
`var i` is function/global-scoped, so all 3 closures in the first loop reference the same binding of `i`, which terminates at `3`. `let j` is block-scoped and creates a fresh lexical binding for each iteration (`0`, `1`, `2`).
</details>

---

### Q3. `this` Context in Callbacks (Strict Mode)
What is logged when `service.run()` is invoked in strict mode?
```javascript
'use strict';
const service = {
  prefix: 'BD-',
  items: [10, 20],
  run() {
    return this.items.map(function (num) {
      return this.prefix + num;
    });
  }
};
console.log(service.run());
```
- **A)** `["BD-10", "BD-20"]`
- **B)** `["undefined10", "undefined20"]`
- **C)** Throws `TypeError: Cannot read properties of undefined (reading 'prefix')`
- **D)** `[NaN, NaN]`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: C**
A regular `function (num)` passed to `.map()` without a `thisArg` second parameter is invoked with `this === undefined` in strict mode. Accessing `this.prefix` throws a `TypeError`. Using an arrow function `(num) => this.prefix + num` captures `this` lexically from `run()`.
</details>

---

### Q4. Shallow Freeze & Shallow Spread
What will be logged by `console.log(original.meta.count, original.tags.length)`?
```javascript
const original = {
  meta: { count: 1 },
  tags: ['js']
};
Object.freeze(original);
const copy = { ...original };
copy.meta.count = 99;
copy.tags.push('node');

console.log(original.meta.count, original.tags.length);
```
- **A)** `1 1`
- **B)** `99 2`
- **C)** Throws a `TypeError` because `original` is frozen
- **D)** `1 2`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B (`99 2`)**
Both `Object.freeze()` and `{ ...original }` are shallow. `original.meta` and `original.tags` are shared nested object references between `original` and `copy`, and their inner properties/elements are not frozen.
</details>

---

### Q5. Promise Combinators *(Multi-Select: Choose 2)*
Which **TWO** statements accurately describe `Promise.all`, `Promise.allSettled`, and `Promise.any`?
- **A)** `Promise.all` rejects immediately as soon as any input promise rejects (fail-fast).
- **B)** `Promise.allSettled` rejects if all input promises reject.
- **C)** `Promise.any` resolves as soon as the first input promise fulfills, ignoring earlier rejections unless all input promises reject with an `AggregateError`.
- **D)** `Promise.all` waits for all promises to settle before rejecting with an array of errors.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answers: A and C**
`Promise.all` fails fast on the first rejection. `Promise.allSettled` never rejects (always resolves with `{ status, value/reason }` objects). `Promise.any` resolves on the first fulfilled promise and only rejects with `AggregateError` if every single input promise rejects.
</details>

---

### Q6. Hoisting & Temporal Dead Zone (TDZ)
What happens when the following code is executed?
```javascript
var rate = 100;
function calculate() {
  console.log(rate);
  let rate = 200;
}
calculate();
```
- **A)** Logs `100`
- **B)** Logs `undefined`
- **C)** Throws `ReferenceError: Cannot access 'rate' before initialization`
- **D)** Logs `200`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: C**
`let rate = 200` shadows the outer `var rate` throughout the entire block scope of `calculate()`. Accessing `rate` before the `let` declaration is evaluated hits the Temporal Dead Zone (TDZ) and throws a `ReferenceError`.
</details>

---

### Q7. Prototypal Inheritance & `delete`
What is logged by the following prototype inspection snippet?
```javascript
function Developer(name) {
  this.name = name;
}
Developer.prototype.role = 'Engineer';

const dev = new Developer('Mateo');
delete dev.role;
console.log(dev.role, Object.hasOwn(dev, 'role'));
```
- **A)** `undefined false`
- **B)** `Engineer false`
- **C)** `Engineer true`
- **D)** `undefined true`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B (`Engineer false`)**
`delete dev.role` only removes own properties on `dev`; it does not delete properties on `Developer.prototype`. `dev.role` still resolves to `'Engineer'` via prototype lookup, while `Object.hasOwn(dev, 'role')` is `false`.
</details>

---

### Q8. `return` vs `return await` in `try / catch`
What is the difference between `return await fetchUser()` and `return fetchUser()` inside a `try / catch` block of an `async` function?
```javascript
async function getUserSafe() {
  try {
    return fetchUser(); // returns a Promise that rejects
  } catch (err) {
    return { fallback: true };
  }
}
```
- **A)** There is no difference; `try/catch` catches the rejection in both cases.
- **B)** Without `return await`, the rejected Promise is returned directly to the caller and bypasses the local `catch` block.
- **C)** `return await` causes a syntax error in ES2022+.
- **D)** Without `return await`, `getUserSafe()` returns `undefined`.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
Inside a `try / catch` block, `return fetchUser()` returns the pending Promise before it settles, so if it rejects, the local `catch` block is never entered. Using `return await fetchUser()` unwraps the Promise inside the `try` block so rejections are caught locally.
</details>

---

### Q9. `WeakMap` & Memory Management *(Multi-Select: Choose 2)*
Why would you choose a `WeakMap` over a standard `Map` for caching computed metadata associated with DOM nodes or user objects?
- **A)** `WeakMap` holds weak references to its object keys, allowing keys and their associated values to be garbage-collected when no other references to the key exist.
- **B)** `WeakMap` allows iterating over all keys using `.keys()` or `for...of` faster than `Map`.
- **C)** `WeakMap` keys must be objects (or non-registered symbols), preventing memory leaks in long-lived caches.
- **D)** `WeakMap` automatically serializes its entries to `localStorage`.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answers: A and C**
`WeakMap` keys are held weakly so entries are automatically garbage-collected when the key object is no longer referenced elsewhere. Because garbage collection is non-deterministic, `WeakMap` does not support iteration (`.keys()`, `.size`, etc.).
</details>

---

### Q10. `Array.prototype.reduce` on Empty Array
What happens when the following code runs?
```javascript
const values = [];
const sum = values.reduce((acc, curr) => acc + curr);
console.log(sum);
```
- **A)** Logs `0`
- **B)** Logs `undefined`
- **C)** Throws `TypeError: Reduce of empty array with no initial value`
- **D)** Logs `NaN`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: C**
Calling `.reduce()` on an empty array without an initial value (`values.reduce(fn, 0)`) always throws a `TypeError`.
</details>

---

### Q11. Logical OR (`||`) vs Nullish Coalescing (`??`)
What is logged to the console?
```javascript
const config = { retries: 0, label: '', timeout: null };
console.log(
  config.retries || 3,
  config.retries ?? 3,
  config.label ?? 'default',
  config.timeout ?? 5000
);
```
- **A)** `3 0 "" 5000`
- **B)** `0 0 "" 5000`
- **C)** `3 3 "default" 5000`
- **D)** `3 0 "default" null`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: A (`3 0 "" 5000`)**
`||` falls back on any falsy value (`0`, `""`, `false`, `null`, `undefined`), whereas `??` only falls back on `null` or `undefined`.
</details>

---

### Q12. Generators & Two-Way `yield`
What will be logged by the following generator sequence?
```javascript
function* seq(x) {
  const y = yield x + 1;
  const z = yield y * 2;
  return x + y + z;
}
const gen = seq(5);
console.log(gen.next().value, gen.next(10).value, gen.next(3).value);
```
- **A)** `6 12 18`
- **B)** `6 20 18`
- **C)** `5 10 3`
- **D)** `6 20 undefined`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B (`6 20 18`)**
`gen.next()` yields `5 + 1 = 6`. `gen.next(10)` assigns `y = 10` and yields `10 * 2 = 20`. `gen.next(3)` assigns `z = 3` and returns `5 + 10 + 3 = 18`.
</details>

---

### Q13. Plain Object Key String Coercion
What does `console.log(map[keyA])` output?
```javascript
const map = {};
const keyA = { id: 1 };
const keyB = { id: 2 };

map[keyA] = 'Alpha';
map[keyB] = 'Beta';

console.log(map[keyA]);
```
- **A)** `"Alpha"`
- **B)** `"Beta"`
- **C)** `undefined`
- **D)** Throws a `TypeError`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B (`"Beta"`)**
Plain object keys are converted to strings (`"[object Object]"`). Both `keyA` and `keyB` map to `map["[object Object]"]`, so `'Beta'` overwrites `'Alpha'`.
</details>

---

### Q14. DOM Event Capturing vs Bubbling
A user clicks `<button id="child">` inside `<div id="parent">`. Given the listeners below, what is logged?
```javascript
parent.addEventListener('click', () => console.log('Parent Bubble'), false);
parent.addEventListener('click', () => console.log('Parent Capture'), true);
child.addEventListener('click', () => console.log('Child'));
```
- **A)** `Child`, `Parent Bubble`, `Parent Capture`
- **B)** `Parent Capture`, `Child`, `Parent Bubble`
- **C)** `Parent Bubble`, `Child`, `Parent Capture`
- **D)** `Parent Capture`, `Parent Bubble`, `Child`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B (`Parent Capture`, `Child`, `Parent Bubble`)**
Events travel down during the Capture phase (`true`), fire on the Target (`Child`), and bubble back up during the Bubbling phase (`false`).
</details>

---

### Q15. Independent Closure Instances
What is logged by the following snippet?
```javascript
function createCounter(step = 1) {
  let count = 0;
  return function () {
    count += step;
    return count;
  };
}
const incA = createCounter(2);
const incB = createCounter(5);
console.log(incA(), incA(), incB());
```
- **A)** `2 4 5`
- **B)** `2 4 9`
- **C)** `2 2 5`
- **D)** `1 2 5`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: A (`2 4 5`)**
Each call to `createCounter()` creates a separate lexical environment with its own `count`.
</details>

---

## Part 2: React 18 & Hooks (Questions 16–30)

### Q16. State Batching & Render Snapshots
In React 18, a user clicks the button once when `count` is `0`. What will the rendered `count` and `console.log(count)` be?
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(prev => prev + 1);
    console.log(count);
  };

  return <button onClick={handleClick}>{count}</button>;
}
```
- **A)** Rendered count: `3`, Console log: `3`
- **B)** Rendered count: `2`, Console log: `0`
- **C)** Rendered count: `1`, Console log: `0`
- **D)** Rendered count: `3`, Console log: `0`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B (Rendered count: `2`, Console log: `0`)**
`count` is `0` throughout `handleClick`. Both `setCount(count + 1)` calls set the queued state to `1`. Then `setCount(prev => prev + 1)` increments `1` to `2`. `console.log(count)` still reads `0` from the current render closure.
</details>

---

### Q17. Stale Closures in `useEffect`
What happens when this `Timer` component mounts and runs for 5 seconds?
```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <div>{seconds}</div>;
}
```
- **A)** It increments `0, 1, 2, 3, 4, 5` as expected.
- **B)** It changes from `0` to `1` after 1 second and stays stuck at `1` forever.
- **C)** It causes an infinite synchronous re-render loop.
- **D)** It throws a React missing dependency runtime error.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
With `[]`, the effect runs only once on mount and captures `seconds = 0` in its closure. Every interval tick computes `0 + 1 = 1`. Use `setSeconds(s => s + 1)` to avoid the stale closure.
</details>

---

### Q18. Rules of Hooks & Fiber Architecture
Why does React strictly forbid calling Hooks inside `if` statements, loops, or nested functions?
- **A)** Because Babel cannot transpile hook calls inside conditional blocks.
- **B)** Because React stores Hook state in an internal linked list on the Fiber node indexed by the exact call order across renders.
- **C)** Because `useState` relies on hoisting to the top of the function scope.
- **D)** Because conditional hooks prevent Garbage Collection of DOM nodes.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
React tracks hook state by walking a linked list of hook nodes on the component's Fiber in the exact order they are called during render.
</details>

---

### Q19. `React.memo` & Inline Object References
Why does `<ExpensiveChild />` still re-render every time `Parent` updates `text`, even though `ExpensiveChild` is wrapped in `React.memo`?
```jsx
const ExpensiveChild = React.memo(({ onAction, config }) => {
  return <button onClick={onAction}>{config.theme}</button>;
});

function Parent() {
  const [text, setText] = useState('');
  const handleAction = useCallback(() => console.log('Clicked'), []);

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <ExpensiveChild onAction={handleAction} config={{ theme: 'dark' }} />
    </div>
  );
}
```
- **A)** `React.memo` only works with class components.
- **B)** Although `handleAction` is memoized with `useCallback`, `config={{ theme: 'dark' }}` creates a brand-new object reference on every render, failing `React.memo`'s shallow `Object.is` prop comparison.
- **C)** `useCallback` creates a new function reference when `[]` is passed.
- **D)** Children of a component with `<input>` always bypass `React.memo`.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
`config={{ theme: 'dark' }}` allocates a new object literal on every render (`{} !== {}`), causing `React.memo`'s shallow prop comparison to fail. Memoize `config` with `useMemo` or hoist the constant outside the component.
</details>

---

### Q20. Reconciliation & Array Index as `key`
A list of items with uncontrolled `<input defaultValue={item.name} />` uses the array index (`key={index}`) as the React key. What bug occurs when a new item is prepended (`[newItem, ...items]`) to the start of the list?
- **A)** React throws a fatal key collision exception.
- **B)** The DOM inputs keep the old values shifted in the wrong rows because React matches `key={0}` to the previous first DOM node.
- **C)** All `<input>` values are cleared to empty strings.
- **D)** Only the last item in the list is rendered.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
Using `key={index}` when prepending/reordering items causes React to reuse the existing DOM node at `key={0}` for the newly prepended item, retaining stale uncontrolled DOM state in the wrong row.
</details>

---

### Q21. `useEffect` Cleanup Execution Order
When a component with the following `useEffect` re-renders because `userId` changed from `1` to `2`, in what exact order do things execute?
```jsx
useEffect(() => {
  console.log('Subscribe:', userId);
  return () => {
    console.log('Cleanup:', userId);
  };
}, [userId]);
```
- **A)** `Subscribe: 2`, then `Cleanup: 1`
- **B)** `Cleanup: 2`, then `Subscribe: 2`
- **C)** Component renders with `userId = 2` -> DOM updates -> `Cleanup: 1` runs -> `Subscribe: 2` runs
- **D)** `Cleanup: 1` runs ONLY when the component completely unmounts from the DOM

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: C**
On dependency change, React renders the new UI, commits to the DOM, runs the previous effect's cleanup (`Cleanup: 1`), and then runs the new effect (`Subscribe: 2`).
</details>

---

### Q22. `useRef` vs `useState` *(Multi-Select: Choose 2)*
Which statements about `useRef` in React are **TRUE**?
- **A)** Mutating `ref.current` does NOT trigger a component re-render.
- **B)** The object returned by `useRef` maintains the exact same object reference across the entire lifetime of the component.
- **C)** `ref.current` should be read and written directly during the render calculation to drive conditional JSX output.
- **D)** Updating `ref.current` is batched asynchronously just like `useState`.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answers: A and B**
`useRef` returns a persistent mutable container `{ current }` whose mutation is synchronous and never triggers a re-render.
</details>

---

### Q23. Context API Re-render Propagation
If a `<ThemeContext.Provider value={{ theme, setTheme }}>` sits at the root of an app, and its parent re-renders due to unrelated state, which descendants re-render by default?
- **A)** Every single component inside the Provider tree, even if they don't call `useContext`.
- **B)** Every component that calls `useContext(ThemeContext)`, because `{ theme, setTheme }` is a new object reference unless memoized with `useMemo`.
- **C)** No components re-render unless `theme` primitive string changes.
- **D)** Only class components using `static contextType`.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
Passing a new object reference `value={{ theme, setTheme }}` forces every consumer calling `useContext(ThemeContext)` to re-render, bypassing `React.memo` on intermediate components.
</details>

---

### Q24. React Error Boundaries *(Multi-Select: Choose 2)*
Which of the following errors are **NOT** caught by a React Error Boundary (`componentDidCatch` / `getDerivedStateFromError`)?
- **A)** Errors thrown inside an `onClick` or `onSubmit` event handler.
- **B)** Errors thrown synchronously inside a child component's render method.
- **C)** Asynchronous errors inside `setTimeout` or an unhandled `fetch` Promise rejection.
- **D)** Errors thrown inside a child's `useLayoutEffect` or lifecycle method.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answers: A and C**
Error Boundaries only catch errors thrown during rendering, lifecycle methods, and constructors of the component tree below them—not inside event handlers or async callbacks.
</details>

---

### Q25. `useLayoutEffect` vs `useEffect`
When should you use `useLayoutEffect` instead of `useEffect`?
- **A)** For all `fetch()` network requests so data loads faster.
- **B)** When you need to measure DOM layout (e.g., `getBoundingClientRect()`) and synchronously mutate/re-render before the browser paints to prevent visual flicker.
- **C)** When rendering components on the server (SSR) with Next.js.
- **D)** Whenever an effect has more than 3 dependencies.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
`useLayoutEffect` runs synchronously after DOM mutations but before the browser paints, preventing visual layout shift/flicker when measuring DOM elements.
</details>

---

### Q26. React 18 Automatic Batching
In React 18 (using `createRoot`), how many times does the component re-render when the `fetch().then(...)` callback below executes?
```jsx
useEffect(() => {
  fetch('/api/user').then((res) => {
    setUser({ name: 'Sofia' });
    setLoading(false);
  });
}, []);
```
- **A)** 2 times (because state updates inside Promises are never batched)
- **B)** 1 time (React 18 automatically batches state updates inside Promises, `setTimeout`, and native event handlers)
- **C)** 3 times
- **D)** 0 times unless wrapped in `unstable_batchedUpdates`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
React 18's `createRoot` enables Automatic Batching for all updates, including those inside Promises, `setTimeout`, and native event handlers.
</details>

---

### Q27. Derived State Anti-Pattern
Why is copying filtered props into `useState` via `useEffect` considered a React anti-pattern?
```jsx
function FilteredList({ items, query }) {
  const [filtered, setFiltered] = useState([]);
  useEffect(() => {
    setFiltered(items.filter(i => i.includes(query)));
  }, [items, query]);
  return <List data={filtered} />;
}
```
- **A)** `items.filter` mutates the `items` prop in place.
- **B)** It causes an unnecessary double render pass on every prop change instead of computing derived state during render (or with `useMemo`).
- **C)** `useEffect` cannot read props.
- **D)** `useState` cannot hold arrays.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
Syncing derived state via `useEffect` forces an extra render pass with stale data before the effect fires. Compute derived values directly during render (or memoize with `useMemo`).
</details>

---

### Q28. Controlled vs Uncontrolled Input Warning
What causes React to log the warning: `"A component is changing an uncontrolled input to be controlled"`?
- **A)** Passing `readOnly` to an `<input>` element.
- **B)** Initializing state as `const [name, setName] = useState()` (`undefined`), passing `value={name}` to `<input>`, and later calling `setName("abc")`.
- **C)** Using `onChange` instead of `onInput`.
- **D)** Using `useRef` on a `<form>` element.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
Passing `value={undefined}` makes the `<input>` uncontrolled; updating it to a string later switches it to controlled. Initialize with `useState('')`.
</details>

---

### Q29. Custom Hooks & State Isolation
If Component A and Component B both call `const [isOpen, toggle] = useModal()`, do they share the `isOpen` state?
- **A)** Yes, custom hooks create a singleton state shared across all callers.
- **B)** No, custom hooks share stateful logic, NOT state itself; each call creates completely isolated state attached to the calling component.
- **C)** Yes, if both components are rendered inside the same parent.
- **D)** Only if `useModal` uses `useCallback`.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
Each call to a custom hook creates completely independent state slots on the calling component's Fiber.
</details>

---

### Q30. React 18 `useTransition`
What is the primary purpose of `startTransition` from `useTransition()` in React 18?
- **A)** To animate CSS opacity transitions between route changes.
- **B)** To mark a state update as non-urgent (interruptible) so urgent updates like typing in an input remain responsive without blocking the main thread.
- **C)** To debounce network `fetch` requests by 300ms.
- **D)** To run state updates on a background Web Worker thread.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
`startTransition` marks expensive UI state updates as interruptible low-priority transitions so urgent user input stays responsive.
</details>

---

## Part 3: Node.js & Express (Questions 31–45)

### Q31. Event Loop Inside I/O Callbacks (`nextTick` vs `setImmediate` vs `setTimeout`)
Inside a Node.js `fs.readFile` I/O callback, what is the exact execution order of the following logs?
```javascript
const fs = require('node:fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  process.nextTick(() => console.log('nextTick'));
  Promise.resolve().then(() => console.log('promise'));
});
```
- **A)** `nextTick`, `promise`, `timeout`, `immediate`
- **B)** `nextTick`, `promise`, `immediate`, `timeout`
- **C)** `immediate`, `nextTick`, `promise`, `timeout`
- **D)** `promise`, `nextTick`, `immediate`, `timeout`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B (`nextTick`, `promise`, `immediate`, `timeout`)**
`process.nextTick` runs first, followed by Promise microtasks (`promise`). Because this code runs inside an I/O callback (Poll phase), the Event Loop advances directly to the **Check phase** (`setImmediate`) before looping back to the **Timers phase** (`setTimeout`).
</details>

---

### Q32. CommonJS `exports` vs `module.exports`
What is logged in `index.js` when importing `math.js` below?
```javascript
// math.js
exports.add = (a, b) => a + b;
exports = {
  add: (a, b) => a * b,
  subtract: (a, b) => a - b
};

// index.js
const math = require('./math');
console.log(math.add(2, 3), math.subtract);
```
- **A)** `6 [Function: subtract]`
- **B)** `5 undefined`
- **C)** `6 undefined`
- **D)** Throws a `ReferenceError: exports is not defined`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B (`5 undefined`)**
`exports.add` mutates `module.exports.add`. Reassigning `exports = { ... }` only overwrites the local `exports` parameter reference without changing `module.exports`, which is what `require()` returns.
</details>

---

### Q33. Express Error Middleware Arity Check
Why is the following Express error-handling middleware NEVER triggered when a route calls `next(new Error("DB Failed"))`?
```javascript
app.use((err, req, res) => {
  res.status(500).json({ error: err.message });
});
```
- **A)** Error middleware must be registered BEFORE all routes.
- **B)** Express checks `fn.length === 4` (function parameter count) to identify error-handling middleware; omitting the 4th parameter `next` (`(err, req, res, next)`) makes Express treat it as normal 3-arg middleware.
- **C)** Express requires `app.onError()` instead of `app.use()`.
- **D)** `res.status(500)` is invalid in Express.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
Express inspects `fn.length === 4` to distinguish error-handling middleware `(err, req, res, next)` from standard middleware `(req, res, next)`.
</details>

---

### Q34. `ERR_HTTP_HEADERS_SENT` in Express
What runtime bug exists in this Express route handler when `!req.headers.authorization` is true?
```javascript
app.get('/orders', (req, res) => {
  if (!req.headers.authorization) {
    res.status(401).json({ error: 'Unauthorized' });
  }
  res.status(200).json({ orders: [1, 2, 3] });
});
```
- **A)** The response status becomes `200` and overwrites `401` silently.
- **B)** Calling `res.json()` does not exit the function; without `return`, execution continues to the second `res.json()` and throws `ERR_HTTP_HEADERS_SENT`.
- **C)** Express automatically stops execution on the first `res.json()`.
- **D)** It causes a memory leak in the V8 heap.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
`res.json()` does not terminate function execution. Without `return`, the handler calls `res.status(200).json(...)` after headers were already flushed, throwing `ERR_HTTP_HEADERS_SENT`.
</details>

---

### Q35. Node.js Streams & Backpressure
When writing data to a Node.js `Writable` stream using `writable.write(chunk)`, what does it mean when `writable.write(chunk)` returns `false`?
- **A)** The write operation failed and the chunk was dropped; you must retry writing the same chunk.
- **B)** The internal buffer has reached `highWaterMark` (backpressure); the chunk WAS queued, but the producer should pause writing until the `'drain'` event is emitted.
- **C)** The stream has already closed permanently.
- **D)** The chunk contained invalid UTF-8 bytes.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
`false` signals backpressure: the chunk was buffered, but the internal buffer is full (`>= highWaterMark`). Wait for the `'drain'` event before writing more chunks to prevent unbounded memory growth.
</details>

---

### Q36. `libuv` Thread Pool vs OS Kernel Async I/O *(Multi-Select: Choose 2)*
Which **TWO** operations in Node.js use the `libuv` Worker Thread Pool (default size `UV_THREADPOOL_SIZE = 4`) rather than non-blocking OS kernel sockets?
- **A)** File system operations (`fs.readFile`, `fs.stat`)
- **B)** Incoming HTTP/TCP network socket requests (`http.createServer`, `net`)
- **C)** CPU-intensive asynchronous crypto functions (`crypto.pbkdf2`, `crypto.scrypt`) and `dns.lookup()`
- **D)** `setTimeout` and `setInterval` timers

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answers: A and C**
File system calls, `dns.lookup()`, `zlib`, and async `crypto` (`pbkdf2`, `scrypt`) execute on the `libuv` thread pool, while TCP/HTTP sockets are multiplexed directly by the OS kernel (`epoll`/`kqueue`/`IOCP`).
</details>

---

### Q37. `EventEmitter` Unhandled `'error'` Event
What happens in Node.js if an `EventEmitter` instance emits an `'error'` event (`emitter.emit('error', new Error('fail'))`) and no listener is registered for `'error'`?
- **A)** The error is silently ignored like any other unhandled event name.
- **B)** Node.js logs a warning and continues running.
- **C)** The error is thrown as an uncaught exception, printing a stack trace and crashing the Node.js process.
- **D)** The `EventEmitter` automatically retries the previous event.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: C**
An unhandled `'error'` event on any `EventEmitter` causes Node.js to throw the error synchronously, crashing the process if uncaught.
</details>

---

### Q38. `Buffer.alloc` vs `Buffer.allocUnsafe`
What is the critical security difference between `Buffer.alloc(1024)` and `Buffer.allocUnsafe(1024)`?
- **A)** `Buffer.allocUnsafe` can overflow the buffer length.
- **B)** `Buffer.alloc` zero-fills the allocated memory, whereas `Buffer.allocUnsafe` skips initialization and may contain sensitive old in-memory data if not overwritten.
- **C)** `Buffer.allocUnsafe` allocates memory on disk instead of RAM.
- **D)** There is no difference in Node.js 18+.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
`Buffer.allocUnsafe` leaves uninitialized memory intact for speed, which may expose sensitive remnants from the process heap if leaked before overwriting.
</details>

---

### Q39. `worker_threads` vs `cluster`
You have an Express route that performs heavy synchronous image matrix transformations in JavaScript, blocking the Event Loop for 800ms per request. Which native Node.js module is specifically designed to offload CPU-bound JavaScript work while sharing memory via `SharedArrayBuffer`?
- **A)** `node:worker_threads`
- **B)** `node:cluster`
- **C)** `node:dgram`
- **D)** `node:async_hooks`

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: A (`node:worker_threads`)**
`worker_threads` runs parallel JS threads inside the same process and supports shared memory (`SharedArrayBuffer`), making it ideal for CPU-intensive tasks.
</details>

---

### Q40. Module Caching in `require()`
If `moduleA.js` and `moduleB.js` both call `const db = require('./db.js')` in the same Node.js process, how many times is `db.js` executed?
- **A)** Twice (once per `require` call).
- **B)** Once; Node.js caches the exported object in `require.cache` keyed by resolved filename and returns the same cached reference on subsequent `require()` calls.
- **C)** Once per HTTP request.
- **D)** It throws a duplicate import error.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
CommonJS modules are evaluated once and cached in `require.cache`.
</details>

---

### Q41. `child_process.spawn()` vs `child_process.exec()`
Why should you use `child_process.spawn()` instead of `child_process.exec()` when running a CLI command that outputs a 500MB log stream?
- **A)** `exec()` does not support command-line arguments.
- **B)** `exec()` buffers the entire stdout/stderr in memory (failing when `maxBuffer` is exceeded) and spawns a shell by default, whereas `spawn()` streams stdout/stderr chunk-by-chunk without a shell.
- **C)** `spawn()` is synchronous and blocks the event loop.
- **D)** `exec()` only works on Linux.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
`exec()` buffers the entire output into memory and invokes a shell, while `spawn()` streams data via `Readable` streams and avoids shell injection by default.
</details>

---

### Q42. Express 4 Async Error Handling
In Express 4.x (without an async wrapper), what happens if an `async (req, res, next)` route handler awaits a rejected Promise without a `try/catch` block?
- **A)** Express 4 automatically catches the rejected Promise and forwards it to the 4-arg error middleware.
- **B)** Express 4 does NOT catch rejected Promises returned by route handlers; it triggers an `UnhandledPromiseRejection` and leaves the request hanging unless caught and passed to `next(err)`.
- **C)** Express automatically responds with `404 Not Found`.
- **D)** The route automatically retries 3 times.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
Express 4 does not attach `.catch(next)` to promises returned by route handlers; unhandled rejections must be caught with `try/catch` or an `asyncHandler` wrapper.
</details>

---

### Q43. Starving the Event Loop (`process.nextTick` vs `setImmediate`)
What happens if a recursive function schedules itself continuously using `process.nextTick(run)` vs `setImmediate(run)`?
- **A)** Both behave identically.
- **B)** Recursive `process.nextTick` starves the Event Loop completely (I/O callbacks and timers never run), whereas recursive `setImmediate` yields to the Poll I/O phase on each iteration.
- **C)** Recursive `setImmediate` blocks the I/O Poll phase forever.
- **D)** `process.nextTick` automatically throttles after 10 calls.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
Node drains the `nextTickQueue` completely before advancing the Event Loop, so recursive `process.nextTick` starves I/O indefinitely.
</details>

---

### Q44. SemVer Ranges (`^` vs `~`)
In `package.json`, what is the difference between `"express": "^4.18.2"` and `"express": "~4.18.2"`?
- **A)** `^4.18.2` allows minor and patch updates (`>=4.18.2 <5.0.0`), while `~4.18.2` allows only patch updates (`>=4.18.2 <4.19.0`).
- **B)** `^4.18.2` allows major updates (`5.x.x`), while `~4.18.2` allows minor updates.
- **C)** They are aliases for the exact same version range.
- **D)** `~4.18.2` locks the exact version `4.18.2` with no updates.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: A**
`^` permits minor and patch updates within the same major version (`4.x.x`), whereas `~` permits only patch updates within the same minor version (`4.18.x`).
</details>

---

### Q45. Graceful Shutdown on `SIGTERM`
When a containerized Node.js HTTP server receives `SIGTERM` during a deployment, what is the proper sequence for a graceful shutdown?
- **A)** Call `process.exit(0)` immediately inside the `SIGTERM` handler.
- **B)** Call `server.close()` to stop accepting new connections while allowing in-flight HTTP requests to finish, then close database pools and exit.
- **C)** Ignore `SIGTERM` and wait for `SIGKILL`.
- **D)** Delete `require.cache` and restart the event loop.

<details>
<summary><strong>Answer & Explanation</strong></summary>

**Correct Answer: B**
`server.close()` stops accepting new connections while draining active requests cleanly before closing database connections and exiting.
</details>

