import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { EmployeeTabParamList, RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../context/AuthContext';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS, useTheme } from '../../utils/styles';
import { useTranslation } from '../../i18n';
import { Icon } from '../../components/Icon';
import { useSocket } from '../../context/SocketContext';
import { usePreferences } from '../../context/PreferencesContext';

// TanStack Query hooks
import { useLeaveBalance } from '../../hooks/useLeaveQueries';
import { useRecentAttendance, useAttendanceHistory } from '../../hooks/useAttendanceQueries';
import { useNotificationsList, useUnreadCount } from '../../hooks/useNotificationQueries';
import { useShiftSchedule } from '../../hooks/useShiftQueries';
import { queryKeys } from '../../hooks/queryKeys';

import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<EmployeeTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

// width is now obtained inside component via useWindowDimensions()

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const theme = useTheme();
  const { t } = useTranslation();
  const { notificationsEnabled } = usePreferences();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();

  // ─── Date calculations for queries ──────────────────────────────
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = now.toISOString().split('T')[0];
  // Next 7 days for shift lookup
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  // First and last day of current month for attendance count
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // ─── TanStack Query hooks ───────────────────────────────────────
  const {
    data: leaveBalance,
    isLoading: isLeaveLoading,
  } = useLeaveBalance();

  const {
    data: recentAttendance,
    isLoading: isAttendanceLoading,
    refetch: refetchAttendance,
  } = useRecentAttendance(5);

  const {
    data: unreadData,
    refetch: refetchUnread,
  } = useUnreadCount();

  const {
    data: notificationsData,
    refetch: refetchNotifications,
  } = useNotificationsList({ limit: 3, unreadOnly: true });

  // Fetch shift schedule for next 7 days
  const {
    data: shiftData,
    isLoading: isShiftLoading,
  } = useShiftSchedule(todayStr, nextWeekStr);

  // Fetch attendance history for current month to count days worked
  const {
    data: monthlyAttendance,
    isLoading: isMonthlyLoading,
  } = useAttendanceHistory({ from: firstDayOfMonth, to: lastDayOfMonth, limit: 50 });

  const isLoading = isLeaveLoading || isAttendanceLoading;

  // ─── Computed: next shift ───────────────────────────────────────
  const nextShift = useMemo(() => {
    if (!Array.isArray(shiftData) || shiftData.length === 0) {
      return { day: '--', time: '--:-- - --:--' };
    }
    // Find the next upcoming shift (today or future)
    const upcoming = shiftData
      .filter((s: any) => s.date >= todayStr)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))[0];

    if (!upcoming) return { day: '--', time: '--:-- - --:--' };

    const shiftDate = new Date(upcoming.date + 'T00:00:00');
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = dayNames[shiftDate.getDay()];
    const startTime = upcoming.startTime || '--:--';
    const endTime = upcoming.endTime || '--:--';

    return { day: dayName, time: `${startTime} - ${endTime}` };
  }, [shiftData, todayStr]);

  // ─── Computed: monthly attendance count ─────────────────────────
  const attendanceThisMonth = useMemo(() => {
    const records = monthlyAttendance?.records || monthlyAttendance;
    if (!Array.isArray(records)) return 0;
    // Count days with at least a check-in (present or late, not absent)
    return records.filter((r: any) =>
      r.status === 'present' || r.status === 'ontime' || r.status === 'late'
    ).length;
  }, [monthlyAttendance]);

  // ─── Derived state from query data ──────────────────────────────
  const stats = useMemo(() => ({
    leavesRemaining: leaveBalance?.annual?.remaining || 0,
    totalLeaves: leaveBalance?.annual?.total || 12,
    overtimeHours: 0,
    thisMonth: attendanceThisMonth,
    totalDays: totalDaysInMonth,
  }), [leaveBalance, attendanceThisMonth, totalDaysInMonth]);

  const unreadCount = unreadData?.count ?? 0;

  const notifications = useMemo(() => {
    if (!notificationsData?.notifications || !Array.isArray(notificationsData.notifications)) return [];
    return notificationsData.notifications.map((item: any) => {
      const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
      return {
        id: item._id,
        type: item.type,
        title: item.title,
        message: item.message,
        time: !isNaN(createdDate.getTime()) ? createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        unread: !item.isRead,
        icon: item.type === 'approved' ? 'check_circle' :
          item.type === 'rejected' ? 'cancel' :
            item.type === 'reminder' ? 'alarm' : 'info',
      };
    });
  }, [notificationsData]);

  const isCheckedIn = useMemo(() => {
    if (!Array.isArray(recentAttendance) || recentAttendance.length === 0) return false;
    // The most recent record is the first one (sorted by date desc)
    const latest = recentAttendance[0] as any;
    // API returns pre-formatted strings: checkIn = "08:30", checkOut = "17:30" or null
    return !!latest && !!latest.checkIn && !latest.checkOut;
  }, [recentAttendance]);

  const activities = useMemo(() => {
    if (!Array.isArray(recentAttendance)) return [];
    return recentAttendance.map((item: any) => {
      // API from /attendance/recent returns:
      // date: "Thứ ba, 2 tháng 3, 2026" (pre-formatted Vietnamese string)
      // checkIn: "08:30" (pre-formatted time string or null)
      // checkOut: "17:30" (pre-formatted time string or null)
      // status: "present" | "late" | "absent"
      const hasCheckOut = !!item.checkOut;

      return {
        id: item._id || item.id || Math.random().toString(),
        type: hasCheckOut ? 'check-out' : 'check-in',
        time: hasCheckOut ? item.checkOut : (item.checkIn || '--:--'),
        date: item.date || '--/--/----',
        status: item.status === 'late' ? 'warning' : 'success',
        title: hasCheckOut ? 'Check-out' : 'Check-in thành công',
        subtitle: hasCheckOut ? 'Hoàn thành ca làm việc' : 'Bắt đầu ca làm việc',
      };
    });
  }, [recentAttendance]);

  // ─── Pull-to-refresh ────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchAttendance(),
      refetchUnread(),
      refetchNotifications(),
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balance() }),
    ]);
    setRefreshing(false);
  }, [refetchAttendance, refetchUnread, refetchNotifications, queryClient]);

  // ─── Refetch on tab focus ───────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      // Just invalidate to trigger background refetch; cached data shown instantly
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.recent(5) });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    }, [queryClient])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.greetingMorning;
    if (hour < 18) return t.dashboard.greetingAfternoon;
    return t.dashboard.greetingEvening;
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'approved': return { bg: 'rgba(34, 197, 94, 0.1)', icon: COLORS.accent.green };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', icon: COLORS.accent.red };
      case 'warning': return { bg: 'rgba(245, 158, 11, 0.1)', icon: COLORS.accent.yellow };
      default: return { bg: 'rgba(66, 69, 240, 0.1)', icon: COLORS.primary };
    }
  };

  const userName = user?.name;
  const userAvatar = user?.avatar;
  const greeting = getGreeting();

  // Check In/Out State
  const [isProcessing, setIsProcessing] = useState(false);
  const { socket } = useSocket();

  // 🔴 Realtime: Listen for socket events → invalidate query cache
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      if (!notificationsEnabled) return;
      console.log('[Dashboard] New notification via socket:', data.title);
      // Invalidate queries so they refetch with new data
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    };

    const handleAttendanceUpdate = () => {
      // Invalidate attendance queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    };

    socket.on('notification', handleNewNotification);
    socket.on('attendance-updated', handleAttendanceUpdate);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('attendance-updated', handleAttendanceUpdate);
    };
  }, [socket, notificationsEnabled, queryClient]);

  const handleCheckInOut = () => {
    const mode = isCheckedIn ? 'check-out' : 'check-in';
    navigation.navigate('Attendance', { mode });
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
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
                    <Image
                      source={{ uri: userAvatar }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        ...SHADOWS.lg,
                      }}
                    />
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
                        {userName?.charAt(0)?.toUpperCase() || 'U'}
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
                    {t.dashboard.greeting},
                  </Text>
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                    {userName}
                  </Text>
                </View>
              </View>

              {/* Notification Bell */}
              <TouchableOpacity
                onPress={handleNotificationPress}
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
                {t.dashboard.subtitle}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.md }}>

          {/* Attendance Action Widget - Redesigned */}
          <LinearGradient
            colors={isCheckedIn ? [COLORS.accent.red, '#b91c1c'] : [COLORS.accent.green, '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: BORDER_RADIUS.xl,
              padding: SPACING.lg,
              marginBottom: SPACING.lg,
              ...SHADOWS.md,
            }}
          >
            <View style={{ marginBottom: SPACING.lg }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: SPACING.xs,
                }}
              >
                {isCheckedIn ? t.dashboard.working : t.dashboard.ready}
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' }}>
                {isCheckedIn ? t.dashboard.workingSubtitle : t.dashboard.readySubtitle}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCheckInOut}
              disabled={isProcessing}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: BORDER_RADIUS.lg,
                paddingVertical: SPACING.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                ...SHADOWS.sm,
              }}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={isCheckedIn ? COLORS.accent.red : COLORS.accent.green} />
              ) : (
                <>
                  <Icon
                    name={isCheckedIn ? "logout" : "login"}
                    size={24}
                    color={isCheckedIn ? COLORS.accent.red : COLORS.accent.green}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: isCheckedIn ? COLORS.accent.red : COLORS.accent.green,
                      marginLeft: SPACING.sm,
                    }}
                  >
                    {isCheckedIn ? t.dashboard.checkout : t.dashboard.checkin}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>

          {/* Stats Cards Grid */}
          {isLoading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
              {[1, 2, 3, 4].map(i => (
                <View
                  key={i}
                  style={{
                    width: (width - SPACING.lg * 3) / 2,
                    backgroundColor: theme.cardBg,
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
                    backgroundColor: theme.cardBg,
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    marginRight: SPACING.md,
                    marginBottom: SPACING.md,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
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
                  <Text style={{ fontSize: 11, color: theme.text.secondary, marginBottom: SPACING.xs }}>
                    {t.dashboard.stats.leaves}
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: '600',
                      color: theme.text.primary,
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    {stats.leavesRemaining}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                    {t.dashboard.stats.leaveDays}
                  </Text>
                </View>

                {/* Next Shift */}
                <View
                  style={{
                    width: (width - SPACING.lg * 3) / 2,
                    backgroundColor: theme.cardBg,
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    marginBottom: SPACING.md,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
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
                  <Text style={{ fontSize: 11, color: theme.text.secondary, marginBottom: SPACING.xs }}>
                    {t.dashboard.stats.nextShift}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: theme.text.primary,
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    {isShiftLoading ? '...' : nextShift.day}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                    {isShiftLoading ? '...' : nextShift.time}
                  </Text>
                </View>
              </View>

              {/* Additional Stats Row */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.xl }}>
                {/* Attendance This Month */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('AttendanceHistory')}
                  style={{
                    width: (width - SPACING.lg * 3) / 2,
                    backgroundColor: theme.cardBg,
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    marginRight: SPACING.md,
                    marginBottom: SPACING.md,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
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
                  <Text style={{ fontSize: 11, color: theme.text.secondary, marginBottom: SPACING.xs }}>
                    {t.dashboard.stats.attendance}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '600',
                      color: theme.text.primary,
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    {stats.thisMonth}/{stats.totalDays}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                    {t.dashboard.stats.details}
                  </Text>
                </TouchableOpacity>

                {/* Overtime */}
                <View
                  style={{
                    width: (width - SPACING.lg * 3) / 2,
                    backgroundColor: theme.cardBg,
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    marginBottom: SPACING.md,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
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
                  <Text style={{ fontSize: 11, color: theme.text.secondary, marginBottom: SPACING.xs }}>
                    {t.dashboard.stats.overtime}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '600',
                      color: theme.text.primary,
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    {stats.overtimeHours}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                    {t.dashboard.stats.overtimeHours}
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
                  color: theme.text.primary,
                  marginLeft: SPACING.sm,
                }}
              >
                {t.dashboard.recentActivity}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: BORDER_RADIUS.lg,
                padding: SPACING.md,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                ...SHADOWS.md,
              }}
            >
              {activities.length === 0 ? (
                <View style={{ paddingVertical: SPACING.lg, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: theme.text.secondary }}>
                    {t.dashboard.noActivity}
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
                        key={activity.id ?? index}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: SPACING.sm,
                          borderBottomWidth: index < activities.length - 1 ? 1 : 0,
                          borderBottomColor: theme.divider,
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
                              color: theme.text.primary,
                              marginBottom: SPACING.xs / 2,
                            }}
                          >
                            {activity.title}
                          </Text>
                          <Text style={{ fontSize: 12, color: theme.text.secondary }}>
                            {activity.time} • {activity.date}
                          </Text>
                        </View>
                        <Icon name="chevron_right" size={16} color={theme.text.secondary} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
