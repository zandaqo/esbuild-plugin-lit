import type { parseXML, PluginBuild, tNode } from "./deps.ts";
import { AssetLoader, LoaderOptions } from "./asset-loader.ts";

export class XLFLoader extends AssetLoader {
  extension = /\.xlf$/;
  minify = true;
  declare minifier?: typeof parseXML;

  constructor(
    build: PluginBuild,
    options: LoaderOptions = {},
    specifier = "lit",
    minifier?: typeof parseXML,
  ) {
    super(build, options, specifier, minifier);
    if (options.extension) this.extension = options.extension;
    if (options.transform) this.transform = options.transform;
  }

  load(input: string, filename: string): Promise<string> {
    const output = this.transform(input, filename);
    if (!this.minifier) return Promise.resolve(output); // TODO: throw?
    const nodes = this.minifier(output, {
      filter: (node: tNode) => node.tagName === "trans-unit",
      keepWhitespace: true,
    }) as Array<tNode>;
    const messages: Array<string> = [];
    for (const unit of nodes) {
      const { id } = unit.attributes as Record<string, string | undefined>;
      if (!id) continue; //TODO: throw?
      const target = unit.children.find((node) =>
        (node as tNode).tagName === "target"
      );
      if (!target) continue; //not translated
      const parts = (target as tNode).children;
      if (!parts.length) continue; //empty translation
      const strings: Array<string> = [];
      let hasExpression = false;
      for (const part of parts) {
        if (typeof part === "string") {
          strings.push(part);
        } else if (part.tagName === "x") {
          hasExpression = true;
          const partId = (part.attributes as { id: string })["id"];
          const text =
            (part.attributes as { "equiv-text": string })["equiv-text"];
          strings.push(this.decodePart(text, partId));
        }
      }
      messages.push(this.formatMessage(id, strings, hasExpression));
    }
    return Promise.resolve(`import { html } from '${this.specifier}';
export const templates = {${messages.join(",")}};`);
  }

  decodePart(encoded: string, id: string) {
    return encoded
      .replace(/\$\{.*?\}/g, `\${${id}}`)
      .replace(
        /&amp;|&lt;|&gt;|&#39;|&quot;/g,
        (tag) => ({
          "&amp;": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&#39;": "'",
          "&quot;": '"',
        }[tag] || tag),
      );
  }

  formatMessage(id: string, strings: Array<string>, hasExpression: boolean) {
    return hasExpression
      ? `"${id}": html\`${strings.join("")}\``
      : `"${id}": \`${strings.join("")}\``;
  }
}
