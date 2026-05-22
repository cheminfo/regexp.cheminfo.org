/**
 * The `regexper` UMD bundle inlines the legacy `eve` event library, which
 * assigns `eve = function(...)` without a `var` declaration. Under strict
 * mode (which Vite's ESM serving enforces) this throws
 * `ReferenceError: eve is not defined`. Pre-declaring `eve` as a global
 * property turns that line into an ordinary assignment to an existing
 * binding, which strict mode permits.
 */
declare global {
  var eve: unknown;
}

globalThis.eve = undefined;
