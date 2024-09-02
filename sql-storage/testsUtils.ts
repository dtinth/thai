import { createSqlStorage, type SqlDatabaseInput } from "./mod.ts";

export interface TestCase {
  name: string;
  run: (harness: TestHarness) => void | Promise<void>;
}

export interface TestHarness {
  createDb: () => SqlDatabaseInput;
  assertEquals: (actual: any, expected: any) => void;
  assertNull: (value: any) => void;
}

export const testCases: TestCase[] = [
  {
    name: "setItem and getItem",
    run: (harness) => {
      const db = harness.createDb();
      const storage = createSqlStorage(db);
      storage.setItem("key1", "value1");
      harness.assertEquals(storage.getItem("key1"), "value1");
    },
  },
  {
    name: "property-based access",
    run: (harness) => {
      const db = harness.createDb();
      const storage = createSqlStorage(db);
      storage.testKey = "testValue";
      harness.assertEquals(storage.testKey, "testValue");
    },
  },
  {
    name: "removeItem",
    run: (harness) => {
      const db = harness.createDb();
      const storage = createSqlStorage(db);
      storage.setItem("key2", "value2");
      storage.removeItem("key2");
      harness.assertNull(storage.getItem("key2"));
    },
  },
  {
    name: "clear",
    run: (harness) => {
      const db = harness.createDb();
      const storage = createSqlStorage(db);
      storage.setItem("key3", "value3");
      storage.setItem("key4", "value4");
      storage.clear();
      harness.assertEquals(storage.length, 0);
    },
  },
  {
    name: "length",
    run: (harness) => {
      const db = harness.createDb();
      const storage = createSqlStorage(db);
      storage.setItem("key5", "value5");
      storage.setItem("key6", "value6");
      harness.assertEquals(storage.length, 2);
    },
  },
  {
    name: "key",
    run: (harness) => {
      const db = harness.createDb();
      const storage = createSqlStorage(db);
      storage.setItem("key7", "value7");
      storage.setItem("key8", "value8");
      harness.assertEquals(storage.key(0), "key7");
      harness.assertEquals(storage.key(1), "key8");
      harness.assertNull(storage.key(2));
    },
  },
  {
    name: "iteration",
    run: (harness) => {
      const db = harness.createDb();
      const storage = createSqlStorage(db);
      storage.setItem("key9", "value9");
      storage.setItem("key10", "value10");
      const entries = Array.from(storage);
      harness.assertEquals(entries, [
        ["key9", "value9"],
        ["key10", "value10"],
      ]);
    },
  },
  {
    name: "delete property",
    run: (harness) => {
      const db = harness.createDb();
      const storage = createSqlStorage(db);
      storage.testDelete = "deleteMe";
      harness.assertEquals(storage.testDelete, "deleteMe");
      delete storage.testDelete;
      harness.assertNull(storage.testDelete);
    },
  },
  {
    name: "Object.keys",
    run: (harness) => {
      const db = harness.createDb();
      const storage = createSqlStorage(db);
      storage.key1 = "value1";
      storage.key2 = "value2";
      const keys = Object.keys(storage);
      harness.assertEquals(keys, ["key1", "key2"]);
    },
  },
  {
    name: "storage persistence",
    run: (harness) => {
      const db = harness.createDb();
      const storage = createSqlStorage(db);
      storage.persistentKey = "I should persist";
      const newStorage = createSqlStorage(db);
      harness.assertEquals(newStorage.persistentKey, "I should persist");
    },
  },
];
