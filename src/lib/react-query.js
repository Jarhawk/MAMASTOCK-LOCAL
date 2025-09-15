import { QueryClient, useQueryClient } from '@tanstack/react-query';import { isTauri } from "@/lib/runtime/isTauri";

let client;
export function getQueryClient() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQueryClient();
  } catch {
    if (!client) client = new QueryClient();
    return client;
  }
}