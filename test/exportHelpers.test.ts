import { describe, it, expect, vi, beforeAll } from 'vitest';

vi.mock('file-saver', () => ({ saveAs: vi.fn() }));

beforeAll(() => {
  global.URL.createObjectURL = vi.fn();
});

import { exportToCSV } from '@/lib/export/exportHelpers';

describe('export helpers', () => {
  it('exports to CSV without throwing', async () => {
    await expect(
      exportToCSV([{ a: 1 }], { useDialog: false })
    ).resolves.toBeUndefined();
  });
});
