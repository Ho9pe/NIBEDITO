// Logging that knows the difference between what is useful while developing and
// what should end up in a hosted log stream.
//
// Everything used to go out unconditionally, which put a working password-reset
// link, full user objects on every sign-in, and per-request debugging into
// production logs that are retained and readable by anyone with dashboard
// access. `debug` is now silent outside development.
//
// `info`, `warn` and `error` always print. Losing startup lines and failures in
// production would be worse than noisy: those are the ones you go looking for
// when something is wrong.

const { nodeEnv } = require("../secret");

const isDevelopment = nodeEnv !== "production";

module.exports = {
  /** Development only. Use for anything tracing behaviour or dumping state. */
  debug: (...args) => {
    if (isDevelopment) console.log(...args);
  },

  /** Always. Reserve for lifecycle events worth seeing in a deployment. */
  info: (...args) => console.log(...args),

  warn: (...args) => console.warn(...args),

  error: (...args) => console.error(...args),
};
