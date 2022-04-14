import type { PluginBuild } from "esbuild";

export interface LoaderOptions {
  extension?: RegExp;
  minify?: boolean;
  transform?: (input: string) => string;
}

export abstract class AssetLoader {
  abstract extension: RegExp;
  minify = false;
  sourcemap = false;
  transform = (input: string) => input;

  constructor(
    public build: PluginBuild,
    public options: LoaderOptions,
    public specifier = "lit",
    public minifier?: unknown,
  ) {}

  sanitize(input: string): string {
    return input.replace(/(\$\{|`)/g, "\\$1");
  }

  toSourceMapURL(map: string) {
    return "\n" +
      `//# sourceMappingURL=data:application/json;base64,${
        Buffer.from(map).toString("base64")
      }`;
  }

  abstract load(input: string, file: string): string;
}
