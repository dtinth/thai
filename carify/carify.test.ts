import { expect } from "@std/expect";
import { carify } from "./mod.ts";

const it = Deno.test;

const testData = new TextEncoder().encode(
  `<meta http-equiv="refresh" content="0; url=https://youtu.be/dQw4w9WgXcQ" />\n`
);

it("should generate a car file", async () => {
  const result = await carify(testData, "hello.html");
  expect(result.cid).toBe(
    "bafybeignkhelrt2ndg57sn7elg5eiaqkdtytrndjsutunlq6ye5unstnla"
  );

  const carStream = result.createCarStream() as AsyncIterable<Uint8Array>;
  const carParts: ArrayBuffer[] = [];
  for await (const chunk of carStream) {
    carParts.push(chunk.slice().buffer);
  }
  const carBuffer = await new Blob(carParts).arrayBuffer();
  const carHash = await crypto.subtle.digest("SHA-1", carBuffer);

  const carHashHex = Array.from(new Uint8Array(carHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  expect(carHashHex).toBe("3ccadd74afbac9e1295b6a94ad4ff062169ab638");
});

it("should generate a car for empty file", async () => {
  const emptyFile = new Uint8Array();
  const filename = "empty.txt";
  const result = await carify(emptyFile, filename);
  expect(result.cid).toBe(
    "bafybeid76eyswbhp3f7zrgvkelbpsyoqoa4qzprhraibj6y7cvi7oh2bzq"
  );
});
