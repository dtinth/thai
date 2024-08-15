import escape from "lodash-es/escape.js";

export interface HtmlGenerator {
  generateSync(): Iterable<string>;
  generateAsync(): AsyncIterable<string>;
}

class HtmlCode implements HtmlGenerator {
  constructor(private html: string) {}
  *generateSync() {
    yield this.html;
  }
  async *generateAsync() {
    yield this.html;
  }
}

class HtmlEmpty implements HtmlGenerator {
  *generateSync() {}
  async *generateAsync() {}
}

class HtmlTemplate implements HtmlGenerator {
  constructor(
    private strings: TemplateStringsArray,
    private interpolations: HtmlGenerator[]
  ) {}
  *generateSync() {
    for (let i = 0; i < this.strings.length; i++) {
      yield this.strings[i];
      if (i < this.interpolations.length) {
        yield* this.interpolations[i].generateSync();
      }
    }
  }
  async *generateAsync() {
    for (let i = 0; i < this.strings.length; i++) {
      yield this.strings[i];
      if (i < this.interpolations.length) {
        yield* this.interpolations[i].generateAsync();
      }
    }
  }
}

class HtmlArray implements HtmlGenerator {
  constructor(private parts: HtmlGenerator[]) {}
  *generateSync() {
    for (const part of this.parts) {
      yield* part.generateSync();
    }
  }
  async *generateAsync() {
    for (const part of this.parts) {
      yield* part.generateAsync();
    }
  }
}

class HtmlHypertext implements HtmlGenerator {
  constructor(private hypertext: Hypertext) {}
  *generateSync() {
    yield this.hypertext.toHtml();
  }
  async *generateAsync() {
    yield* this.hypertext.toHtmlStream();
  }
}

class HtmlPromise implements HtmlGenerator {
  constructor(private nodePromise: PromiseLike<HtmlGenerator>) {}
  *generateSync() {
    throw new Error(
      "Asynchronous value (Promise) cannot be rendered synchronously"
    );
  }
  async *generateAsync() {
    const node = await this.nodePromise;
    yield* node.generateAsync();
  }
}

class HtmlIterable implements HtmlGenerator {
  constructor(private iterable: Iterable<HtmlGenerator>) {}
  *generateSync() {
    for (const part of this.iterable) {
      yield* part.generateSync();
    }
  }
  async *generateAsync() {
    for (const part of this.iterable) {
      yield* part.generateAsync();
    }
  }
}

class HtmlAsyncIterable implements HtmlGenerator {
  constructor(private asyncIterable: AsyncIterable<HtmlGenerator>) {}
  *generateSync() {
    throw new Error(
      "Asynchronous value (AsyncIterable) cannot be rendered synchronously"
    );
  }
  async *generateAsync() {
    for await (const part of this.asyncIterable) {
      yield* part.generateAsync();
    }
  }
}

function isPromiseLike(x: any): x is PromiseLike<any> {
  return x && typeof x.then === "function";
}

function isIterable(x: any): x is Iterable<any> {
  return x && typeof x[Symbol.iterator] === "function";
}

function isAsyncIterable(x: any): x is AsyncIterable<any> {
  return x && typeof x[Symbol.asyncIterator] === "function";
}

function toHtmlGenerator(html: any): HtmlGenerator {
  if (Array.isArray(html)) {
    return new HtmlArray(html.map((x) => toHtmlGenerator(x)));
  } else if (typeof html === "string") {
    return new HtmlCode(escape(html));
  } else if (html == null) {
    return new HtmlEmpty();
  } else if (html instanceof Hypertext) {
    return new HtmlHypertext(html);
  } else if (isPromiseLike(html)) {
    return new HtmlPromise(html.then(toHtmlGenerator));
  } else if (isAsyncIterable(html)) {
    return new HtmlAsyncIterable({
      [Symbol.asyncIterator]: async function* () {
        for await (const x of html) {
          yield toHtmlGenerator(x);
        }
      },
    });
  } else if (isIterable(html)) {
    return new HtmlIterable({
      [Symbol.iterator]: function* () {
        for (const x of html) {
          yield toHtmlGenerator(x);
        }
      },
    });
  } else if (html.__html) {
    return new HtmlCode(html.__html);
  } else {
    return new HtmlCode(escape(String(html)));
  }
}

/**
 * Use the `html` template tag to safely generate HTML.
 * It returns a `Hypertext` object.
 * You can use the `toHtml` method to get the HTML code.
 * Interpolated values are escaped unless they are
 * @public
 */
export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): Hypertext {
  const htmlGenerator = new HtmlTemplate(
    strings,
    values.map((v) => toHtmlGenerator(v))
  );
  return new Hypertext(htmlGenerator);
}

/**
 * The `Hypertext` class is used to represent HTML code.
 * @public
 */
export class Hypertext {
  /**
   * @internal
   */
  constructor(private htmlGenerator: HtmlGenerator) {}

  /**
   * Create a `Hypertext` object from a value.
   *
   * If the value is a string, it is escaped.
   * If the value is an array, it is recursively converted to HTML.
   * If the value is an object with a `__html` property, it is used as is.
   * If the value is `null` or `undefined`, it is converted to an empty string.
   * Otherwise, it is converted to a string and escaped.
   */
  static from(html: any): Hypertext {
    return new Hypertext(toHtmlGenerator(html));
  }

  /**
   * Get the HTML code.
   */
  toHtml(): string {
    const parts = Array.from(this.htmlGenerator.generateSync());
    return parts.join("");
  }

  /**
   * Get the HTML code.
   * @internal
   */
  get __html() {
    return this.toHtml();
  }

  /**
   * Stream the HTML code.
   */
  async *toHtmlStream() {
    for await (const part of this.htmlGenerator.generateAsync()) {
      yield part;
    }
  }
}

/**
 * The `Html` type represents anything that can be converted to HTML.
 * Use this type in your functions to accept HTML code.
 */
export type Html =
  | Hypertext
  | { __html: string }
  | string
  | number
  | boolean
  | Html[]
  | PromiseLike<Html>
  | Iterable<Html>
  | AsyncIterable<Html>;

/**
 * Convert a value to HTML.
 */
export function renderHtml(html: Html): string {
  return Hypertext.from(html).toHtml();
}

/**
 * Stream the HTML code.
 */
export async function* renderHtmlStream(html: Html): AsyncIterable<string> {
  yield* Hypertext.from(html).toHtmlStream();
}

/**
 * Render the HTML code asynchonously.
 */
export async function renderHtmlAsync(
  html: Html,
  { onPart }: RenderHtmlAsyncOptions = {}
): Promise<string> {
  const parts: string[] = [];
  for await (const part of renderHtmlStream(html)) {
    if (onPart) onPart(part);
    parts.push(part);
  }
  return parts.join("");
}

/**
 * Options for the `renderHtmlAsync` function.
 */
export interface RenderHtmlAsyncOptions {
  /**
   * A callback that is called for each part of the HTML code.
   */
  onPart?: (part: string) => void;
}
