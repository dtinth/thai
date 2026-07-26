import { test } from "node:test";
import assert from "node:assert/strict";
import { carify } from "./mod.ts";

const testData = new TextEncoder().encode(
  `<meta http-equiv="refresh" content="0; url=https://youtu.be/dQw4w9WgXcQ" />\n`
);

test("should generate a car file", async () => {
  const result = await carify(testData, "hello.html");
  assert.equal(
    result.cid,
    "bafybeignkhelrt2ndg57sn7elg5eiaqkdtytrndjsutunlq6ye5unstnla"
  );

  const carStream = result.createCarStream();
  const carChunks = await Array.fromAsync(carStream);
  const carBuffer = await new Blob(
    carChunks.map((chunk) => new Uint8Array(chunk))
  ).arrayBuffer();
  const carHash = await crypto.subtle.digest("SHA-1", carBuffer);

  const carHashHex = Array.from(new Uint8Array(carHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  assert.equal(carHashHex, "3ccadd74afbac9e1295b6a94ad4ff062169ab638");
});

test("should generate a car for empty file", async () => {
  const emptyFile = new Uint8Array();
  const filename = "empty.txt";
  const result = await carify(emptyFile, filename);
  assert.equal(
    result.cid,
    "bafybeid76eyswbhp3f7zrgvkelbpsyoqoa4qzprhraibj6y7cvi7oh2bzq"
  );
});
