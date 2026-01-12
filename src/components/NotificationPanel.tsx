import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/styles';
import { Notification } from '../types';
import { Icon } from './Icon';

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  const handleNotificationPress = async (notification: Notification) => {
    if (notification.unread) {
      await onMarkAsRead(notification.id);
    }
  };

  const getNotificationBg = (type: Notification['type']) => {
    switch (type) {
      case 'approved':
        return 'rgba(11, 218, 104, 0.2)';
      case 'rejected':
        return 'rgba(244, 67, 54, 0.2)';
      case 'reminder':
        return 'rgba(255, 152, 0, 0.2)';
      case 'warning':
        return 'rgba(244, 67, 54, 0.2)';
      default:
        return 'rgba(66, 69, 240, 0.2)';
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Thông báo</Text>
              <Text style={styles.headerSubtitle}>{unreadCount} thông báo mới</Text>
            </View>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={onMarkAllAsRead}
                  style={styles.actionButton}
                >
                  <Icon name="done_all" size={16} color={COLORS.accent.green} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={16} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <ScrollView style={styles.list}>
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔔</Text>
                <Text style={styles.emptyText}>Không có thông báo</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    notification.unread && styles.unreadItem,
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: getNotificationBg(notification.type) },
                    ]}
                  >
                    <Text style={styles.iconEmoji}>{notification.icon}</Text>
                  </View>
                  <View style={styles.content}>
                    <View style={styles.contentHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      {notification.unread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onDelete(notification.id)}
                    style={styles.deleteButton}
                  >
                    <Icon name="delete" size={14} color={COLORS.accent.red} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
  },
  panel: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    backgroundColor: COLORS.surface.dark,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...SHADOWS.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: SPACING.xs / 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: SPACING.sm,
  },
  unreadItem: {
    backgroundColor: 'rgba(66, 69, 240, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
  notificationTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notificationMessage: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginBottom: SPACING.xs / 2,
  },
  notificationTime: {
    color: COLORS.text.secondary,
    fontSize: 11,
    opacity: 0.6,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  emptyState: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
});

