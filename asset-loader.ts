import type { PluginBuild } from "./deps.ts";
import { Buffer } from "https://deno.land/std@0.155.0/node/buffer.ts";

export interface LoaderOptions {
  extension?: RegExp;
  minify?: boolean;
  transform?: (input: string, filename?: string) => string;
}

export abstract class AssetLoader {
  abstract extension: RegExp;
  minify = false;
  sourcemap = false;
  transform = (input: string, _filename?: string) => input;

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

  abstract load(input: string, file: string): Promise<string>;
}
