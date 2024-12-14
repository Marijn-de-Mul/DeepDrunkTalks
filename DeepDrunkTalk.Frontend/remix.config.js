/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  future: {
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
    v2_meta: true,
    v2_headers: true,
    serverModuleFormat: 'esm', // or 'cjs' if you prefer CommonJS
  },
  serverBuildPath: "build/index.js",
  ignoredRouteFiles: ["**/.*"],
  // Add any other Remix configuration options here
};
