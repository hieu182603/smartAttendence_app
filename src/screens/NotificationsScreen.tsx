import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/styles';
import { Icon } from '../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Notification } from '../types';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { NotificationService } = await import('../services/notification.service');
      const data = await NotificationService.getAll({ limit: 20 });
      if (Array.isArray(data)) {
        // Map backend data to frontend type if needed
        setNotifications(data.map((item: any) => ({
          id: item._id,
          type: item.type, // approved, rejected, reminder, info, warning
          title: item.title,
          message: item.message,
          time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(item.createdAt).getTime(),
          unread: !item.isRead,
          icon: item.type === 'approved' ? 'check_circle' :
            item.type === 'rejected' ? 'cancel' :
              item.type === 'reminder' ? 'alarm' : 'info',
        })));
      }
    } catch (error) {
      console.log('Error fetching notifications', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const { NotificationService } = await import('../services/notification.service');
      await NotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch (error) {
      console.log('Error marking as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { NotificationService } = await import('../services/notification.service');
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (error) {
      console.log('Error marking all as read', error);
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'approved': return { bg: 'rgba(34, 197, 94, 0.1)', icon: COLORS.accent.green };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', icon: COLORS.accent.red };
      case 'warning': return { bg: 'rgba(245, 158, 11, 0.1)', icon: COLORS.accent.yellow };
      default: return { bg: 'rgba(66, 69, 240, 0.1)', icon: COLORS.primary };
    }
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent.cyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: SPACING.xxl * 2,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                marginRight: SPACING.md,
                padding: SPACING.xs,
                borderRadius: BORDER_RADIUS.sm,
                backgroundColor: 'rgba(255,255,255,0.2)'
              }}
            >
              <Icon name="arrow_back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '600', color: '#ffffff' }}>
                Thông báo
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
                Cập nhật mới nhất từ hệ thống
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={markAllAsRead}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: SPACING.sm,
              borderRadius: BORDER_RADIUS.md,
            }}
          >
            <Icon name="done_all" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        <View style={{ padding: SPACING.lg }}>
          {isLoading && !refreshing ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
          ) : notifications.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: SPACING.xl * 2 }}>
              <Icon name="notifications_off" size={48} color={COLORS.text.secondary} />
              <Text style={{ color: COLORS.text.secondary, marginTop: SPACING.md }}>
                Không có thông báo nào
              </Text>
            </View>
          ) : (
            notifications.map((item) => {
              const style = getNotificationBg(item.type);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => item.unread && markAsRead(item.id)}
                  style={{
                    backgroundColor: item.unread ? 'rgba(30, 41, 59, 0.8)' : 'rgba(30, 41, 59, 0.4)',
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    marginBottom: SPACING.md,
                    flexDirection: 'row',
                    borderWidth: 1,
                    borderColor: item.unread ? COLORS.primary : 'transparent',
                    ...SHADOWS.md,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: style.bg,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: SPACING.md,
                    }}
                  >
                    <Icon name={item.icon || 'notifications'} size={20} color={style.icon} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
                      <Text style={{ color: COLORS.text.primary, fontWeight: '600', flex: 1 }}>
                        {item.title}
                      </Text>
                      <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                        {item.time}
                      </Text>
                    </View>
                    <Text style={{ color: COLORS.text.secondary, fontSize: 13, lineHeight: 20 }}>
                      {item.message}
                    </Text>
                  </View>
                  {item.unread && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: COLORS.accent.red,
                        position: 'absolute',
                        top: SPACING.md,
                        right: SPACING.md,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

