import { test } from "node:test";
import assert from "node:assert/strict";
import { stringify } from "./mod.ts";

test("stringifies JSON with comma-first styling", () => {
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
  assert.equal(
    result,
    "\n{\t\"emptyString\": \"\"\n,\t\"nonEmptyString\": \"Hello, world!\"\n,\t\"number\": 42\n,\t\"decimal\": 3.14159\n,\t\"boolean\": true\n,\t\"null\": null\n,\t\"emptyArray\": []\n,\t\"nonEmptyArray\":\n\t[\t1\n\t,\t2\n\t,\t3\n\t,\t4\n\t,\t5\n\t]\n,\t\"mixedArray\":\n\t[\t1\n\t,\t\"two\"\n\t,\t3\n\t,\tfalse\n\t,\tnull\n\t]\n,\t\"nestedArray\":\n\t[\t1\n\t,\t[\t2\n\t\t,\t[\t3\n\t\t\t,\t[\t4\n\t\t\t\t]\n\t\t\t]\n\t\t]\n\t]\n,\t\"arrayWithObjects\":\n\t[\t{\t\"name\": \"Alice\"\n\t\t,\t\"age\": 30\n\t\t}\n\t,\t{\t\"name\": \"Bob\"\n\t\t,\t\"age\": 25\n\t\t}\n\t]\n,\t\"objectWithArray\":\n\t{\t\"fruits\":\n\t\t[\t\"apple\"\n\t\t,\t\"banana\"\n\t\t,\t\"cherry\"\n\t\t]\n\t,\t\"count\": 3\n\t}\n,\t\"nestedObject\":\n\t{\t\"level1\":\n\t\t{\t\"level2\":\n\t\t\t{\t\"level3\":\n\t\t\t\t{\t\"deep\": \"nested\"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n,\t\"complexObject\":\n\t{\t\"id\": 1001\n\t,\t\"info\":\n\t\t{\t\"personal\":\n\t\t\t{\t\"name\": \"John Doe\"\n\t\t\t,\t\"age\": 35\n\t\t\t,\t\"hobbies\":\n\t\t\t\t[\t\"reading\"\n\t\t\t\t,\t\"swimming\"\n\t\t\t\t]\n\t\t\t}\n\t\t,\t\"professional\":\n\t\t\t{\t\"title\": \"Software Engineer\"\n\t\t\t,\t\"experience\": 10\n\t\t\t,\t\"skills\":\n\t\t\t\t[\t\"JavaScript\"\n\t\t\t\t,\t\"Python\"\n\t\t\t\t,\t\"C++\"\n\t\t\t\t]\n\t\t\t}\n\t\t}\n\t,\t\"contact\":\n\t\t[\t{\t\"type\": \"email\"\n\t\t\t,\t\"value\": \"john.doe@example.com\"\n\t\t\t}\n\t\t,\t{\t\"type\": \"phone\"\n\t\t\t,\t\"value\": \"+1-555-1234\"\n\t\t\t}\n\t\t]\n\t,\t\"active\": true\n\t}\n,\t\"emptyObject\": {}\n}"
  );
});
