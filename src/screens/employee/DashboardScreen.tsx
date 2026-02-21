import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { EmployeeTabParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../context/AuthContext';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS, useTheme } from '../../utils/styles';
import { useTranslation } from '../../i18n';
import { Icon } from '../../components/Icon';
import { AttendanceService } from '../../services/attendance.service';
import { LeaveService } from '../../services/leave.service';
import { NotificationService } from '../../services/notification.service';
import { AttendanceStats, Activity, Notification } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { usePreferences } from '../../context/PreferencesContext';

type DashboardScreenNavigationProp = BottomTabNavigationProp<EmployeeTabParamList, 'Home'>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { t } = useTranslation();
  const { notificationsEnabled } = usePreferences();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [stats, setStats] = useState({
    attendanceLikelihood: 100,
    leavesRemaining: 0,
    totalLeaves: 12,
    overtimeHours: 0,
    thisMonth: 0,
    totalDays: 0,
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const fetchDashboardData = async () => {
    try {
      if (!hasLoadedOnce) {
        setLoading(true);
        setIsLoading(true);
      }

      // Start independent fetches
      LeaveService.getBalance()
        .then(balance => {
          setStats(prev => ({
            ...prev,
            leavesRemaining: balance.annual?.remaining || 0,
            totalLeaves: balance.annual?.total || 12,
          }));
        })
        .catch(e => console.log('Leave balance error', e));

      NotificationService.getUnreadCount()
        .then(unreadData => {
          if (unreadData && typeof unreadData.count === 'number') {
            setUnreadCount(unreadData.count);
          }
        })
        .catch(e => console.log('Unread count error', e));

      NotificationService.getAll({ limit: 3, unreadOnly: true })
        .then(notificationsData => {
          if (notificationsData && Array.isArray(notificationsData.notifications)) {
            const mappedNotifications = notificationsData.notifications.map((item: any) => {
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
            setNotifications(mappedNotifications);
          }
        })
        .catch(e => console.log('Notifications error', e));

      const recentAttendance = await AttendanceService.getRecent(5).catch(e => []);

      // Determine check-in status from today's latest attendance
      if (Array.isArray(recentAttendance) && recentAttendance.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = recentAttendance.find((item: any) => {
          const recordDate = new Date(item.checkInTime).toISOString().split('T')[0];
          return recordDate === today;
        });
        // If there's a today record with checkIn but no checkOut, user is currently checked in
        setIsCheckedIn(!!todayRecord && !!todayRecord.checkInTime && !todayRecord.checkOutTime);
      }

      // Update Activities
      const mappedActivities = (Array.isArray(recentAttendance) ? recentAttendance : []).map((item: any) => {
        const outDate = item.checkOutTime ? new Date(item.checkOutTime) : null;
        const inDate = item.checkInTime ? new Date(item.checkInTime) : new Date();

        return {
          id: item._id,
          type: item.checkOutTime ? 'check-out' : 'check-in',
          time: item.checkOutTime && outDate && !isNaN(outDate.getTime())
            ? outDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : (!isNaN(inDate.getTime()) ? inDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'),
          date: !isNaN(inDate.getTime()) ? inDate.toLocaleDateString() : '--/--/----',
          status: item.status === 'LATE' ? 'warning' : 'success',
          title: item.checkOutTime ? 'Check-out' : 'Check-in thành công',
          subtitle: item.checkOutTime ? 'Hoàn thành ca làm việc' : 'Bắt đầu ca làm việc',
        };
      });
      setActivities(mappedActivities);

    } catch (error) {
      console.log('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
      setRefreshing(false);
      setHasLoadedOnce(true);
    }
  };

  // Only show full loading spinner on first load
  // On subsequent tab switches, fetch silently in background
  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnce) {
        setIsLoading(true);
      }
      fetchDashboardData();
    }, [hasLoadedOnce])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

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


  // 🔴 Realtime: Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      // Suppress in-app notification if user disabled notifications
      if (!notificationsEnabled) return;
      console.log('[Dashboard] New notification via socket:', data.title);
      // Add to notifications list
      const createdDate = data.createdAt ? new Date(data.createdAt) : new Date();
      const mapped = {
        id: data._id,
        type: data.type,
        title: data.title,
        message: data.message,
        time: !isNaN(createdDate.getTime()) ? createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        unread: !data.isRead,
        icon: data.type === 'approved' || data.type === 'request_approved' ? 'check_circle' :
          data.type === 'rejected' || data.type === 'request_rejected' ? 'cancel' :
            data.type === 'reminder' ? 'alarm' : 'info',
      };
      setNotifications(prev => [mapped, ...prev].slice(0, 5));
      setUnreadCount(prev => prev + 1);
    };

    const handleAttendanceUpdate = () => {
      // Re-fetch dashboard data when attendance is updated
      fetchDashboardData();
    };

    socket.on('notification', handleNewNotification);
    socket.on('attendance-updated', handleAttendanceUpdate);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('attendance-updated', handleAttendanceUpdate);
    };
  }, [socket]);

  const handleCheckInOut = () => {
    // Navigate to Attendance Screen for Face + Location Check
    // We pass the mode (check-in if not currently checked in, check-out otherwise)
    const mode = isCheckedIn ? 'check-out' : 'check-in';

    // @ts-ignore - Navigation type safety requires full typed hooks but for now ignore
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
                    Thứ Hai
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                    08:00 - 17:00
                  </Text>
                </View>
              </View>

              {/* Additional Stats Row */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.xl }}>
                {/* Attendance This Month */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('AttendanceHistory' as any)}
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
                        key={activity.id}
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

