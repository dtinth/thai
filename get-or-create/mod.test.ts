import { expect } from "@std/expect";
import { getOrCreate } from "./mod.ts";

const it = Deno.test;

it("returns existing value if key exists in the map", async () => {
  const map = new Map<string, number>();
  map.set("foo", 42);

  const result = getOrCreate(map, "foo", () => {
    throw new Error("Should not be called");
  });

  expect(result).toBe(42);
});

it("creates and returns new value if key does not exist in the map", async () => {
  const map = new Map<string, number>();

  const result = getOrCreate(map, "foo", (key) => {
    expect(key).toBe("foo");
    return 42;
  });

  expect(result).toBe(42);
  expect(map.get("foo")).toBe(42);
});

it("also works with a WeakMap", async () => {
  const map = new WeakMap<{ x: number }, [number]>();
  const keyA = { x: 1 };
  const keyB = { x: 2 };
  const factory = (v: { x: number }): [number] => [v.x];

  // check result
  expect(getOrCreate(map, keyA, factory)[0]).toBe(1);
  expect(getOrCreate(map, keyB, factory)[0]).toBe(2);

  // check identity
  expect(getOrCreate(map, keyA, factory)).toBe(getOrCreate(map, keyA, factory));
  expect(getOrCreate(map, keyB, factory)).toBe(getOrCreate(map, keyB, factory));
});
