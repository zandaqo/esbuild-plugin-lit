import { readFile } from "fs/promises";
import { CSSLoader } from "./css-loader";
import { HTMLLoader } from "./html-loader";
import { SVGLoader } from "./svg-loader";
import { XLFLoader } from "./xlf-loader";
import type { OptimizeOptions } from "svgo";

let svgo;
try {
  svgo = require("svgo");
} catch (error) {}

let txml;
try {
  txml = require("txml");
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
  html?: LoaderOptions;
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
    new HTMLLoader(options.html?.extension, specifier, options.html?.transform),
    new SVGLoader(
      options.svg?.extension,
      specifier,
      options.svg?.transform,
      svgo?.optimize,
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
      // attach minifier to the CSS loader
      if (build.initialOptions.minify && options.css?.minify !== false) {
        loaders[0].minifier = build;
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
