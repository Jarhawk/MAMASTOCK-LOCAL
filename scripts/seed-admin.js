import { existsSync, readFileSync, writeFileSync } from 'fs';
import bcrypt from 'bcryptjs';

const FILE = 'src/db/users.json';
const EMAIL = 'admin@mamastock.local';
const PASSWORD = 'admin';
const ROLE = 'admin';

async function main() {
  let users = [];
  if (existsSync(FILE)) {
    users = JSON.parse(readFileSync(FILE, 'utf8'));
  }
  if (users.find(u => u.email === EMAIL)) {
    console.log('Admin user already exists');
    return;
  }
  const mot_de_passe_hash = await bcrypt.hash(PASSWORD, 10);
  users.push({ email: EMAIL, mot_de_passe_hash, role: ROLE, actif: true });
  writeFileSync(FILE, JSON.stringify(users, null, 2));
  console.log('Admin user created:', EMAIL);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
