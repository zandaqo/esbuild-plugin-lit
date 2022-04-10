import { readFile } from "fs/promises";
import { CSSLoader } from "./css-loader";
import { HTMLLoader } from "./html-loader";
import { SVGLoader } from "./svg-loader";
import { XLFLoader } from "./xlf-loader";
import type { OptimizeOptions } from "svgo";
import type { Options as HTMLMinifierOptions } from "html-minifier";

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

export interface LoaderOptions {
  extension?: RegExp;
  minify?: boolean;
  transform?: (input: string) => string;
}

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
  const loaders = [
    new CSSLoader(options.css?.extension, specifier, options.css?.transform),
    new HTMLLoader(
      options.html?.extension,
      specifier,
      options.html?.transform,
      undefined,
      options.html?.htmlMinifier,
    ),
    new SVGLoader(
      options.svg?.extension,
      specifier,
      options.svg?.transform,
      undefined,
      options.svg?.svgo,
    ),
    new XLFLoader(
      options.xlf?.extension,
      specifier,
      options.xlf?.transform,
      txml?.parse,
    ),
  ];
  return {
    name: "eslint-plugin-lit",
    setup(build) {
      // attach minifiers
      if (build.initialOptions.minify) {
        if (options.css?.minify !== false) loaders[0].minifier = build;
        if (options.html?.minify !== false) loaders[1].minifier = htmlMinifier;
        if (options.svg?.minify !== false) loaders[2].minifier = svgo?.optimize;
      }
      const cache = new Map<string, { input: string; output: string }>();
      build.onLoad({ filter }, async (args) => {
        const key = args.path;
        const input = await readFile(key, "utf8");
        let value = cache.get(key);
        if (!value || value.input !== input) {
          for (const loader of loaders) {
            if (loader.extension.test(key)) {
              const output = loader.load(input);
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
