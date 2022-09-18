# esbuild-plugin-lit

[![npm](https://img.shields.io/npm/v/esbuild-plugin-lit.svg?style=flat-square)](https://www.npmjs.com/package/esbuild-plugin-lit)

A plugin for [esbuild](https://esbuild.github.io/) that allows importing CSS,
SVG, HTML, XLIFF files as tagged-template literals. The files are (optionally)
minified using esbuild minifier (for CSS), `html-minifier` (for HTML), and
[svgo](https://github.com/svg/svgo) (for SVG).

## Installation

```bash
npm i esbuild-plugin-lit -D
```

## Usage

Include plugin in your build script:

```js
const { default: litPlugin } = require("esbuild-plugin-lit");

require("esbuild").build({
  entryPoints: ["index.ts"],
  bundle: true,
  outfile: "index.js",
  minify: true,
  plugins: [litPlugin()],
});
```

Now you can import CSS, SVG, HTML files as tagged-template literals:

```typescript
import styles from 'styles.css';
import icon from 'icon.svg';

class SpecialButton extends LitElement {
  static styles = styles;
  ...
  render() {
    return html`
      <button>
        <span class="icon">${icon}</span>
      </button>
    `
  }
}
```

## TypeScript

For TypeScript support, include ambient module types in your config file:

```json
{
  "include": ["./node_modules/esbuild-plugin-lit/modules.d.ts"]
}
```

## Customization & Loading SASS, LESS, etc.

The plugin supports setting custom file extensions and transformation for each
imported types, for example, the following with load SASS files:

```js
const { default: litPlugin } = require("esbuild-plugin-lit");
const SASS = require("sass");

require("esbuild").build({
  ...
  plugins: [litPlugin(
    {
      // augment the global filter
      filter: /\.(css|svg|html|xlf|scss)$/,
      css: {
        // specify extension for css
        extension: /\.s?css$/,
        transform: (data) => Sass.renderSync({ data }).css.toString(),
      },
    },
  )],
});
```

## Minification

If minification is set for esbuild (`minify: true`), the plugin will minify
imported CCS files using esbuild's built-in minifier. You can set
`minify: false` in settings for CSS to opt-out from minification:

```js
require("esbuild").build({
  ...
  plugins: [litPlugin({
    css: {
      minify: false,
    },
  })],
});
```

To minify SVG and HTML files, the plugin uses `svgo` and `html-minifier`
packages respectively, so make sure they are installed if such minification is
required:

```bash
npm i svgo -D
npm i html-minifier -D
```

Then supply the minifiers' options to the plugin:

```js
require("esbuild").build({
  ...
  minify: true,
  plugins: [litPlugin({
    svg: {
      svgo: {
        plugins: [
          "preset-default",
          "removeXMLNS",
        ],
      },
    },
    html: {
      htmlMinifier: {}, // use the default options
    },
  })],
});
```

## Loading XLIFF localization files

Lit provides `lit-localize` package for localization purposes. When used in the
so-called runtime mode, the package relies on a set of rollup based tools to
extract messages from templates into XLIFF localization files
(`lit-localize extract`), and to later compile them into "importable" JS files
using `lit-localize build`.

With `esbuild-plugin-lit` one can skip the build step and "load" XLIFF files
directly as shown in our
[example](https://github.com/zandaqo/esbuild-plugin-lit/examples/hello) project:

```js
...
// Load xliff files statically
import * as ce from "./xliff/ce.xlf";
import * as es from "./xliff/es.xlf";

const locales = new Map(
  [["ce", ce], ["es", es]],
);

const { setLocale } = configureLocalization({
  sourceLocale: "en",
  targetLocales: ["ce", "es"],
  loadLocale: async (locale) => locales.get(locale),
});
...
```

The files are compiled on the fly by esbuild, thus, simplifying the toolchain
and speeding up the process.

To load XLIFF files, install `tmxl`:

```bash
npm i txml -D
```

And set `xlf` option:

```js
require("esbuild").build({
  ...
  loader: {
    ".xlf": "text",
  },
  plugins: [litPlugin({
    xlf: {}, // use default settings
  })],
});
```

## Using with Deno

The plugin also supports building with Deno:

```ts
import * as esbuild from "https://deno.land/x/esbuild@v0.15.7/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts";
import pluginLit from "https://raw.githubusercontent.com/zandaqo/esbuild-plugin-lit/master/mod.ts";

await esbuild
  .build({
    plugins: [
      pluginLit({
        specifier: "https://cdn.skypack.dev/lit@2.3.1?dts",
      }),
      denoPlugin(),
    ],
    entryPoints: ["./main.ts"],
    outfile: "./main.js",
    target: "es2022",
    format: "esm",
    bundle: true,
    minify: true,
    sourcemap: true,
  });

esbuild.stop();
```

Though, keep in mind that Deno
[does not support](https://github.com/denoland/deno/issues/15132) ambient module
typing (`declare module`) and each asset import has to be typed using
`// @deno-types`.

## LICENSE

MIT @ Maga D. Zandaqo
