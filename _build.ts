import {
  build,
  emptyDir,
} from "https://raw.githubusercontent.com/denoland/dnt/0.30.0/mod.ts";
import packageJson from "./package.json" assert { type: "json" };

await emptyDir("npm");

packageJson.version = Deno.args[0];

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  typeCheck: false,
  test: false,
  declaration: true,
  scriptModule: "cjs",
  compilerOptions: {
    target: "Latest",
    sourceMap: true,
    inlineSources: true,
  },
  mappings: {
    "https://raw.githubusercontent.com/esbuild/deno-esbuild/main/mod.d.ts": {
      name: "esbuild",
      version: "^0.15.12",
      peerDependency: true,
    },
    "https://cdn.skypack.dev/html-minifier?dts": {
      name: "html-minifier",
      version: "^4.0.0",
      peerDependency: true,
    },
    "https://cdn.skypack.dev/svgo?dts": {
      name: "svgo",
      version: "^3.0.0",
      peerDependency: true,
    },
    "https://cdn.skypack.dev/txml?dts": {
      name: "txml",
      version: "^5.1.1",
      peerDependency: true,
    },
    "https://raw.githubusercontent.com/TobiasNickel/tXml/master/tXml.d.ts": {
      name: "txml",
      version: "^5.1.1",
      subPath: "tXml.d.ts",
      peerDependency: true,
    },
  },
  shims: {
    deno: false,
    timers: false,
  },
  package: packageJson,
});

Deno.copyFileSync("modules.d.ts", "npm/modules.d.ts");

Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
