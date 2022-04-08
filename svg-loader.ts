import { AssetLoader } from "./asset-loader";
import type { optimize, OptimizedSvg, OptimizeOptions } from "svgo";

export class SVGLoader extends AssetLoader {
  extension = /\.svg$/;
  declare minifier?: typeof optimize;
  declare minifierOptions?: OptimizeOptions;

  load(input: string): string {
    let output = this.transform(input);
    if (this.minifier) {
      const transformed =
        (this.minifier(output, this.minifierOptions || {}) as OptimizedSvg)
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
