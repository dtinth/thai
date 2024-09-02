`@thai/sql-storage` provides a Web Storage API implementation on top of Bun's SQLite support. This package allows you to use a localStorage-like interface in Bun environments, with the added benefit of persistence and the ability to share storage across multiple Bun processes.

While browsers, Node.js ([since v22.4.0](https://nodejs.org/en/blog/release/v22.4)), and Deno ([since v1.10](https://docs.deno.com/runtime/manual/runtime/web_storage_api/)) have built-in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) support, Bun (as of v1.1.26) currently lacks this feature. This package bridges that gap by implementing the [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) using Bun's [SQLite](https://bun.sh/docs/api/sqlite) capabilities.

Key benefits:

- Familiar localStorage-like API
- Persistence across application restarts
- Ability to share storage between multiple Bun processes using the same SQLite database file

Limitations:

- Unlike Node.js or Deno’s implementation that has a storage limit similar to browser’s (10 MB), this library does not enforce any limit on the amount of data that can be stored.

## Usage in Bun

```typescript
import { Database } from "bun:sqlite";
import { createSqlStorage } from "@thai/sql-storage";

// Create a SQLite database
// Use a path to a file to persist the storage,
// or use ":memory:" for an in-memory database.
const db = new Database("storage.db");

// Create a storage object
const storage = createSqlStorage(db);

// Use it like localStorage
storage.foo = "value";
storage.bar = "another value";
console.log(storage.foo);
console.log(storage.bar);

// Get the number of items
console.log(storage.length);

// Remove an item
storage.removeItem("key");

// Clear all items
storage.clear();
```

## API

The `createSqlStorage` function returns an object that implements the [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API):

- `setItem(key: string, value: string): void`
- `getItem(key: string): string | null`
- `removeItem(key: string): void`
- `clear(): void`
- `key(index: number): string | null`
- `length: number`

Additionally, you can use array-like syntax to get and set items.

## Sharing Storage Between Processes

To share storage between multiple Bun processes, point them to the same SQLite database file:

```typescript
// Process 1
const db1 = new Database("storage.db");
const storage1 = createSqlStorage(db1);

// Process 2
const db2 = new Database("storage.db");
const storage2 = createSqlStorage(db2);
```

Both `storage1` and `storage2` will now read from and write to the same SQLite database, allowing data sharing between processes.
