import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { testCases } from "./testsUtils";

describe("SqlStorage", () => {
  for (const testCase of testCases) {
    test(testCase.name, async () => {
      testCase.run({
        createDb: () => new Database(),
        assertEquals: (actual, expected) => {
          expect(actual).toEqual(expected);
        },
        assertNull: (value) => {
          expect(value).toBeNull();
        },
      });
    });
  }
});
