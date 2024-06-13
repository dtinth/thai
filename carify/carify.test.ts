import { expect, it } from "vitest";
import { carify } from "./mod.ts";

const testData = new TextEncoder().encode(
  `<meta http-equiv="refresh" content="0; url=https://youtu.be/dQw4w9WgXcQ" />\n`
);

it("should generate a car file", async () => {
  const result = await carify(testData, "hello.html");
  expect(result.cid).toBe(
    "bafybeignkhelrt2ndg57sn7elg5eiaqkdtytrndjsutunlq6ye5unstnla"
  );

  const carStream = result.createCarStream();
  const carBuffer = await new Response(carStream as any).arrayBuffer();
  const carHash = await crypto.subtle.digest("SHA-1", carBuffer);

  const carHashHex = Array.from(new Uint8Array(carHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  expect(carHashHex).toBe("3ccadd74afbac9e1295b6a94ad4ff062169ab638");
});
