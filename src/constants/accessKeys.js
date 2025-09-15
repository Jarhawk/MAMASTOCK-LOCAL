import { MODULES } from '@/config/modules';import { isTauri } from "@/lib/db/sql";

export const MODULE_KEYS = MODULES.map((m) => m.key);

export const PUBLIC_MODULES = ['dashboard', 'home', 'debug'];