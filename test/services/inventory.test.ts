import { beforeEach, describe, expect, it, vi } from "vitest";

const selectMock = vi.fn();
const executeMock = vi.fn();
describe("inventory service", () => {
  beforeEach(() => {
    selectMock.mockReset();
    executeMock.mockReset();
    vi.resetModules();
  });

  it("fetches aggregated stock with a single query for all items", async () => {
    vi.doMock("@/lib/db/database", () => ({
      getDb: vi.fn(async () => ({
        select: selectMock,
        execute: executeMock,
      })),
      isMemoryDriver: vi.fn(() => false),
    }));

    const items = [
      {
        id: "item-1",
        sku: "SKU-1",
        name: "Item 1",
        category: null,
        created_at: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "item-2",
        sku: "SKU-2",
        name: "Item 2",
        category: null,
        created_at: "2024-01-02T00:00:00.000Z",
      },
      {
        id: "item-3",
        sku: "SKU-3",
        name: "Item 3",
        category: null,
        created_at: "2024-01-03T00:00:00.000Z",
      },
    ];

    selectMock.mockImplementationOnce(async () => items);
    selectMock.mockImplementationOnce(async (sql, params) => {
      expect(sql).toContain("GROUP BY item_id");
      expect(params).toEqual(["item-1", "item-2", "item-3"]);
      return [
        { item_id: "item-1", s: "5" },
        { item_id: "item-2", s: 3 },
      ];
    });

    const { listItems } = await import("@/services/inventory");
    const result = await listItems();

    expect(selectMock).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(3);
    expect(result.map((item) => item.stock)).toEqual([5, 3, 0]);
  });
});
