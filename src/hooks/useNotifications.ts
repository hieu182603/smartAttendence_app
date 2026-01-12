import { useState, useEffect, useCallback, useMemo } from 'react';
import { Notification } from '../types';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'approved',
    title: 'Đơn nghỉ phép đã được duyệt',
    message: 'Đơn nghỉ phép của bạn từ 15/12 đến 17/12 đã được phê duyệt',
    time: '2 giờ trước',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    icon: '✅',
    unread: true,
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Nhắc nhở chấm công',
    message: 'Đừng quên chấm công trước 9:00 sáng',
    time: '5 giờ trước',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    icon: '⏰',
    unread: true,
  },
];

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(mockNotifications);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, unread: false } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications(prev =>
        prev.map(n => ({ ...n, unread: false }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

