import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteUserLocal,
  listLocalUsers,
  registerLocal,
  updatePasswordLocal,
  updateRoleLocal,
} from "@/auth/localAccount";

const PAGE_SIZE = 50;

function normalizeList(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => ({ ...item }));
}

function sortUsersDesc(users) {
  return [...users].sort((a, b) => {
    const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (dateA === dateB) {
      const emailA = (a?.email || "").toLowerCase();
      const emailB = (b?.email || "").toLowerCase();
      if (emailA < emailB) return -1;
      if (emailA > emailB) return 1;
      return 0;
    }
    return dateB - dateA;
  });
}

export function useLocalUsers() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [pageState, setPageState] = useState(1);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listLocalUsers();
      setAll(normalizeList(list));
    } catch (err) {
      const message = err?.message || "Impossible de charger les comptes locaux.";
      setAll([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const { data, total, totalPages } = useMemo(() => {
    const normalized = sortUsersDesc(normalizeList(all));
    const query = searchValue.trim().toLowerCase();
    const filtered = query
      ? normalized.filter((user) => (user.email || "").toLowerCase().includes(query))
      : normalized;

    const totalItems = filtered.length;
    const pages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const safePage = Math.min(Math.max(pageState, 1), pages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

    return {
      data: pageItems,
      total: totalItems,
      totalPages: pages,
    };
  }, [all, pageState, searchValue]);

  useEffect(() => {
    setPageState((prev) => {
      const maxPage = Math.max(1, totalPages);
      if (prev < 1) return 1;
      if (prev > maxPage) return maxPage;
      return prev;
    });
  }, [totalPages]);

  const setSearch = useCallback((value) => {
    setSearchValue(typeof value === "string" ? value : "");
    setPageState(1);
  }, []);

  const setPage = useCallback((value) => {
    setPageState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      if (!Number.isFinite(next)) return prev;
      const rounded = Math.round(next);
      const maxPage = Math.max(1, totalPages);
      if (rounded < 1) return 1;
      if (rounded > maxPage) return maxPage;
      return rounded;
    });
  }, [totalPages]);

  const createUser = useCallback(
    async ({ email, password, role }) => {
      try {
        await registerLocal(email, password, role);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err?.message || "Échec de la création du compte.",
        };
      }
    },
    [refresh]
  );

  const resetPassword = useCallback(
    async ({ email, newPassword }) => {
      try {
        await updatePasswordLocal(email, newPassword);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err?.message || "Échec de la mise à jour du mot de passe.",
        };
      }
    },
    [refresh]
  );

  const changeRole = useCallback(
    async ({ id, role }) => {
      try {
        await updateRoleLocal(id, role);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err?.message || "Échec de la mise à jour du rôle.",
        };
      }
    },
    [refresh]
  );

  const removeUser = useCallback(
    async ({ id }) => {
      try {
        await deleteUserLocal(id);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err?.message || "Échec de la suppression du compte.",
        };
      }
    },
    [refresh]
  );

  return {
    data,
    all,
    loading,
    error,
    search: searchValue,
    setSearch,
    page: pageState,
    setPage,
    pageSize: PAGE_SIZE,
    total,
    totalPages,
    refresh,
    actions: {
      createUser,
      resetPassword,
      changeRole,
      removeUser,
    },
  };
}

export default useLocalUsers;
