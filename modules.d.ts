declare module "*.css" {
  import type { CSSResult } from "lit";
  export const styles: CSSResult;
  export default styles;
}

declare module "*.svg" {
  import type { HTMLTemplateResult } from "lit";
  export const template: HTMLTemplateResult;
  export default template;
}

declare module "*.html" {
  import type { HTMLTemplateResult } from "lit";
  export const template: HTMLTemplateResult;
  export default template;
}

declare module "*.xlf" {
  import type { HTMLTemplateResult } from "lit";
  export const templates: Map<string, string | HTMLTemplateResult>;
}
