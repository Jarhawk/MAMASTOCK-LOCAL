import { afterEach, beforeEach, expect, test } from "vitest";
import initSqlJs from "sql.js";

import type { SqlDatabase } from "@/lib/db/database";
import {
  closeDb,
  getDb,
  installMemoryDriver,
  isMemoryDriverActive,
} from "@/lib/db/database";

async function createSqlJsMemoryDriver(): Promise<SqlDatabase> {
  const SQL = await initSqlJs();
  const database = new SQL.Database();

  return {
    async select<T = unknown>(
      sql: string,
      params: unknown[] = [],
    ): Promise<T[]> {
      const statement = database.prepare(sql);
      try {
        statement.bind(params ?? []);
        const columns = statement.getColumnNames();
        const rows: T[] = [];
        while (statement.step()) {
          const values = statement.get();
          const entry: Record<string, unknown> = {};
          for (let index = 0; index < columns.length; index += 1) {
            entry[columns[index]] = values[index];
          }
          rows.push(entry as T);
        }
        return rows;
      } finally {
        statement.free();
      }
    },
    async execute(sql: string, params: unknown[] = []): Promise<void> {
      database.run(sql, params ?? []);
    },
    async close(): Promise<void> {
      database.close();
    },
  };
}

beforeEach(() => {
  installMemoryDriver(async () => createSqlJsMemoryDriver());
});

afterEach(async () => {
  await closeDb();
  installMemoryDriver(null);
});

test("local adapter executes CRUD operations in memory", async () => {
  const db = await getDb();

  await db.execute(
    "CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, qty INTEGER NOT NULL)",
  );
  await db.execute("INSERT INTO items (id, qty) VALUES (?, ?)", ["A", 2]);

  const initial = await db.select<{ qty: number }>(
    "SELECT qty FROM items WHERE id = ?",
    ["A"],
  );
  expect(initial).toEqual([{ qty: 2 }]);

  await db.execute("UPDATE items SET qty = ? WHERE id = ?", [5, "A"]);
  const updated = await db.select<{ qty: number }>(
    "SELECT qty FROM items WHERE id = ?",
    ["A"],
  );
  expect(updated).toEqual([{ qty: 5 }]);

  await db.execute("DELETE FROM items WHERE id = ?", ["A"]);
  const empty = await db.select("SELECT qty FROM items WHERE id = ?", ["A"]);
  expect(empty).toEqual([]);

  expect(isMemoryDriverActive()).toBe(true);
});
