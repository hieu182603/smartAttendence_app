import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { EmployeeTabParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../../App';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { AttendanceStats, Activity, Notification } from '../../types';

type DashboardScreenNavigationProp = BottomTabNavigationProp<EmployeeTabParamList, 'Home'>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

const { width } = Dimensions.get('window');

// Mock data matching web version
const mockStats: AttendanceStats = {
  leavesRemaining: 12,
  totalLeaves: 15,
  thisMonth: 18,
  totalDays: 20,
  overtimeHours: 8,
  lateCount: 2,
};

const mockActivities: Activity[] = [
  {
    id: 'act-001',
    userId: 'emp-001',
    action: 'Chấm công vào',
    time: '08:00',
    date: 'Hôm nay',
    timestamp: Date.now(),
    status: 'success',
    details: 'Chấm công thành công',
  },
  {
    id: 'act-002',
    userId: 'emp-001',
    action: 'Đơn nghỉ phép được duyệt',
    time: '14:30',
    date: 'Hôm qua',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    status: 'success',
  },
  {
    id: 'act-003',
    userId: 'emp-001',
    action: 'Chấm công ra',
    time: '17:30',
    date: 'Hôm qua',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    status: 'success',
  },
];

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'approved',
    title: 'Đơn nghỉ phép được duyệt',
    message: 'Đơn nghỉ phép ngày 15-17/01 đã được phê duyệt',
    time: '2 giờ trước',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    icon: '✓',
    unread: true,
  },
  {
    id: 'notif-002',
    type: 'reminder',
    title: 'Nhắc nhở ca làm việc',
    message: 'Ca làm việc của bạn bắt đầu lúc 08:00 sáng mai',
    time: '5 giờ trước',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    icon: '⏰',
    unread: true,
  },
  {
    id: 'notif-003',
    type: 'info',
    title: 'Cập nhật bảng lương',
    message: 'Bảng lương tháng 12 đã được cập nhật',
    time: '1 ngày trước',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    icon: 'ℹ',
    unread: false,
  },
];

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [stats] = useState(mockStats);
  const [activities] = useState(mockActivities);
  const [isLoading] = useState(false);

  const userName = user?.name || 'Nguyễn Văn A';
  const userAvatar = user?.avatar;

  const unreadCount = notifications.filter(n => n.unread).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng! 👋' : hour < 18 ? 'Chào buổi chiều! 👋' : 'Chào buổi tối! 👋';

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, unread: false }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getNotificationBg = (type: Notification['type']) => {
    switch (type) {
      case 'approved':
        return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.3)' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'reminder':
        return { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'warning':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { bg: 'rgba(66, 69, 240, 0.2)', border: 'rgba(66, 69, 240, 0.3)' };
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header with Notification Bell */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: SPACING.xxl * 2,
            paddingBottom: SPACING.xl + 20,
            paddingHorizontal: SPACING.lg,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 256,
              height: 256,
              borderRadius: 128,
              backgroundColor: 'rgba(34, 211, 238, 0.2)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 192,
              height: 192,
              borderRadius: 96,
              backgroundColor: 'rgba(66, 69, 240, 0.3)',
            }}
          />

          <View style={{ position: 'relative', zIndex: 10 }}>
            {/* Top Bar - Avatar and Bell */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ position: 'relative', marginRight: SPACING.md }}>
                  {userAvatar ? (
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        ...SHADOWS.lg,
                      }}
                    >
                      {/* Image would go here */}
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        ...SHADOWS.lg,
                      }}
                    >
                      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600' }}>
                        {userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: COLORS.accent.green,
                      borderWidth: 2,
                      borderColor: COLORS.primary,
                      ...SHADOWS.md,
                    }}
                  />
                </View>
                <View>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                    Xin chào,
                  </Text>
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                    {userName}
                  </Text>
                </View>
              </View>

              {/* Notification Bell */}
              <TouchableOpacity
                onPress={toggleNotifications}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...SHADOWS.lg,
                  position: 'relative',
                }}
              >
                <Icon name="notifications" size={20} color="#ffffff" />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: COLORS.accent.red,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: COLORS.primary,
                      ...SHADOWS.md,
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}>
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Welcome Message */}
            <View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: SPACING.xs,
                }}
              >
                {greeting}
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
                Hãy bắt đầu một ngày làm việc hiệu quả
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.md }}>
          {/* Attendance Reminder Widget */}
          <View
            style={{
              backgroundColor: 'rgba(66, 69, 240, 0.1)',
              borderRadius: BORDER_RADIUS.lg,
              padding: SPACING.lg,
              marginBottom: SPACING.lg,
              borderWidth: 1,
              borderColor: 'rgba(66, 69, 240, 0.2)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(66, 69, 240, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name="schedule" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.xs / 2,
                  }}
                >
                  ⏰ Nhắc nhở chấm công
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                  Ca làm: 08:00 - 17:00
                </Text>
              </View>
            </View>
            <View style={{ marginLeft: 56 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.sm }}>
                <Text style={{ fontSize: 12, color: COLORS.text.secondary, marginRight: SPACING.xs }}>
                  Còn lại:
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: COLORS.primary,
                  }}
                >
                  2h 30m
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="location_on" size={14} color={COLORS.text.secondary} />
                <Text style={{ fontSize: 12, color: COLORS.text.secondary, marginLeft: SPACING.xs }}>
                  📍 Văn phòng Hà Nội
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Cards Grid */}
          {isLoading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
              {[1, 2, 3, 4].map(i => (
                <View
                  key={i}
                  style={{
                    width: (width - SPACING.lg * 3) / 2,
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    marginRight: i % 2 === 0 ? 0 : SPACING.md,
                    marginBottom: SPACING.md,
                  }}
                >
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ))}
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
                {/* Leaves Remaining */}
                <View
                  style={{
                    width: (width - SPACING.lg * 3) / 2,
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    marginRight: SPACING.md,
                    marginBottom: SPACING.md,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.1)',
                    ...SHADOWS.md,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <Icon name="event" size={20} color={COLORS.accent.green} />
                  </View>
                  <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs }}>
                    Phép còn lại
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: '600',
                      color: COLORS.text.primary,
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    {stats.leavesRemaining}
                  </Text>
                  <Text style={{ fontSize: 11, color: COLORS.text.secondary }}>
                    ngày nghỉ
                  </Text>
                </View>

                {/* Next Shift */}
                <View
                  style={{
                    width: (width - SPACING.lg * 3) / 2,
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    marginBottom: SPACING.md,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.1)',
                    ...SHADOWS.md,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: 'rgba(66, 69, 240, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <Icon name="schedule" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs }}>
                    Ca làm tiếp theo
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: COLORS.text.primary,
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    Thứ Hai
                  </Text>
                  <Text style={{ fontSize: 11, color: COLORS.text.secondary }}>
                    08:00 - 17:00
                  </Text>
                </View>
              </View>

              {/* Additional Stats Row */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.xl }}>
                {/* Attendance This Month */}
                <View
                  style={{
                    width: (width - SPACING.lg * 3) / 2,
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    marginRight: SPACING.md,
                    marginBottom: SPACING.md,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.1)',
                    ...SHADOWS.md,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: 'rgba(34, 211, 238, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <Icon name="check_circle" size={20} color={COLORS.accent.cyan} />
                  </View>
                  <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs }}>
                    Chấm công tháng này
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '600',
                      color: COLORS.text.primary,
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    {stats.thisMonth}/{stats.totalDays}
                  </Text>
                  <Text style={{ fontSize: 11, color: COLORS.text.secondary }}>
                    ngày làm việc
                  </Text>
                </View>

                {/* Overtime */}
                <View
                  style={{
                    width: (width - SPACING.lg * 3) / 2,
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    marginBottom: SPACING.md,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.1)',
                    ...SHADOWS.md,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <Icon name="bolt" size={20} color={COLORS.accent.yellow} />
                  </View>
                  <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs }}>
                    Tăng ca tháng này
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '600',
                      color: COLORS.text.primary,
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    {stats.overtimeHours}
                  </Text>
                  <Text style={{ fontSize: 11, color: COLORS.text.secondary }}>
                    giờ làm thêm
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Recent Activities */}
          <View style={{ marginBottom: SPACING.lg }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.md,
              }}
            >
              <Icon name="trending_up" size={16} color={COLORS.primary} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: COLORS.text.primary,
                  marginLeft: SPACING.sm,
                }}
              >
                Hoạt động gần đây
              </Text>
            </View>
            <View
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                borderRadius: BORDER_RADIUS.lg,
                padding: SPACING.md,
                borderWidth: 1,
                borderColor: 'rgba(148, 163, 184, 0.1)',
                ...SHADOWS.md,
              }}
            >
              {activities.length === 0 ? (
                <View style={{ paddingVertical: SPACING.lg, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.text.secondary }}>
                    Chưa có hoạt động nào
                  </Text>
                </View>
              ) : (
                <View>
                  {activities.map((activity, index) => {
                    const statusColorMap: { [key: string]: string } = {
                      success: COLORS.accent.green,
                      info: COLORS.primary,
                      warning: COLORS.accent.yellow,
                      error: COLORS.accent.red,
                    };
                    const statusColor = statusColorMap[activity.status] || COLORS.primary;

                    return (
                      <TouchableOpacity
                        key={activity.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: SPACING.sm,
                          borderBottomWidth: index < activities.length - 1 ? 1 : 0,
                          borderBottomColor: 'rgba(148, 163, 184, 0.1)',
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: statusColor,
                            marginRight: SPACING.md,
                          }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: '500',
                              color: COLORS.text.primary,
                              marginBottom: SPACING.xs / 2,
                            }}
                          >
                            {activity.action}
                          </Text>
                          <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                            {activity.time} • {activity.date}
                          </Text>
                        </View>
                        <Icon name="chevron_right" size={16} color={COLORS.text.secondary} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Notification Panel Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={closeNotifications}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-start',
            paddingTop: SPACING.xxl * 2,
          }}
          activeOpacity={1}
          onPress={closeNotifications}
        >
          <View
            style={{
              backgroundColor: COLORS.surface.dark,
              borderTopLeftRadius: BORDER_RADIUS.xl,
              borderTopRightRadius: BORDER_RADIUS.xl,
              maxHeight: '70%',
              paddingTop: SPACING.lg,
            }}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: SPACING.lg,
                paddingBottom: SPACING.md,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(148, 163, 184, 0.1)',
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.xs / 2,
                  }}
                >
                  Thông báo
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                  {unreadCount} thông báo mới
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={markAllAsRead}
                    style={{
                      padding: SPACING.sm,
                      marginRight: SPACING.sm,
                    }}
                  >
                    <Icon name="done_all" size={18} color={COLORS.accent.green} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={closeNotifications}>
                  <Icon name="close" size={20} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications List */}
            <ScrollView
              style={{ maxHeight: 400 }}
              showsVerticalScrollIndicator={false}
            >
              {notifications.length === 0 ? (
                <View style={{ padding: SPACING.xxl, alignItems: 'center' }}>
                  <Text style={{ fontSize: 48, marginBottom: SPACING.md }}>🔔</Text>
                  <Text style={{ fontSize: 14, color: COLORS.text.secondary }}>
                    Không có thông báo
                  </Text>
                </View>
              ) : (
                notifications.map((notification) => {
                  const bgColors = getNotificationBg(notification.type);
                  return (
                    <TouchableOpacity
                      key={notification.id}
                      onPress={() => {
                        if (notification.unread) {
                          markAsRead(notification.id);
                        }
                      }}
                      style={{
                        padding: SPACING.md,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(148, 163, 184, 0.1)',
                        backgroundColor: notification.unread
                          ? 'rgba(66, 69, 240, 0.05)'
                          : 'transparent',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: bgColors.bg,
                          borderWidth: 1,
                          borderColor: bgColors.border,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: SPACING.md,
                        }}
                      >
                        <Text style={{ fontSize: 18 }}>{notification.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: SPACING.xs / 2,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: '500',
                              color: COLORS.text.primary,
                              flex: 1,
                            }}
                          >
                            {notification.title}
                          </Text>
                          {notification.unread && (
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: COLORS.primary,
                                marginLeft: SPACING.sm,
                              }}
                            />
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.text.secondary,
                            marginBottom: SPACING.xs / 2,
                          }}
                          numberOfLines={2}
                        >
                          {notification.message}
                        </Text>
                        <Text style={{ fontSize: 11, color: COLORS.text.secondary }}>
                          {notification.time}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteNotification(notification.id)}
                        style={{
                          padding: SPACING.xs,
                          marginLeft: SPACING.sm,
                        }}
                      >
                        <Icon name="delete" size={16} color={COLORS.accent.red} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

