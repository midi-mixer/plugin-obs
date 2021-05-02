module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.js"],
  swDest: "dist/sw.js",
  mode: "production",
  sourcemap: true,
  runtimeCaching: [
    {
      urlPattern: /(?:\/|\.html|\.json|\.md)$/,
      handler: "NetworkFirst",
    },
  ],
};
