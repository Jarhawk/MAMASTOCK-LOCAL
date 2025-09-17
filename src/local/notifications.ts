import { isTauri } from "@/lib/tauriEnv";
import { existsFile, readText, saveText } from "@/local/files";
const FILE = "notifications.json";
const PREF_FILE = "notification_preferences.json";

export type Notification = {
  id: string;
  mama_id: string;
  user_id: string;
  titre: string;
  texte?: string;
  lien?: string;
  type?: string;
  lu?: boolean;
  created_at?: string;
};

async function readAll(): Promise<Notification[]> {
  if (!(await existsFile(FILE))) return [];
  try {
    const txt = await readText(FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeAll(list: Notification[]) {
  await saveText(FILE, JSON.stringify(list, null, 2));
}

export async function notifications_list({ mama_id, user_id, type = "" }: {mama_id: string;user_id: string;type?: string;}) {
  let list = await readAll();
  if (mama_id) list = list.filter((n) => n.mama_id === mama_id);
  if (user_id) list = list.filter((n) => n.user_id === user_id);
  if (type) list = list.filter((n) => n.type === type);
  return list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function notifications_add(values: Omit<Notification, "id" | "lu" | "created_at">) {
  const list = await readAll();
  const item: Notification = {
    id: crypto.randomUUID(),
    lu: false,
    created_at: new Date().toISOString(),
    ...values
  } as Notification;
  list.push(item);
  await writeAll(list);
  return item.id;
}

export async function notifications_update(id: string, values: Partial<Notification>) {
  const list = await readAll();
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...values };
  await writeAll(list);
}

export async function notifications_delete(id: string) {
  const list = await readAll();
  const next = list.filter((n) => n.id !== id);
  await writeAll(next);
}

export async function notifications_markAllRead(mama_id: string, user_id: string) {
  const list = await readAll();
  list.forEach((n) => {if (n.mama_id === mama_id && n.user_id === user_id) n.lu = true;});
  await writeAll(list);
}

export async function notifications_unreadCount(mama_id: string, user_id: string) {
  const list = await readAll();
  return list.filter((n) => n.mama_id === mama_id && n.user_id === user_id && !n.lu).length;
}

export async function notifications_get(id: string) {
  const list = await readAll();
  return list.find((n) => n.id === id) || null;
}

// Preferences
export type NotificationPref = {mama_id: string;utilisateur_id: string;[k: string]: any;};

async function readPrefs(): Promise<NotificationPref[]> {
  if (!(await existsFile(PREF_FILE))) return [];
  try {
    const txt = await readText(PREF_FILE);
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writePrefs(list: NotificationPref[]) {
  await saveText(PREF_FILE, JSON.stringify(list, null, 2));
}

export async function preferences_get(mama_id: string, utilisateur_id: string) {
  const list = await readPrefs();
  return list.find((p) => p.mama_id === mama_id && p.utilisateur_id === utilisateur_id) || null;
}

export async function preferences_update(mama_id: string, utilisateur_id: string, values: any) {
  const list = await readPrefs();
  const idx = list.findIndex((p) => p.mama_id === mama_id && p.utilisateur_id === utilisateur_id);
  if (idx === -1) list.push({ mama_id, utilisateur_id, ...values });else
  list[idx] = { ...list[idx], ...values };
  await writePrefs(list);
  return values;
}