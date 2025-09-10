import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { createHash, randomUUID } from 'crypto';

async function main() {
  const base = process.env.APPDATA || path.join(os.homedir(), '.config');
  const dir = path.join(base, 'MamaStock');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, 'users.json');
  let users = [];
  try {
    const txt = await fs.readFile(file, 'utf8');
    users = JSON.parse(txt);
  } catch {
    // ignore
  }
  if (users.find(u => u.email === 'admin@mamastock.local')) {
    console.log('Admin user already exists');
    return;
  }
  const salt = randomUUID();
  const password_hash = createHash('sha256').update(`Admin123!:${salt}`).digest('hex');
  const id = randomUUID();
  const mama_id = 'admin';
  users.push({ id, email: 'admin@mamastock.local', mama_id, password_hash, salt });
  await fs.writeFile(file, JSON.stringify(users, null, 2));
  console.log('Admin user created');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
