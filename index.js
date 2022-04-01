const { readFile } = require("fs/promises");

let svgo;
try {
  svgo = require("svgo");
} catch (error) {
  svgo = undefined;
}

function esbuildPluginLit(options = {}) {
  const {
    filter = /\.(css|svg|html)$/,
    specifier = "lit",
    svgo: svgOptions = {},
  } = options;

  return {
    name: "eslint-plugin-lit",
    setup(build) {
      const cache = new Map();
      build.onLoad({ filter }, async (args) => {
        const key = args.path;
        const input = await readFile(key, "utf8");
        let value = cache.get(key);
        if (!value || value.input !== input) {
          let output = input;
          const isCss = /\.css$/.test(key);
          const isMinifying = build.initialOptions.minify;
          const isSvg = !isCss && /\.svg$/.test(key);
          if (isCss) {
            const transformed = build.esbuild.transformSync(input, {
              loader: "css",
              minify: isMinifying,
            });
            output = transformed.code;
          } else if (isSvg && isMinifying && svgo) {
            const optimized = svgo.optimize(output, svgOptions);
            output = optimized.data;
          }
          const tag = isCss ? "css" : "html";
          output = output.replace(/(\$\{|`)/g, "\\$1");
          output = `import { ${tag} } from '${specifier}';
export const template = ${tag}\`${output}\`;
export default template;`;
          value = { input, output };
          cache.set(key, value);
        }
        return { contents: value.output, loader: "js" };
      });
    },
  };
}

module.exports = esbuildPluginLit;
