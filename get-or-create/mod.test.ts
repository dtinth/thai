import { expect, it } from "vitest";
import { getOrCreate } from "./mod";

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
