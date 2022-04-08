import type { PluginBuild } from "esbuild";
import { AssetLoader } from "./asset-loader";

export class CSSLoader extends AssetLoader {
  extension = /\.css$/;
  declare minifier?: PluginBuild;

  load(input: string): string {
    let output = this.transform(input);
    if (this.minifier) {
      output = this.minifier.esbuild.transformSync(output, {
        loader: "css",
        minify: true,
      }).code;
    }
    output = this.sanitize(output);
    return `import { css } from '${this.specifier}';
export const styles = css\`${output}\`;
export default styles;`;
  }
}
