The `@thai/get-or-create` package provides the `getOrCreate` function that can be used to get or create a value in a map.

## Usage

```ts
import { getOrCreate } from "@thai/get-or-create";

// Let's calculate a tally for each word in this array.
const words = ["one", "two", "three", "one"];

// We'll use a map to store the tally.
const tally = new Map<string, { count: number }>();

// We can use the `getOrCreate` function to get or create
// the counter object for each word.
for (const word of words) {
  getOrCreate(tally, word, () => ({ count: 0 })).count++;
}

// The tally map now contains the count for each word:
//
// Map(3) {
//   'one' => { count: 2 },
//   'two' => { count: 1 },
//   'three' => { count: 1 }
// }
```

It can also be used with a `WeakMap` to implement a memoization cache.
