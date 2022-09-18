import { AssetLoader, LoaderOptions } from "./asset-loader.ts";
import type { HTMLMinifierOptions, PluginBuild } from "./deps.ts";

type HTMLMinifier = (text: string, options?: HTMLMinifierOptions) => string;
type HTMLLoaderOptions = LoaderOptions & {
  htmlMinifier?: HTMLMinifierOptions;
};

export class HTMLLoader extends AssetLoader {
  extension = /\.html/;
  declare options: HTMLLoaderOptions;
  declare minifier?: HTMLMinifier;

  constructor(
    build: PluginBuild,
    options: HTMLLoaderOptions = {},
    specifier = "lit",
    minifier?: HTMLMinifier,
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
      output = this.minifier!(output, this.options.htmlMinifier);
    }
    output = output = this.sanitize(input);
    return Promise.resolve(`import { html } from '${this.specifier}';
export const template = html\`${output}\`;
export default template;`);
  }
}
