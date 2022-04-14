import { readFile } from "fs/promises";
import { CSSLoader } from "./css-loader";
import { HTMLLoader } from "./html-loader";
import { SVGLoader } from "./svg-loader";
import { XLFLoader } from "./xlf-loader";
import * as path from "path";
import type { OptimizeOptions } from "svgo";
import type { Options as HTMLMinifierOptions } from "html-minifier";
import { LoaderOptions } from "./asset-loader";

let svgo;
try {
  svgo = require("svgo");
} catch (error) {}

let txml;
try {
  txml = require("txml");
} catch (error) {}

let htmlMinifier;
try {
  htmlMinifier = require("html-minifier").minify;
} catch (error) {}

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
    setup(build) {
      const loaders = [
        new CSSLoader(build, options.css, specifier),
        new HTMLLoader(build, options.html, specifier, htmlMinifier),
        new SVGLoader(build, options.svg, specifier, svgo?.optimize),
        new XLFLoader(build, options.xlf, specifier, txml?.parse),
      ];
      const cache = new Map<string, { input: string; output: string }>();
      build.onLoad({ filter }, async (args) => {
        const key = args.path;
        const input = await readFile(key, "utf8");
        let value = cache.get(key);
        if (!value || value.input !== input) {
          for (const loader of loaders) {
            if (loader.extension.test(key)) {
              const filename = path.basename(key);
              const output = loader.load(input, filename);
              value = { input, output };
              break;
            }
          }
          // no appropriate loader found, just return the input
          if (!value) value = { input, output: input };
        }
        return { contents: value.output, loader: "js" };
      });
    },
  };
}

export default esbuildPluginLit;
