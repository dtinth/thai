import { expect } from "@std/expect";
import { html, renderHtml, renderHtmlAsync, renderHtmlStream } from "./html.ts";

const it = Deno.test;

it("converts strings", async () => {
  expect(renderHtml("meow")).toBe("meow");
});

it("converts numbers", async () => {
  expect(renderHtml(42)).toBe("42");
});

it("converts booleans", async () => {
  expect(renderHtml(true)).toBe("true");
  expect(renderHtml(false)).toBe("false");
});

it("escapes strings", async () => {
  expect(renderHtml("<b>")).toBe("&lt;b&gt;");
});

it("does not escape tagged hypertext", async () => {
  expect(renderHtml(html`<br />`)).toBe("<br />");
});

it("concatenates arrays", async () => {
  expect(renderHtml(["one", "two", "three"])).toBe("onetwothree");
});

it("escapes interpolated values", async () => {
  expect(renderHtml(html`<${"<>"}></${"<>"}>`)).toBe("<&lt;&gt;></&lt;&gt;>");
});

it("renders null as an empty string", async () => {
  expect(renderHtml(html`${null}`)).toBe("");
});

it("renders undefined as an empty string", async () => {
  expect(renderHtml(html`${undefined}`)).toBe("");
});

it("keeps hypertext as is", async () => {
  const a = html`<>`;
  expect(renderHtml(html`${a}`)).toBe("<>");
});

it("renders __html properties as is", async () => {
  expect(renderHtml({ __html: "<>" })).toBe("<>");
});

it("renders promise", async () => {
  expect(await renderHtmlAsync(html`x = ${Promise.resolve(42)}`)).toBe(
    "x = 42"
  );
});

it("renders generator", async () => {
  function* stuff() {
    yield 42;
  }
  expect(await renderHtmlAsync(html`x = ${stuff()}`)).toBe("x = 42");
});

it("renders async generator", async () => {
  async function* stuff() {
    yield 42;
  }
  expect(await renderHtmlAsync(html`x = ${stuff()}`)).toBe("x = 42");
});

it("streams", async () => {
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
  expect(parts.join("").replace(/\s+/g, "")).toBe(
    "<ul><li>todo1</li><li>todo2</li><li>todo3</li></ul>"
  );
});
