import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS, useTheme } from '../utils/styles';
import { useTranslation } from '../i18n';
import { Icon } from '../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { Notification } from '../types';
import { useSocket } from '../context/SocketContext';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationsList, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../hooks/useNotificationQueries';
import { queryKeys } from '../hooks/queryKeys';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { socket } = useSocket();
  const theme = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mapNotification = (item: any): Notification => {
    const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
    const isValid = !isNaN(createdDate.getTime());
    return {
      id: item._id,
      type: item.type,
      title: item.title,
      message: item.message,
      time: isValid ? createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      timestamp: isValid ? createdDate.getTime() : 0,
      unread: !item.isRead,
      icon: item.type === 'approved' || item.type === 'request_approved' ? 'check_circle' :
        item.type === 'rejected' || item.type === 'request_rejected' ? 'cancel' :
          item.type === 'reminder' ? 'alarm' : 'info',
    };
  };

  // TanStack Query hooks
  const { data: notificationsData, isLoading, refetch } = useNotificationsList({ limit: 20 });
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Derive notifications from query data
  const notifications: Notification[] = useMemo(() => {
    if (!notificationsData || !Array.isArray(notificationsData.notifications)) return [];
    return notificationsData.notifications.map(mapNotification);
  }, [notificationsData]);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    }, [queryClient])
  );

  // 🔴 Realtime: Listen for new notifications via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      console.log('[Socket] New notification received:', data.title);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket, queryClient]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const markAsRead = async (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = async () => {
    markAllAsReadMutation.mutate();
  };

  const deleteNotification = async (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'approved': return { bg: 'rgba(34, 197, 94, 0.1)', icon: COLORS.accent.green };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', icon: COLORS.accent.red };
      case 'warning': return { bg: 'rgba(245, 158, 11, 0.1)', icon: COLORS.accent.yellow };
      default: return { bg: 'rgba(66, 69, 240, 0.1)', icon: COLORS.primary };
    }
  };

  const renderRightActions = (progress: any, dragX: any, id: string) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View
        style={{
          width: 80,
          backgroundColor: COLORS.accent.red,
          justifyContent: 'center',
          alignItems: 'center',
          borderTopRightRadius: BORDER_RADIUS.lg,
          borderBottomRightRadius: BORDER_RADIUS.lg,
          marginBottom: SPACING.md,
          marginTop: 1, // small margin to align perfectly with shadows
        }}
      >
        <TouchableOpacity
          onPress={() => deleteNotification(id)}
          style={{
            flex: 1,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Icon name="delete" size={24} color="#ffffff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
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
                {t.notifications.subtitle}
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
        style={{ flex: 1 }}
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
              <Text style={{ color: theme.text.secondary, marginTop: SPACING.md }}>
                {t.notifications.empty}
              </Text>
            </View>
          ) : (
            notifications.map((item) => {
              const style = getNotificationBg(item.type);
              return (
                <Swipeable
                  key={item.id}
                  renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}
                  overshootRight={false}
                >
                  <TouchableOpacity
                    onPress={() => item.unread && markAsRead(item.id)}
                    style={{
                      backgroundColor: item.unread ? theme.surface : theme.surfaceDarker,
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
                        <Text style={{ color: theme.text.primary, fontWeight: '600', flex: 1 }}>
                          {item.title}
                        </Text>
                        <Text style={{ color: theme.text.secondary, fontSize: 12 }}>
                          {item.time}
                        </Text>
                      </View>
                      <Text style={{ color: theme.text.secondary, fontSize: 13, lineHeight: 20 }}>
                        {item.message}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', marginLeft: SPACING.sm }}>
                      {item.unread ? (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent.red }} />
                      ) : (
                        <View style={{ height: 8 }} />
                      )}
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

