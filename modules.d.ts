declare module "*.css" {
  import { CSSResult } from "lit";
  const css: CSSResult;
  export default css;
}

declare module "*.svg" {
  import { HTMLTemplateResult } from "lit";
  const svg: HTMLTemplateResult;
  export default svg;
}

declare module "*.html" {
  import { HTMLTemplateResult } from "lit";
  const html: HTMLTemplateResult;
  export default html;
}

declare module "*.xlf" {
  import { HTMLTemplateResult } from "lit";
  export const templates: Map<string, string | HTMLTemplateResult>;
}
