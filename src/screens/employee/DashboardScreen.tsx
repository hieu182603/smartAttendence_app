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
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { AttendanceService } from '../../services/attendance.service';
import { LeaveService } from '../../services/leave.service';
import { NotificationService } from '../../services/notification.service';
import { AttendanceStats, Activity, Notification } from '../../types';

type DashboardScreenNavigationProp = BottomTabNavigationProp<EmployeeTabParamList, 'Home'>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
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
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Parallel fetching for performance
      const [balance, recentAttendance, notificationsData] = await Promise.all([
        LeaveService.getBalance().catch(e => ({ annual: { remaining: 0, total: 12 } })), // Fallback if fails
        AttendanceService.getRecent(5).catch(e => []),
        NotificationService.getAll({ limit: 3, unreadOnly: true }).catch(e => [])
      ]);

      // Update Stats
      setStats(prev => ({
        ...prev,
        leavesRemaining: balance.annual?.remaining || 0,
        totalLeaves: balance.annual?.total || 12,
      }));

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
      const mappedActivities = recentAttendance.map((item: any) => ({
        id: item._id,
        type: item.checkOutTime ? 'check-out' : 'check-in',
        time: item.checkOutTime
          ? new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(item.checkInTime).toLocaleDateString(),
        status: item.status === 'LATE' ? 'warning' : 'success',
        title: item.checkOutTime ? 'Check-out' : 'Check-in thành công',
        subtitle: item.checkOutTime ? 'Hoàn thành ca làm việc' : 'Bắt đầu ca làm việc',
      }));
      setActivities(mappedActivities);

      // Update Notifications
      if (Array.isArray(notificationsData)) {
        const mappedNotifications = notificationsData.map((item: any) => ({
          id: item._id,
          type: item.type,
          title: item.title,
          message: item.message,
          time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: !item.isRead,
          icon: item.type === 'approved' ? 'check_circle' :
            item.type === 'rejected' ? 'cancel' :
              item.type === 'reminder' ? 'alarm' : 'info',
        }));
        setNotifications(mappedNotifications);
      }

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
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'approved': return { bg: 'rgba(34, 197, 94, 0.1)', icon: COLORS.accent.green };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', icon: COLORS.accent.red };
      case 'warning': return { bg: 'rgba(245, 158, 11, 0.1)', icon: COLORS.accent.yellow };
      default: return { bg: 'rgba(66, 69, 240, 0.1)', icon: COLORS.primary };
    }
  };

  const userName = user?.name || 'Nguyễn Văn A';
  const userAvatar = user?.avatar;

  const unreadCount = notifications.filter(n => n.unread).length;

  const greeting = getGreeting();


  // Check In/Out State
  const [isProcessing, setIsProcessing] = useState(false);

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
                Hãy bắt đầu một ngày làm việc hiệu quả
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
                {isCheckedIn ? 'Đang làm việc' : 'Sẵn sàng làm việc'}
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' }}>
                {isCheckedIn ? 'Hãy chấm công ra khi kết thúc ca làm việc.' : 'Chúc bạn một ngày làm việc hiệu quả!'}
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
                    {isCheckedIn ? 'Chấm công ra' : 'Chấm công vào'}
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
                <TouchableOpacity
                  onPress={() => navigation.navigate('AttendanceHistory' as any)}
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
                    giờ chi tiết &gt;
                  </Text>
                </TouchableOpacity>

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
                            {activity.title}
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
    </View>
  );
}

