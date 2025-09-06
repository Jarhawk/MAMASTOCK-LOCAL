import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import Sql from '@tauri-apps/plugin-sql';

vi.mock('@tauri-apps/plugin-sql', () => ({
  default: { load: vi.fn() },
}));

import * as dal from '@/lib/db';

afterEach(async () => {
  await dal.closeDb();
  vi.restoreAllMocks();
});

describe('DAL produits', () => {
  it('produits_list returns rows and total', async () => {
    const mockDb = {
      select: vi
        .fn()
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ count: 1 }]),
      close: vi.fn(),
    };
    (Sql.load as any).mockResolvedValue(mockDb);

    const result = await dal.produits_list('', true, 1, 20);

    expect(mockDb.select).toHaveBeenCalledTimes(2);
    expect(result.rows).toEqual([{ id: 1 }]);
    expect(result.total).toBe(1);
  });

  it('produits_create inserts product', async () => {
    const mockDb = {
      execute: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
    };
    (Sql.load as any).mockResolvedValue(mockDb);

    await dal.produits_create({ nom: 'Test' });

    expect(mockDb.execute).toHaveBeenCalledWith(
      'INSERT INTO produits (nom, unite, famille, actif) VALUES (?,?,?,?)',
      ['Test', null, null, 1]
    );
  });

  it('produits_update updates product', async () => {
    const mockDb = {
      execute: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
    };
    (Sql.load as any).mockResolvedValue(mockDb);

    await dal.produits_update('1', { nom: 'New' });

    expect(mockDb.execute).toHaveBeenCalledWith(
      'UPDATE produits SET nom = ? WHERE id = ?',
      ['New', '1']
    );
  });
});
