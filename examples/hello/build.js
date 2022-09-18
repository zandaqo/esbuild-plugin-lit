const { default: litPlugin } = require("esbuild-plugin-lit");
const { build } = require("esbuild");

build({
  entryPoints: ["./index.ts"],
  bundle: true,
  outfile: "./index.js",
  format: "esm",
  minify: true,
  sourcemap: true,
  loader: {
    ".xlf": "text",
  },
  plugins: [
    litPlugin({
      html: {
        htmlMinifier: {
          "collapseBooleanAttributes": true,
          "collapseWhitespace": true,
        },
      },
      svg: {
        svgo: {
          plugins: [
            "preset-default",
            "removeXMLNS",
          ],
        },
      },
      xlf: {},
    }),
  ],
}).then(() => {
  process.exit(0);
});
