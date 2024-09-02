// Run with --experimental-strip-types --experimental-sqlite
import assert from "node:assert";
import { DatabaseSync } from "node:sqlite";
import test, { describe } from "node:test";
import { testCases } from "./testsUtils.ts";

describe("SqlStorage", () => {
  for (const testCase of testCases) {
    test(testCase.name, async () => {
      testCase.run({
        createDb: () => new DatabaseSync(":memory:"),
        assertEquals: (actual, expected) => {
          assert.deepEqual(actual, expected);
        },
        assertNull: (value) => {
          assert.equal(value, null);
        },
      });
    });
  }
});
