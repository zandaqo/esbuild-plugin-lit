import { AssetLoader, LoaderOptions } from "./asset-loader.ts";
import type {
  OptimizedSvg,
  OptimizeOptions,
  optimizeSvg,
  PluginBuild,
} from "./deps.ts";

type SVGLoaderOptions = LoaderOptions & {
  svgo?: OptimizeOptions;
};

export class SVGLoader extends AssetLoader {
  extension = /\.svg$/;
  declare options: SVGLoaderOptions;
  declare minifier?: typeof optimizeSvg;

  constructor(
    build: PluginBuild,
    options: SVGLoaderOptions = {},
    specifier = "lit",
    minifier?: typeof optimizeSvg,
  ) {
    super(build, options, specifier, minifier);
    if (options.extension) this.extension = options.extension;
    if (options.transform) this.transform = options.transform;
    this.minify = !!build.initialOptions.minify && options.minify !== false &&
      !!this.minifier;
  }

  load(input: string, filename: string): Promise<string> {
    let output = this.transform(input, filename);
    if (this.minify) {
      const transformed =
        (this.minifier!(output, this.options.svgo || {}) as OptimizedSvg)
          .data;
      if (!transformed) return Promise.resolve(``); //TODO: error
      output = transformed;
    }
    output = this.sanitize(output);
    return Promise.resolve(`import { html } from '${this.specifier}';
export const template = html\`${output}\`;
export default template;`);
  }
}
