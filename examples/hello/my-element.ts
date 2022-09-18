/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { html, LitElement } from "lit";
import { configureLocalization, localized, msg } from "@lit/localize";
import { customElement, property } from "lit/decorators.js";

// Load assets as tagged-template literals
import styles from "./my-element.css";
import ceFlag from "./graphics/ce.svg";
import enFlag from "./graphics/en.svg";
import esFlag from "./graphics/es.svg";
import htmlPart from "./part.html";

// Load xliff files statically
import * as ce from "./xliff/ce.xlf";
import * as es from "./xliff/es.xlf";

const locales = new Map(
  [["ce", ce], ["es", es]],
);

const { setLocale } = configureLocalization({
  sourceLocale: "en",
  targetLocales: ["ce", "es"],
  loadLocale: async (locale) => locales.get(locale) as any,
});

@localized()
@customElement("my-element")
export class MyElement extends LitElement {
  static styles = styles;
  static langData = [
    ["en", enFlag],
    ["es", esFlag],
    ["ce", ceFlag],
  ] as const;

  @property()
  langId = 0;

  @property()
  name = "World";

  render() {
    return html`
       <h1>
         <span>${MyElement.langData[this.langId][1]}</span>
         ${msg(html`Hello, ${this.name}!`)}
       </h1>
       <button @click=${this.onLanguageChange} part="button">
         ${msg("Click the button!")}
       </button>
       ${htmlPart}
     `;
  }

  onLanguageChange() {
    const id = (this.langId + 1) % MyElement.langData.length;
    const locale = MyElement.langData[id][0];
    this.langId = id;
    setLocale(locale);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
