// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";
import { toast } from 'sonner';

import { useAuth as useAuthContext } from '@/hooks/useAuth';
import {
  notifications_list,
  notifications_add,
  notifications_update,
  notifications_delete,
  notifications_markAllRead,
  notifications_unreadCount,
  notifications_get,
  preferences_get,
  preferences_update,
} from '@/local/notifications';

export default function useNotifications() {
  const { mama_id, user_id } = useAuthContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendToast = useCallback((message, type = "info") => {
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else toast(message);
  }, []);

  const createNotification = useCallback(
    async ({ titre, texte, lien, user_id: targetUser, type = "info" }) => {
      if (!mama_id) return { error: "missing mama_id" };
      const id = await notifications_add({
        mama_id,
        user_id: targetUser || user_id,
        titre,
        texte,
        lien,
        type,
      });
      return { data: id };
    },
    [mama_id, user_id]
  );

  const sendEmailNotification = useCallback(async () => {
    return { error: 'offline' };
  }, []);

  const sendWebhook = useCallback(async () => {
    return { error: 'offline' };
  }, []);

  const fetchNotifications = useCallback(
    async ({ type = "" } = {}) => {
      if (!mama_id || !user_id) return [];
      setLoading(true);
      setError(null);
      try {
        const data = await notifications_list({ mama_id, user_id, type });
        setItems(Array.isArray(data) ? data : []);
        return data || [];
      } catch (e) {
        setError(e.message || String(e));
        setItems([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [mama_id, user_id]
  );

  const markAsRead = useCallback(
    async (id) => {
      if (!mama_id || !user_id || !id) return;
      await notifications_update(id, { lu: true });
      setItems((ns) => ns.map((n) => (n.id === id ? { ...n, lu: true } : n)));
    },
    [mama_id, user_id]
  );

  const markAllAsRead = useCallback(async () => {
    if (!mama_id || !user_id) return;
    await notifications_markAllRead(mama_id, user_id);
    setItems((ns) => ns.map((n) => ({ ...n, lu: true })));
  }, [mama_id, user_id]);

  const fetchUnreadCount = useCallback(async () => {
    if (!mama_id || !user_id) return 0;
    return await notifications_unreadCount(mama_id, user_id);
  }, [mama_id, user_id]);

  const fetchPreferences = useCallback(async () => {
    if (!mama_id || !user_id) return null;
    return await preferences_get(mama_id, user_id);
  }, [mama_id, user_id]);

  const updatePreferences = useCallback(
    async (values = {}) => {
      if (!mama_id || !user_id) return { error: 'missing ids' };
      const data = await preferences_update(mama_id, user_id, values);
      return { data };
    },
    [mama_id, user_id]
  );

  const deleteNotification = useCallback(
    async (id) => {
      if (!id) return;
      await notifications_delete(id);
      setItems((ns) => ns.filter((n) => n.id !== id));
    },
    []
  );

  const updateNotification = useCallback(
    async (id, values = {}) => {
      if (!id) return { error: 'missing id' };
      await notifications_update(id, values);
      setItems((ns) => ns.map((n) => (n.id === id ? { ...n, ...values } : n)));
      return { data: true };
    },
    []
  );

  const getNotification = useCallback(
    async (id) => {
      if (!id) return { data: null, error: 'missing' };
      const data = await notifications_get(id);
      if (data) {
        setItems((ns) => {
          const idx = ns.findIndex((n) => n.id === id);
          if (idx >= 0) {
            const arr = ns.slice();
            arr[idx] = data;
            return arr;
          }
          return [data, ...ns];
        });
      }
      return { data, error: null };
    },
    []
  );

  const subscribeToNotifications = useCallback((handler) => {
    return () => {};
  }, []);

  return {
    items,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    fetchUnreadCount,
    fetchPreferences,
    updatePreferences,
    updateNotification,
    getNotification,
    deleteNotification,
    subscribeToNotifications,
    sendToast,
    createNotification,
    sendEmailNotification,
    sendWebhook,
  };
}
