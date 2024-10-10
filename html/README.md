The `@thai/html` package provides the `html` tagged template function that can be used to safely generate HTML code. It also provides functions for rendering HTML code synchronously and asynchronously:

| Function           | Description                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| `renderHtml`       | Synchronously renders HTML to a `string`.                                            |
| `renderHtmlAsync`  | Asynchronously renders HTML, returning a `Promise<string>`.                          |
| `renderHtmlStream` | Asynchronously renders HTML, streaming chunks of HTML as an `AsyncIterable<string>`. |

## Basic usage (synchronous rendering)

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

## Async rendering and streaming

When using `renderHtmlAsync` and `renderHtmlStream`, rendering is done **asynchronously**. In async mode, in addition to ordinary values, you can also interpolate **promises** and **async iterators** into the HTML template. This allows you to fetch data asynchronously and stream the HTML to the client as it is being generated.

Here's an example of using the streaming capabilities with [Elysia](https://elysiajs.com/).

```ts
import { html, renderHtmlStream } from "@thai/html";
import { Elysia } from "elysia";

new Elysia()
  .get("/", async function* ({ set }) {
    set.headers["content-type"] = "text/html; charset=utf-8";
    yield* renderHtmlStream(html`<!DOCTYPE html>
      <html>
        <head>
          <title>Hello, world!</title>
        </head>
        <body>
          <h1>Hello, world!</h1>
          ${renderMainSection()}
          <footer>End of page.</footer>
        </body>
      </html>`);
  })
  .listen(3000);

function renderMainSection() {
  // When rendering in asynchronous mode, promises and async iterators
  // can be embedded directly in the template WITHOUT using `await` or `yield`.
  //
  // This is important because this allows the renderer to go ahead and stream
  // the first portion of the HTML to the client right away, until it
  // encounters a promise or an async iterator.
  //
  // As async functions are eagerly resolved, both `getRandomName` and
  // `getRandomQuote` will start fetching the data in parallel.
  //
  // However, as async generators are lazily evaluated, the `countdown`
  // will not start until the renderer reaches that part of the template.
  //
  return html`<main>
    <section>
      <h2>Random name</h2>
      <p>${getRandomName()}</p>
    </section>
    <section>
      <h2>Random quote</h2>
      ${getRandomQuote()}
    </section>
    <section>
      <h2>Countdown</h2>
      ${countdown()}
    </section>
  </main>`;
}

async function getRandomName() {
  const response = await fetch(
    "https://fakerapi.it/api/v2/persons?_quantity=1"
  ).then((r) => r.json());
  const person = response.data[0];
  return `${person.firstname} ${person.lastname}`;
}

async function getRandomQuote() {
  const response = await fetch(
    "https://fakerapi.it/api/v2/texts?_quantity=1"
  ).then((r) => r.json());
  const quote = response.data[0];
  return html`<blockquote>
    <q>${quote.content}</q>
    <cite>—${quote.author}</cite>
  </blockquote>`;
}

async function* countdown() {
  yield html`<p>Countdown:</p> `;
  for (let i = 10; i >= 1; i--) {
    yield html`${i}... `;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  yield html`<strong>Liftoff!</strong></p>`;
}
```
