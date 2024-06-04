The `@thai/html` package provides the `html` tagged template function
that can be used to safely generate HTML code.

## Usage

```ts
import { html, renderHtml } from "@thai/html";

// Strings are escaped
console.log(renderHtml("<>")); // "&lt;&gt;"

// Numbers and booleans are converted to strings
console.log(renderHtml(42)); // "42"
console.log(renderHtml(true)); // "true"

// HTML code can be generated using the `html` tagged template function
console.log(renderHtml(html`<b>${"<>"}</b>`)); // "<b>&lt;&gt;</b>"

// Arrays are concatenated
console.log(renderHtml(["one", "two", "three"])); // "onetwothree"

// `null` and `undefined` are converted to an empty string
console.log(renderHtml(html`${null}`)); // ""
```
