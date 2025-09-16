import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import Sql from '@tauri-apps/plugin-sql';

vi.mock('@tauri-apps/plugin-sql', () => ({
  default: { load: vi.fn() },
}));

vi.mock('@/lib/tauriEnv', () => ({
  isTauri: () => true,
}));

import * as dal from '@/lib/db';

const mockDb = {
  select: vi.fn(),
  execute: vi.fn(),
  close: vi.fn(),
};

beforeEach(() => {
  mockDb.select.mockReset();
  mockDb.execute.mockReset();
  mockDb.close.mockReset();
  (Sql.load as any).mockResolvedValue(mockDb);
});

afterEach(async () => {
  await dal.closeDb();
  vi.clearAllMocks();
});

describe('DAL produits', () => {
  it('produits_list returns rows and total', async () => {
    mockDb.select
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ count: 1 }]);

    const result = await dal.produits_list('', true, 1, 20);

    expect(mockDb.select).toHaveBeenCalledTimes(2);
    expect(result.rows).toEqual([{ id: 1 }]);
    expect(result.total).toBe(1);
  });

  it('produits_create inserts product', async () => {
    mockDb.execute.mockResolvedValue(undefined);
    mockDb.select.mockResolvedValue([{ id: 1 }]);

    await dal.produits_create({ nom: 'Test' });

    expect(mockDb.execute).toHaveBeenCalledWith(
      'INSERT INTO produits (mama_id, nom, unite, famille, zone_id, actif) VALUES (?,?,?,?,?,1)',
      [null, 'Test', null, null, null]
    );
  });

  it('produits_update updates product', async () => {
    mockDb.execute.mockResolvedValue(undefined);

    await dal.produits_update('1', { nom: 'New' });

    expect(mockDb.execute).toHaveBeenCalledWith(
      'UPDATE produits SET nom = ? WHERE id = ?',
      ['New', '1']
    );
  });
});
