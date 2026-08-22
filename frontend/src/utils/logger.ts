// Client-side logging that does not follow visitors into production.
//
// These calls ran unconditionally, so request URLs, full API responses and
// filter state were printed into the devtools console of everyone using the
// live site. Nothing is printed in a production build now.
//
// What this does not do is remove the messages from the shipped JavaScript. The
// environment check sits inside this function, so the call sites and their
// string arguments are still in the bundle - they simply never print. Treat log
// messages as readable by anyone, and keep secrets out of them regardless of
// level. next.config.ts additionally strips bare console.log calls from
// production builds, which catches any that bypass this module.
//
// `warn` and `error` always run: a browser error nobody can see is worse than a
// noisy console.

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  /** Development only. Tracing, state dumps, request/response bodies. */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) console.log(...args);
  },

  warn: (...args: unknown[]): void => console.warn(...args),

  error: (...args: unknown[]): void => console.error(...args),
};

export default logger;
