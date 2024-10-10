import { assertSnapshot } from "@std/testing/snapshot";
import { stringify } from "./mod.ts";

const it = Deno.test;

it("stringifies JSON with comma-first styling", async (t) => {
  const object = {
    emptyString: "",
    nonEmptyString: "Hello, world!",
    number: 42,
    decimal: 3.14159,
    boolean: true,
    null: null,
    emptyArray: [],
    nonEmptyArray: [1, 2, 3, 4, 5],
    mixedArray: [1, "two", 3.0, false, null],
    nestedArray: [1, [2, [3, [4]]]],
    arrayWithObjects: [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ],
    objectWithArray: {
      fruits: ["apple", "banana", "cherry"],
      count: 3,
    },
    nestedObject: {
      level1: {
        level2: {
          level3: {
            deep: "nested",
          },
        },
      },
    },
    complexObject: {
      id: 1001,
      info: {
        personal: {
          name: "John Doe",
          age: 35,
          hobbies: ["reading", "swimming"],
        },
        professional: {
          title: "Software Engineer",
          experience: 10,
          skills: ["JavaScript", "Python", "C++"],
        },
      },
      contact: [
        {
          type: "email",
          value: "john.doe@example.com",
        },
        {
          type: "phone",
          value: "+1-555-1234",
        },
      ],
      active: true,
    },
    emptyObject: {},
  };
  const result = stringify(object);
  await assertSnapshot(t, result);
});
