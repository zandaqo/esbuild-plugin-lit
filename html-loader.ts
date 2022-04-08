import { AssetLoader } from "./asset-loader";

export class HTMLLoader extends AssetLoader {
  extension = /\.html/;

  load(input: string): string {
    let output = this.transform(input);
    output = this.sanitize(input);
    return `import { html } from '${this.specifier}';
export const template = html\`${output}\`;
export default template;`;
  }
}
