# esbuild-plugin-lit

[![npm](https://img.shields.io/npm/v/esbuild-plugin-lit.svg?style=flat-square)](https://www.npmjs.com/package/esbuild-plugin-lit)

A plugin for [esbuild]() that allows importing CSS, SVG, HTML files as
tagged-template literals. The files are (optionally) minified using esbuild
minifier (for CSS) and [svgo]() (for SVG).

## Usage

```bash
npm i esbuild-plugin-lit -D

# an optional peer dependency to minify SVG files
npm i svgo -D
```

Include plugin in your build script:

```js
const litPlugin = require("esbuild-plugin-lit");

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

For TypeScript support, include ambient module types in your config file:

```json
{
  "include": [".node_modules/esbuild-plugin-lit/modules.d.ts"]
}
```

If minification is set for esbuild (`minify: true`), the plugin will minify
imported CSS files using esbuild's built-in minifier. If `svgo` is installed, it
will also minify SVG files using `svgo`, custom options for svgo can also be
supplied:

```js
require("esbuild").build({
  entryPoints: ["index.ts"],
  bundle: true,
  outfile: "index.js",
  minify: true,
  plugins: [litPlugin({
    svgOptions: {
      plugins: [
        "preset-default",
        "removeXMLNS",
      ],
    },
  })],
});
```

## LICENSE

MIT @ Maga D. Zandaqo
