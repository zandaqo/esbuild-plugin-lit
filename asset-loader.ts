export abstract class AssetLoader {
  constructor(
    public extension: RegExp,
    public specifier = "lit",
    public transform = (input: string): string => input,
    public minifier?: unknown,
    public minifierOptions?: unknown,
  ) {}

  sanitize(input: string): string {
    return input.replace(/(\$\{|`)/g, "\\$1");
  }

  abstract load(input: string): string;
}
