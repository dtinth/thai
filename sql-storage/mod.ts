/**
 * A Database object from `bun:sqlite`.
 */
export type SqlDatabaseInput = BunDatabase;

interface BunDatabase {
  query(sql: string): {
    get(...params: any[]): any;
    all(...params: any[]): any[];
    run(...params: any[]): void;
  };
}

interface SqlDatabase {
  query<T = any>(
    sql: string
  ): {
    get(params?: Record<string, any>): T;
    all(params?: Record<string, any>): T[];
    run(params?: Record<string, any>): void;
  };
}

const kGetProxy = Symbol("getProxy");
const kDb = Symbol("db");
const kProxy = Symbol("proxy");

/**
 * Do not use this class directly. Instead, create a new instance of `SqlStorage` using the `createSqlStorage` function.
 */
export class SqlStorage implements Storage {
  private [kDb]: SqlDatabase;
  public [kProxy]: Storage;

  constructor(db: SqlDatabase) {
    this[kDb] = db;
    this.init();
    this[kProxy] = new Proxy(this, {
      get(target, prop) {
        if (prop in target || typeof prop === "symbol") {
          return (target as any)[prop];
        }
        return target.getItem(prop.toString());
      },
      set(target, prop, value) {
        target.setItem(prop.toString(), value.toString());
        return true;
      },
      deleteProperty(target, prop) {
        target.removeItem(prop.toString());
        return true;
      },
      ownKeys(target) {
        return target.getAllKeys();
      },
      has(target, prop) {
        return (
          target.hasOwnProperty(prop) ||
          target.getItem(prop.toString()) !== null
        );
      },
      getOwnPropertyDescriptor(target, prop) {
        if (target.hasOwnProperty(prop)) {
          return Object.getOwnPropertyDescriptor(target, prop);
        }
        if (target.getItem(prop.toString()) !== null) {
          return {
            configurable: true,
            enumerable: true,
            writable: true,
            value: target.getItem(prop.toString()),
          };
        }
        return undefined;
      },
    });
  }

  private init() {
    this[kDb]
      .query(
        `
      CREATE TABLE IF NOT EXISTS storage (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `
      )
      .run();
  }

  get length(): number {
    const result = this[kDb]
      .query<{ count: number }>("SELECT COUNT(*) as count FROM storage")
      .get();
    return result.count;
  }

  clear(): void {
    this[kDb].query("DELETE FROM storage").run();
  }

  getItem(key: string): string | null {
    const result = this[kDb]
      .query<{ value: string }>("SELECT value FROM storage WHERE key = $key")
      .get({ $key: key });
    return result ? result.value : null;
  }

  key(index: number): string | null {
    const result = this[kDb]
      .query<{ key: string }>("SELECT key FROM storage LIMIT 1 OFFSET $index")
      .get({ $index: index });
    return result ? result.key : null;
  }

  removeItem(key: string): void {
    this[kDb].query("DELETE FROM storage WHERE key = $key").run({ $key: key });
  }

  setItem(key: string, value: string): void {
    this[kDb]
      .query(
        "INSERT OR REPLACE INTO storage (key, value) VALUES ($key, $value)"
      )
      .run({ $key: key, $value: value });
  }

  private getAllKeys(): string[] {
    return this[kDb]
      .query<{ key: string }>("SELECT key FROM storage")
      .all()
      .map((row) => row.key);
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    const rows = this[kDb]
      .query<{ key: string; value: string }>("SELECT key, value FROM storage")
      .all();
    return rows
      .map((row) => [row.key, row.value] as [string, string])
      [Symbol.iterator]();
  }
}

/**
 * Creates a storage object backed by a given database.
 */
export function createSqlStorage(db: SqlDatabaseInput): Storage {
  return new SqlStorage(adapt(db))[kProxy];
}

function adapt(db: SqlDatabaseInput): SqlDatabase {
  return db;
}
