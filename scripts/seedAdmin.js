#!/usr/bin/env node
import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

async function main() {
  const dbPath = process.argv[2] || 'mamastock.db';
  const password = process.env.ADMIN_PASSWORD || 'admin';
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.exec('PRAGMA journal_mode=WAL');
  const hash = await bcrypt.hash(password, 10);
  await db.run(
    `INSERT OR IGNORE INTO utilisateurs (id, email, mot_de_passe_hash, role, actif) VALUES (?,?,?,?,1)`,
    [randomUUID(), 'admin@mamastock.local', hash, 'admin']
  );
  console.log('Admin seeded on', dbPath);
  await db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
