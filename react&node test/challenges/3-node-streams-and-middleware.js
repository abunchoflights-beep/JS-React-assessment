/**
 * CODING CHALLENGE 3: NODE.JS STREAMS & EXPRESS MIDDLEWARE (Time Limit: 30 mins)
 *
 * Task 3A: Express Sliding-Window Rate Limiter Middleware (`createRateLimiter`)
 * Implement an Express-compatible middleware factory `createRateLimiter({ windowMs, maxRequests, nowFn })`
 * that limits each client IP (`req.ip`) to at most `maxRequests` within a rolling `windowMs` timeframe.
 *
 * Requirements:
 *   1. Track request timestamps per `req.ip` within `(currentTime - windowMs, currentTime]`.
 *   2. Set response headers on EVERY request:
 *      - `X-RateLimit-Limit`: `maxRequests`
 *      - `X-RateLimit-Remaining`: number of remaining allowed requests in the current window (minimum 0)
 *   3. If the client exceeds `maxRequests` in the current window:
 *      - Do NOT call `next()`.
 *      - Respond with HTTP status `429` (`res.status(429).json({ error: 'Too Many Requests' })`).
 *   4. Otherwise, record the request and call `next()`.
 *
 * Task 3B: Memory-Efficient NDJSON Log Stream Aggregator (`aggregateLogStream`)
 * BairesDev Node.js tests frequently check whether you buffer entire files in memory (anti-pattern)
 * vs processing chunks via Node.js Readable Streams.
 * Given a Node.js `Readable` stream emitting newline-delimited JSON (NDJSON) log lines across arbitrary chunk boundaries:
 *   `{"level":"error","service":"auth","latencyMs":120}\n`
 * Return a Promise resolving to:
 *   `{ totalValidLines, malformedLines, byLevel: { info: count, error: count, ... }, avgLatencyMs }`
 *   (where `avgLatencyMs` is rounded to 2 decimal places, or `0` if `totalValidLines === 0`).
 */

function createRateLimiter({ windowMs = 60000, maxRequests = 5, nowFn = () => Date.now() } = {}) {
  // TODO: Implement your solution here
  throw new Error('Not implemented: createRateLimiter');
}

async function aggregateLogStream(readableStream) {
  // TODO: Implement your solution here
  throw new Error('Not implemented: aggregateLogStream');
}

module.exports = {
  createRateLimiter,
  aggregateLogStream,
};

