import { test } from "node:test";
import assert from "node:assert/strict";
import { html, renderHtml, renderHtmlAsync, renderHtmlStream } from "./html.ts";

test("converts strings", () => {
  assert.equal(renderHtml("meow"), "meow");
});

test("converts numbers", () => {
  assert.equal(renderHtml(42), "42");
});

test("converts booleans", () => {
  assert.equal(renderHtml(true), "true");
  assert.equal(renderHtml(false), "false");
});

test("escapes strings", () => {
  assert.equal(renderHtml("<b>"), "&lt;b&gt;");
});

test("does not escape tagged hypertext", () => {
  assert.equal(renderHtml(html`<br />`), "<br />");
});

test("concatenates arrays", () => {
  assert.equal(renderHtml(["one", "two", "three"]), "onetwothree");
});

test("escapes interpolated values", () => {
  assert.equal(renderHtml(html`<${"<>"}></${"<>"}>`), "<&lt;&gt;></&lt;&gt;>");
});

test("renders null as an empty string", () => {
  assert.equal(renderHtml(html`${null}`), "");
});

test("renders undefined as an empty string", () => {
  assert.equal(renderHtml(html`${undefined}`), "");
});

test("keeps hypertext as is", () => {
  const a = html`<>`;
  assert.equal(renderHtml(html`${a}`), "<>");
});

test("renders __html properties as is", () => {
  assert.equal(renderHtml({ __html: "<>" }), "<>");
});

test("renders promise", async () => {
  assert.equal(
    await renderHtmlAsync(html`x = ${Promise.resolve(42)}`),
    "x = 42"
  );
});

test("renders generator", async () => {
  function* stuff() {
    yield 42;
  }
  assert.equal(await renderHtmlAsync(html`x = ${stuff()}`), "x = 42");
});

test("renders async generator", async () => {
  async function* stuff() {
    yield 42;
  }
  assert.equal(await renderHtmlAsync(html`x = ${stuff()}`), "x = 42");
});

test("streams", async () => {
  async function loadTodoIds() {
    return ["todo1", "todo2", "todo3"];
  }
  async function todo(id: string) {
    return html`<li>${id}</li>`;
  }
  async function todos() {
    const todos = await loadTodoIds();
    return todos.map((id) => todo(id));
  }
  const parts: string[] = [];
  for await (const part of renderHtmlStream(
    html`<ul>
      ${todos()}
    </ul>`
  )) {
    parts.push(part);
  }
  assert.equal(
    parts.join("").replace(/\s+/g, ""),
    "<ul><li>todo1</li><li>todo2</li><li>todo3</li></ul>"
  );
});
