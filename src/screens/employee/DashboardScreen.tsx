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
import { useAuth } from '../../context/AuthContext';
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

  const [stats, setStats] = useState<AttendanceStats>({
    leavesRemaining: 0,
    totalLeaves: 12, // Default
    thisMonth: 0,
    totalDays: 26, // Approx working days
    overtimeHours: 0,
    lateCount: 0,
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const { AttendanceService } = await import('../../services/attendance.service');
      const { LeaveService } = await import('../../services/leave.service');

      // Fetch Leave Balance
      try {
        const balance = await LeaveService.getBalance();
        setStats(prev => ({
          ...prev,
          leavesRemaining: balance.annual?.remaining || 0,
          totalLeaves: balance.annual?.total || 12,
        }));
      } catch (e) {
        console.log('Error fetching leave balance', e);
      }

      // Fetch Recent Activity
      try {
        const recent = await AttendanceService.getRecent(5);
        const mappedActivities = recent.map((item: any) => ({
          id: item._id || Math.random().toString(),
          userId: user?.id,
          action: item.checkOut ? 'Chấm công ra' : 'Chấm công vào',
          time: item.checkOut ? item.checkOut : item.checkIn, // This needs formatting
          date: item.date,
          timestamp: new Date(item.date).getTime(),
          status: item.status === 'late' ? 'warning' : 'success',
          details: item.location,
        }));
        setActivities(mappedActivities);
      } catch (e) {
        console.log('Error fetching recent attendance', e);
      }

    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const userName = user?.name || 'Nguyễn Văn A';
  const userAvatar = user?.avatar;

  const unreadCount = notifications.filter(n => n.unread).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng! 👋' : hour < 18 ? 'Chào buổi chiều! 👋' : 'Chào buổi tối! 👋';


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

  // Check In/Out State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false); // Should fetch this from status
  const [location, setLocation] = useState<any>(null);

  const handleCheckInOut = async () => {
    try {
      setIsProcessing(true);

      const { AttendanceService } = await import('../../services/attendance.service');
      const Location = await import('expo-location');

      // 1. Get Location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setIsProcessing(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      // 2. Call API (Simulate Photo for now)
      if (isCheckedIn) {
        // Check Out
        await AttendanceService.checkOut({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || 0,
          // photo: ... (skip photo for now or implement camera)
        });
        alert('Check out successful!');
        setIsCheckedIn(false);
      } else {
        // Check In
        await AttendanceService.checkIn({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || 0,
        });
        alert('Check in successful!');
        setIsCheckedIn(true);
      }

      // Refresh Data
      fetchDashboardData();

    } catch (error: any) {
      console.error('Check in/out error', error);
      alert(error.response?.data?.message || 'Check in/out failed');
    } finally {
      setIsProcessing(false);
    }
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
          {/* Attendance Action Widget */}
          <View
            style={{
              backgroundColor: isCheckedIn ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              borderRadius: BORDER_RADIUS.lg,
              padding: SPACING.lg,
              marginBottom: SPACING.lg,
              borderWidth: 1,
              borderColor: isCheckedIn ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.xs,
                  }}
                >
                  {isCheckedIn ? 'Đang làm việc' : 'Sẵn sàng làm việc'}
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                  {isCheckedIn ? 'Nhớ chấm công ra khi về nhé!' : 'Chúc bạn một ngày làm việc hiệu quả!'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleCheckInOut}
                disabled={isProcessing}
                style={{
                  backgroundColor: isCheckedIn ? COLORS.accent.red : COLORS.accent.green,
                  paddingHorizontal: SPACING.lg,
                  paddingVertical: SPACING.md,
                  borderRadius: BORDER_RADIUS.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...SHADOWS.md,
                  opacity: isProcessing ? 0.7 : 1,
                }}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Icon name={isCheckedIn ? "logout" : "login"} size={20} color="#ffffff" />
                    <Text
                      style={{
                        color: '#ffffff',
                        fontWeight: '600',
                        fontSize: 14,
                        marginLeft: SPACING.sm,
                      }}
                    >
                      {isCheckedIn ? 'Chấm công ra' : 'Chấm công vào'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
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
    </View>
  );
}

