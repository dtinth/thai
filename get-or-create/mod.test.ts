import { test } from "node:test";
import assert from "node:assert/strict";
import { getOrCreate } from "./mod.ts";

test("returns existing value if key exists in the map", () => {
  const map = new Map<string, number>();
  map.set("foo", 42);

  const result = getOrCreate(map, "foo", () => {
    throw new Error("Should not be called");
  });

  assert.equal(result, 42);
});

test("creates and returns new value if key does not exist in the map", () => {
  const map = new Map<string, number>();

  const result = getOrCreate(map, "foo", (key) => {
    assert.equal(key, "foo");
    return 42;
  });

  assert.equal(result, 42);
  assert.equal(map.get("foo"), 42);
});

test("also works with a WeakMap", () => {
  const map = new WeakMap<{ x: number }, [number]>();
  const keyA = { x: 1 };
  const keyB = { x: 2 };
  const factory = (v: { x: number }): [number] => [v.x];

  // check result
  assert.equal(getOrCreate(map, keyA, factory)[0], 1);
  assert.equal(getOrCreate(map, keyB, factory)[0], 2);

  // check identity
  assert.equal(getOrCreate(map, keyA, factory), getOrCreate(map, keyA, factory));
  assert.equal(getOrCreate(map, keyB, factory), getOrCreate(map, keyB, factory));
});
