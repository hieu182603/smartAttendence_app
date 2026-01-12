import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ManagerDrawerParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { EmptyState } from '../../components/EmptyState';
import { useTeam } from '../../hooks/useTeam';

type ManagerScheduleScreenNavigationProp = DrawerNavigationProp<
  ManagerDrawerParamList,
  'ManagerSchedule'
>;

interface ManagerScheduleScreenProps {
  navigation: ManagerScheduleScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const CALENDAR_ITEM_SIZE = (width - SPACING.lg * 2 - SPACING.sm * 6) / 7;

const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function ManagerScheduleScreen({ navigation }: ManagerScheduleScreenProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { members, isLoading, onlineCount, onLeaveCount } = useTeam();

  // Get current month info
  const monthName = currentDate.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  // Get days in current month
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = (date: Date | null) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Mock schedule data (in real app, this would come from API)
  const hasShift = (date: Date | null, memberId: string) => {
    if (!date) return false;
    // Mock: most days have shifts, weekends don't
    return !isWeekend(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return COLORS.status.success;
      case 'on-leave':
        return COLORS.status.warning;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return '● Trực tuyến';
      case 'on-leave':
        return '○ Nghỉ phép';
      default:
        return '○ Offline';
    }
  };

  return (
    <View style={globalStyles.container}>
      {/* Header - Orange/Gold Theme for Manager */}
      <LinearGradient
        colors={['#f97316', '#ea580c', '#f59e0b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Icon name="menu" size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Lịch làm việc team</Text>
            <Text style={styles.headerSubtitle}>Xem lịch làm việc của các thành viên</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity
            onPress={goToPreviousMonth}
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <Icon name="chevron_left" size={20} color={COLORS.text.primary} />
          </TouchableOpacity>

          <Text style={styles.monthName}>{monthName}</Text>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <Icon name="chevron_right" size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar Header - Days of Week */}
        <View style={styles.calendarHeader}>
          {dayNames.map(day => (
            <View key={day} style={styles.calendarHeaderDay}>
              <Text style={styles.calendarHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Mini Calendar */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarGrid}>
            {daysInMonth.map((date, index) => {
              if (!date) {
                return <View key={index} style={styles.calendarDayEmpty} />;
              }

              const today = isToday(date);
              const weekend = isWeekend(date);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    today && styles.calendarDayToday,
                    weekend && styles.calendarDayWeekend,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      today && styles.calendarDayTextToday,
                      weekend && styles.calendarDayTextWeekend,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Team Members Schedule */}
        <View style={styles.teamSection}>
          <View style={styles.sectionHeader}>
            <Icon name="people" size={18} color="#f97316" />
            <Text style={styles.sectionTitle}>Lịch làm việc hôm nay</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon="people"
                title="Chưa có thành viên"
                description="Danh sách đội nhóm trống"
              />
            </View>
          ) : (
            <View style={styles.membersList}>
              {members.map(member => {
                const todayShift = hasShift(new Date(), member.id);
                const statusColor = getStatusColor(member.status);

                return (
                  <View key={member.id} style={styles.memberCard}>
                    <View style={styles.memberContent}>
                      {/* Avatar */}
                      <View style={styles.avatarContainer}>
                        <LinearGradient
                          colors={['rgba(249, 115, 22, 0.2)', 'rgba(245, 158, 11, 0.1)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.avatar}
                        >
                          <Text style={styles.avatarText}>
                            {member.name.charAt(0).toUpperCase()}
                          </Text>
                        </LinearGradient>
                        <View
                          style={[
                            styles.statusIndicator,
                            { backgroundColor: statusColor },
                          ]}
                        />
                      </View>

                      {/* Info */}
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberDepartment}>{member.department}</Text>

                        {/* Schedule Info */}
                        {member.status === 'on-leave' ? (
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                borderColor: 'rgba(245, 158, 11, 0.2)',
                              },
                            ]}
                          >
                            <Text style={[styles.statusBadgeText, { color: '#f59e0b' }]}>
                              Đang nghỉ phép
                            </Text>
                          </View>
                        ) : todayShift ? (
                          <View style={styles.shiftInfo}>
                            <View style={styles.shiftRow}>
                              <Icon name="schedule" size={14} color={COLORS.status.success} />
                              <Text style={styles.shiftText}>08:00 - 17:00</Text>
                            </View>
                            <View style={styles.shiftRow}>
                              <Icon name="location_on" size={14} color={COLORS.text.secondary} />
                              <Text style={styles.shiftLocation}>Văn phòng chính</Text>
                            </View>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                borderColor: 'rgba(148, 163, 184, 0.2)',
                              },
                            ]}
                          >
                            <Text style={[styles.statusBadgeText, { color: COLORS.text.secondary }]}>
                              Không có ca làm
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Status Badge */}
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              member.status === 'online'
                                ? 'rgba(11, 218, 104, 0.1)'
                                : member.status === 'on-leave'
                                  ? 'rgba(245, 158, 11, 0.1)'
                                  : 'rgba(148, 163, 184, 0.1)',
                            borderColor:
                              member.status === 'online'
                                ? 'rgba(11, 218, 104, 0.2)'
                                : member.status === 'on-leave'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(148, 163, 184, 0.2)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                member.status === 'online'
                                  ? COLORS.status.success
                                  : member.status === 'on-leave'
                                    ? '#f59e0b'
                                    : COLORS.text.secondary,
                            },
                          ]}
                        >
                          {getStatusLabel(member.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Weekly Summary */}
        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar_month" size={18} color="#f97316" />
            <Text style={styles.sectionTitle}>Tóm tắt tuần này</Text>
          </View>

          <View style={styles.summaryGrid}>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: 'rgba(11, 218, 104, 0.1)',
                  borderColor: 'rgba(11, 218, 104, 0.2)',
                },
              ]}
            >
              <View style={styles.summaryCardHeader}>
                <Icon name="people" size={16} color={COLORS.status.success} />
                <Text style={styles.summaryCardLabel}>Đang làm việc</Text>
              </View>
              <Text style={[styles.summaryCardValue, { color: COLORS.status.success }]}>
                {onlineCount}
              </Text>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderColor: 'rgba(245, 158, 11, 0.2)',
                },
              ]}
            >
              <View style={styles.summaryCardHeader}>
                <Icon name="calendar_month" size={16} color="#f59e0b" />
                <Text style={styles.summaryCardLabel}>Nghỉ phép</Text>
              </View>
              <Text style={[styles.summaryCardValue, { color: '#f59e0b' }]}>
                {onLeaveCount}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    zIndex: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitleContainer: {
    marginTop: SPACING.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface.dark,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  calendarHeaderDay: {
    flex: 1,
    alignItems: 'center',
  },
  calendarHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  calendarContainer: {
    backgroundColor: COLORS.surface.dark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayEmpty: {
    width: CALENDAR_ITEM_SIZE,
    height: CALENDAR_ITEM_SIZE,
  },
  calendarDay: {
    width: CALENDAR_ITEM_SIZE,
    height: CALENDAR_ITEM_SIZE,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.xs / 2,
  },
  calendarDayToday: {
    backgroundColor: '#f97316',
    ...SHADOWS.md,
  },
  calendarDayWeekend: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  calendarDayTextToday: {
    color: '#ffffff',
  },
  calendarDayTextWeekend: {
    color: COLORS.text.secondary,
  },
  teamSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  loadingContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: SPACING.xxl,
  },
  membersList: {
    gap: SPACING.md,
  },
  memberCard: {
    backgroundColor: COLORS.surface.dark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    ...SHADOWS.sm,
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.surface.dark,
  },
  memberInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  memberDepartment: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  shiftInfo: {
    gap: SPACING.xs,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  shiftText: {
    fontSize: 12,
    color: COLORS.status.success,
  },
  shiftLocation: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  summarySection: {
    marginTop: SPACING.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  summaryCardLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
