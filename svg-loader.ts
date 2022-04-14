import { AssetLoader, LoaderOptions } from "./asset-loader";
import type { optimize, OptimizedSvg, OptimizeOptions } from "svgo";
import type { PluginBuild } from "esbuild";

type SVGLoaderOptions = LoaderOptions & {
  svgo?: OptimizeOptions;
};

export class SVGLoader extends AssetLoader {
  extension = /\.svg$/;
  declare options: SVGLoaderOptions;
  declare minifier?: typeof optimize;

  constructor(
    build: PluginBuild,
    options: SVGLoaderOptions = {},
    specifier = "lit",
    minifier?: typeof optimize,
  ) {
    super(build, options, specifier, minifier);
    if (options.extension) this.extension = options.extension;
    if (options.transform) this.transform = options.transform;
    this.minify = build.initialOptions.minify && options.minify !== false &&
      !!this.minifier;
  }

  load(input: string): string {
    let output = this.transform(input);
    if (this.minify) {
      const transformed =
        (this.minifier(output, this.options.svgo || {}) as OptimizedSvg)
          .data;
      if (!transformed) return ``; //TODO: error
      output = transformed;
    }
    output = this.sanitize(output);
    return `import { html } from '${this.specifier}';
export const template = html\`${output}\`;
export default template;`;
  }
}
