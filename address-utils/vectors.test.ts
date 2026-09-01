import test from "node:test";
import assert from "node:assert/strict";
import { formatAddress, parseAddress, relabelSubdivisions } from "./mod.ts";
import { ADDRESS_VECTORS } from "./vectors.ts";

test("the vectors agree with this package", () => {
  assert.ok(ADDRESS_VECTORS.length >= 20);
  for (const vector of ADDRESS_VECTORS) {
    const result = parseAddress(vector.text);
    assert.deepEqual(result.address, vector.parse.address, vector.name);
    assert.deepEqual(
      result.warnings.map((warning) => warning.code),
      vector.parse.warnings,
      vector.name,
    );
    assert.equal(formatAddress(result.address), vector.format, vector.name);
    assert.equal(relabelSubdivisions(vector.text), vector.relabel, vector.name);
  }
});

test("each vector has a different name", () => {
  const names = new Set(ADDRESS_VECTORS.map((vector) => vector.name));
  assert.equal(names.size, ADDRESS_VECTORS.length);
});
