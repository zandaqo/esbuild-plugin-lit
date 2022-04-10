# esbuild-plugin-lit

[![npm](https://img.shields.io/npm/v/esbuild-plugin-lit.svg?style=flat-square)](https://www.npmjs.com/package/esbuild-plugin-lit)

A plugin for [esbuild](https://esbuild.github.io/) that allows importing CSS,
SVG, HTML, XLIFF files as tagged-template literals. The files are (optionally)
minified using esbuild minifier (for CSS), `html-minifier` (for HTML), and
[svgo](https://github.com/svg/svgo) (for SVG).

## Installation

```bash
npm i esbuild-plugin-lit -D

# an optional peer dependency to minify SVG files
npm i svgo -D

# an optional peer dependency to load XLIFF localization files
npm i txml -D
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
  entryPoints: ["index.ts"],
  bundle: true,
  outfile: "index.js",
  minify: true,
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
imported CCS files using esbuild's built-in minifier. If `svgo` is installed, it
will also minify SVG files using `svgo`, custom options for svgo can also be
supplied. Set `minify: false` to opt-out from minification of a specific file
type:

```js
require("esbuild").build({
  entryPoints: ["index.ts"],
  bundle: true,
  outfile: "index.js",
  minify: true,
  plugins: [litPlugin({
    css: {
      minify: false,
    }
    svg: {
      svgo: {
        plugins: [
          "preset-default",
          "removeXMLNS",
        ],
      },
    },
  })],
});
```

## Loading XLIFF localization files

Lit provides `lit-localize` package for localization purposes. When used in the
so-called runtime mode, the package relies on a set of rollup based tools to
extract messages from templates into XLIFF localization files
(`lit-localize extract`), and to later compile them into "importable" JS files
using `lit-localize build`. With `esbuild-plugin-lit` one can skip the build
step and "load" XLIFF files directly as shown in our
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

## LICENSE

MIT @ Maga D. Zandaqo
