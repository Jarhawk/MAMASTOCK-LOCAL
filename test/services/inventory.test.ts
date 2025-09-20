import { beforeEach, describe, expect, it, vi } from "vitest";

const selectMock = vi.fn();
const executeMock = vi.fn();
describe("inventory service", () => {
  beforeEach(() => {
    selectMock.mockReset();
    executeMock.mockReset();
    vi.resetModules();
  });

  it("aggregates stock for a large batch of items with a single query", async () => {
    const itemCount = 75;
    const items = Array.from({ length: itemCount }, (_, index) => ({
      id: `item-${index + 1}`,
      sku: `SKU-${index + 1}`,
      name: `Item ${index + 1}`,
      category: null,
      created_at: new Date(2024, 0, index + 1).toISOString(),
    }));

    const aggregatedRows = items.slice(0, 10).map((item, index) => ({
      item_id: item.id,
      s: index + 1,
    }));
    const stockQuerySpy = vi.fn();

    selectMock.mockImplementation(async (sql: string, params?: unknown[]) => {
      const normalized = sql.toLowerCase();
      if (normalized.includes("from items")) {
        return items;
      }

      if (normalized.includes("from stock_movements")) {
        stockQuerySpy();
        expect(sql).toContain("GROUP BY item_id");
        expect(Array.isArray(params)).toBe(true);
        const provided = params as string[];
        expect(provided).toHaveLength(items.length);
        expect(new Set(provided).size).toBe(items.length);
        return aggregatedRows;
      }

      throw new Error(`Unexpected SQL: ${sql}`);
    });

    vi.doMock("@/lib/db/database", () => ({
      getDb: vi.fn(async () => ({
        select: selectMock,
        execute: executeMock,
      })),
      isMemoryDriver: vi.fn(() => false),
    }));

    const { listItems } = await import("@/services/inventory");
    const result = await listItems();

    expect(stockQuerySpy).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(itemCount);
    expect(result.slice(0, 5).map((item) => item.stock)).toEqual([1, 2, 3, 4, 5]);
    expect(result[result.length - 1]!.stock).toBe(0);
  });
});
