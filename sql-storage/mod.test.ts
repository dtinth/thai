// Runs unmodified under `deno test`, `node --test`, and `bun test` — no
// separate per-runtime project/toolchain needed. Bun ships its own
// `bun:sqlite`, so that's what's used there; Deno and Node both implement
// `node:sqlite`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSqlStorage, type SqlDatabaseInput } from "./mod.ts";

async function createDb(): Promise<SqlDatabaseInput> {
  if ("Bun" in globalThis) {
    const { Database } = await import("bun:sqlite");
    return new Database();
  }
  const { DatabaseSync } = await import("node:sqlite");
  return new DatabaseSync(":memory:");
}

test("setItem and getItem", async () => {
  const storage = createSqlStorage(await createDb());
  storage.setItem("key1", "value1");
  assert.equal(storage.getItem("key1"), "value1");
});

test("property-based access", async () => {
  const storage = createSqlStorage(await createDb());
  storage.testKey = "testValue";
  assert.equal(storage.testKey, "testValue");
});

test("removeItem", async () => {
  const storage = createSqlStorage(await createDb());
  storage.setItem("key2", "value2");
  storage.removeItem("key2");
  assert.equal(storage.getItem("key2"), null);
});

test("clear", async () => {
  const storage = createSqlStorage(await createDb());
  storage.setItem("key3", "value3");
  storage.setItem("key4", "value4");
  storage.clear();
  assert.equal(storage.length, 0);
});

test("length", async () => {
  const storage = createSqlStorage(await createDb());
  storage.setItem("key5", "value5");
  storage.setItem("key6", "value6");
  assert.equal(storage.length, 2);
});

test("key", async () => {
  const storage = createSqlStorage(await createDb());
  storage.setItem("key7", "value7");
  storage.setItem("key8", "value8");
  assert.equal(storage.key(0), "key7");
  assert.equal(storage.key(1), "key8");
  assert.equal(storage.key(2), null);
});

test("iteration", async () => {
  const storage = createSqlStorage(await createDb());
  storage.setItem("key9", "value9");
  storage.setItem("key10", "value10");
  const entries = Array.from(storage);
  assert.deepEqual(entries, [
    ["key9", "value9"],
    ["key10", "value10"],
  ]);
});

test("delete property", async () => {
  const storage = createSqlStorage(await createDb());
  storage.testDelete = "deleteMe";
  assert.equal(storage.testDelete, "deleteMe");
  delete storage.testDelete;
  assert.equal(storage.testDelete, null);
});

test("Object.keys", async () => {
  const storage = createSqlStorage(await createDb());
  storage.key1 = "value1";
  storage.key2 = "value2";
  assert.deepEqual(Object.keys(storage), ["key1", "key2"]);
});

test("storage persistence", async () => {
  const db = await createDb();
  const storage = createSqlStorage(db);
  storage.persistentKey = "I should persist";
  const newStorage = createSqlStorage(db);
  assert.equal(newStorage.persistentKey, "I should persist");
});
