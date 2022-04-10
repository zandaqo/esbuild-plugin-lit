import { AssetLoader } from "./asset-loader";
import type { Options as HTMLMinifierOptions } from "html-minifier";

export class HTMLLoader extends AssetLoader {
  extension = /\.html/;
  declare minifier?: (text: string, options: HTMLMinifierOptions) => string;
  declare minifierOptions?: HTMLMinifierOptions;

  load(input: string): string {
    let output = this.transform(input);
    if (this.minifier) {
      output = this.minifier(output, this.minifierOptions);
    }
    output = output = this.sanitize(input);
    return `import { html } from '${this.specifier}';
export const template = html\`${output}\`;
export default template;`;
  }
}
