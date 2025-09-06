#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import Database from 'better-sqlite3';

const dbPath = process.argv[2] ? resolve(process.argv[2]) : resolve('mamastock.db');
const db = new Database(dbPath);

const base = join(process.cwd(), 'db', 'sqlite');
const schema = readFileSync(join(base, '001_schema.sql'), 'utf8');
db.exec(schema);

const seedPath = join(base, '002_seed.sql');
if (existsSync(seedPath)) {
  const seed = readFileSync(seedPath, 'utf8');
  db.exec(seed);
}

console.log(`Migrations appliquées sur ${dbPath}`);
