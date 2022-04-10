import type { parse, tNode } from "txml/dist/txml";
import { AssetLoader } from "./asset-loader";

export class XLFLoader extends AssetLoader {
  extension = /\.xlf$/;
  declare minifier?: typeof parse;

  load(input: string): string {
    const units: Record<string, string> = {};
    let output = this.transform(input);
    if (!this.minifier) return output; // TODO: throw?
    const nodes = this.minifier(output, {
      filter: (node) => node.tagName === "trans-unit",
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
          const partId: string = part.attributes["id"];
          const text: string = part.attributes["equiv-text"];
          strings.push(this.decodePart(text, partId));
        }
      }
      messages.push(this.formatMessage(id, strings, hasExpression));
    }
    return `import { html } from '${this.specifier}';
export const templates = {
${messages.join(",")}
}`;
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
