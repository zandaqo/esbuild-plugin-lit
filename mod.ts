import { readFile } from "https://deno.land/std@0.155.0/node/fs/promises.ts";
import * as path from "https://deno.land/std@0.155.0/node/path.ts";
import { CSSLoader } from "./css-loader.ts";
import { HTMLLoader } from "./html-loader.ts";
import { SVGLoader } from "./svg-loader.ts";
import { XLFLoader } from "./xlf-loader.ts";
import type {
  HTMLMinifierOptions,
  OptimizeOptions,
  PluginBuild,
} from "./deps.ts";
import { AssetLoader, LoaderOptions } from "./asset-loader.ts";

export interface Options {
  filter?: RegExp;
  specifier?: string;
  css?: LoaderOptions;
  html?: LoaderOptions & {
    htmlMinifier?: HTMLMinifierOptions;
  };
  svg?: LoaderOptions & {
    svgo?: OptimizeOptions;
  };
  xlf?: LoaderOptions;
}

function esbuildPluginLit(options: Options = {}) {
  const {
    filter = /\.(css|svg|html|xlf)$/,
    specifier = "lit",
  } = options;

  return {
    name: "eslint-plugin-lit",
    async setup(build: PluginBuild) {
      const svgo = options.svg?.svgo
        ? await import("https://cdn.skypack.dev/svgo?dts")
        : undefined;
      const htmlMinifier = options.html?.htmlMinifier
        ? await import("https://cdn.skypack.dev/html-minifier?dts")
        : undefined;

      const loaders: Array<AssetLoader> = [
        new CSSLoader(build, options.css, specifier),
        new SVGLoader(build, options.svg, specifier, svgo?.optimize),
        new HTMLLoader(build, options.html, specifier, htmlMinifier?.minify),
      ];

      if (options.xlf) {
        const txml = await import("https://cdn.skypack.dev/txml?dts");
        loaders.push(new XLFLoader(build, options.xlf, specifier, txml?.parse));
      }
      const cache = new Map<string, { input: string; output: string }>();

      build.onResolve({ filter }, (args) => {
        return { path: path.resolve(args.resolveDir, args.path) };
      });

      build.onLoad({ filter }, async (args) => {
        const key = args.path;
        const input = await readFile(key, "utf8");
        let value = cache.get(key);
        if (!value || value.input !== input) {
          for (const loader of loaders) {
            if (loader.extension.test(key)) {
              const filename = path.basename(key);
              const output = await loader.load(input, filename);
              value = { input, output };
              break;
            }
          }
          if (!value) value = { input, output: input };
        }
        return { contents: value.output, loader: "js" };
      });
    },
  };
}

export default esbuildPluginLit;
