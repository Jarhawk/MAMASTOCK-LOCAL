import { existsSync, readFileSync, writeFileSync } from 'fs';
import bcrypt from 'bcryptjs';

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const key = process.argv[i];
    if (key.startsWith('--')) {
      const value = process.argv[i + 1];
      args[key.slice(2)] = value;
      i++;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const FILE = args.db;
  const EMAIL = args.email;
  const PASSWORD = args.password;
  const ROLE = args.role || 'admin';

  if (!FILE || !EMAIL || !PASSWORD) {
    console.error('Usage: node scripts/seed-admin.js --db <path> --email <email> --password <password> [--role admin]');
    process.exit(1);
  }

  let users = [];
  if (existsSync(FILE)) {
    users = JSON.parse(readFileSync(FILE, 'utf8') || '[]');
  }
  if (users.find(u => u.email === EMAIL)) {
    console.log('Admin user already exists');
    return;
  }
  const mot_de_passe_hash = await bcrypt.hash(PASSWORD, 10);
  users.push({ email: EMAIL, mot_de_passe_hash, role: ROLE, actif: true, must_change_password: true });
  writeFileSync(FILE, JSON.stringify(users, null, 2));
  console.log('Admin user created:', EMAIL);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
