import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { EmployeeTabParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { AttendanceService } from '../../services/attendance.service';

type ScheduleScreenNavigationProp = BottomTabNavigationProp<EmployeeTabParamList, 'Schedule'>;

interface ScheduleScreenProps {
  navigation: ScheduleScreenNavigationProp;
}

const { width } = Dimensions.get('window');
// Calculate available width: Screen Width - (Outer View Padding * 2) - (Card Padding * 2) - (Border Width * 2)
const AVAILABLE_WIDTH = width - (SPACING.lg * 2) - (SPACING.lg * 2) - 2;
// 7 items per row, 6 gaps of SPACING.sm
const GAP_SIZE = SPACING.sm;
const CALENDAR_ITEM_SIZE = (AVAILABLE_WIDTH - (GAP_SIZE * 6)) / 7;

const monthNames = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const CELL_SIZE = (width - SPACING.lg * 2) / 7;

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function ScheduleScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Record<string, any>>({});
  const [leaveDays, setLeaveDays] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async (date: Date) => {
    try {
      setLoading(true);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;

      const data = await AttendanceService.getSchedule(monthStr);

      // Expected data format from API: 
      // { shifts: { 'YYYY-MM-DD': { startTime: '...', endTime: '...', type: '...' } }, 
      //   leaves: { 'YYYY-MM-DD': { type: '...', status: '...' } } }

      if (data) {
        setShifts(data.shifts || {});
        setLeaveDays(data.leaves || {});
      }
    } catch (error) {
      console.log('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSchedule(currentDate);
    }, [currentDate]) // Re-fetch when month changes
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const result = [];
    // Add empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }
    // Add days of current month
    for (let i = 1; i <= days; i++) {
      result.push(new Date(year, month, i));
    }
    return result;
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const days = getDaysInMonth(currentDate);
  const selectedShift = selectedDate ? shifts[selectedDate] : null;

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent.cyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: SPACING.xxl * 2,
          paddingBottom: SPACING.xl,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: '600', color: '#ffffff' }}>
          Lịch làm việc
        </Text>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
          Quản lý ca làm việc và ngày nghỉ
        </Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Calendar Navigation */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: SPACING.lg,
          }}
        >
          <TouchableOpacity
            onPress={() => changeMonth(-1)}
            style={{
              padding: SPACING.sm,
              backgroundColor: COLORS.surface.dark,
              borderRadius: BORDER_RADIUS.md,
              ...SHADOWS.sm,
            }}
          >
            <Icon name="chevron_left" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text.primary }}>
            Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity
            onPress={() => changeMonth(1)}
            style={{
              padding: SPACING.sm,
              backgroundColor: COLORS.surface.dark,
              borderRadius: BORDER_RADIUS.md,
              ...SHADOWS.sm,
            }}
          >
            <Icon name="chevron_right" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : (
          <>
            {/* Days Header */}
            <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
              {DAYS_OF_WEEK.map((day, index) => (
                <View key={index} style={{ width: CELL_SIZE, alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: index === 0 || index === 6 ? COLORS.accent.red : COLORS.text.secondary,
                    }}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg }}>
              {days.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
                }

                const dateStr = formatDate(date);
                const hasShift = shifts[dateStr];
                const isLeave = leaveDays[dateStr];
                const isSelected = selectedDate === dateStr;
                const isCurrentDay = isToday(date);

                const day = date.getDate();

                // Check if day is from another month (if days includes padding days)
                // const isCurrentMonth = date.getMonth() === currentMonth.getMonth(); 
                // However, looks like we only render current month days based on logic? 
                // Let's assume days are correct.

                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const isLeaveDay = !!leaveDays[dateStr];

                // Determine day type and colors
                let backgroundColor = 'transparent';
                let textColor = COLORS.text.secondary;
                let borderColor = 'transparent';
                let dotColor = COLORS.primary;

                if (isSelected) {
                  backgroundColor = COLORS.primary;
                  textColor = '#ffffff';
                  borderColor = COLORS.primary;
                  dotColor = '#ffffff';
                } else if (isLeaveDay) {
                  backgroundColor = COLORS.accent.red;
                  textColor = '#ffffff';
                  borderColor = COLORS.accent.red;
                  dotColor = '#ffffff';
                } else if (hasShift) {
                  backgroundColor = COLORS.accent.green;
                  textColor = '#ffffff';
                  borderColor = COLORS.accent.green;
                  dotColor = '#ffffff';
                } else if (isWeekend) {
                  backgroundColor = 'rgba(148, 163, 184, 0.2)';
                  textColor = COLORS.text.secondary;
                  borderColor = 'rgba(148, 163, 184, 0.3)';
                  dotColor = COLORS.text.secondary;
                } else {
                  textColor = COLORS.text.primary;
                }

                return (
                  <TouchableOpacity
                    key={dateStr}
                    onPress={() => setSelectedDate(dateStr)}
                    style={{
                      width: CALENDAR_ITEM_SIZE,
                      height: CALENDAR_ITEM_SIZE,
                      borderRadius: BORDER_RADIUS.lg,
                      backgroundColor,
                      borderWidth: 1,
                      borderColor,
                      justifyContent: 'center',
                      alignItems: 'center',
                      // marginRight and marginBottom handled by parent gap
                      ...(isSelected ? SHADOWS.lg : {}),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: textColor,
                      }}
                    >
                      {day}
                    </Text>

                    {/* Dot indicator */}
                    {(hasShift || isLeaveDay) && (
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: dotColor,
                          marginTop: 2,
                        }}
                      />
                    )}

                    {/* Today indicator */}
                    {isCurrentDay && !isSelected && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: COLORS.accent.cyan,
                        }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>


            {/* Legend */}
            <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md }}>
              <View
                style={{
                  backgroundColor: COLORS.surface.dark,
                  borderRadius: BORDER_RADIUS.lg,
                  padding: SPACING.md,
                  borderWidth: 1,
                  borderColor: 'rgba(148, 163, 184, 0.1)',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: COLORS.text.secondary,
                    marginBottom: SPACING.md,
                  }}
                >
                  Chú thích
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '50%',
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 8,
                        backgroundColor: COLORS.accent.green,
                        marginRight: SPACING.sm,
                      }}
                    />
                    <Text style={{ fontSize: 12, color: COLORS.text.primary }}>
                      Ca làm việc
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '50%',
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 8,
                        backgroundColor: COLORS.accent.red,
                        marginRight: SPACING.sm,
                      }}
                    />
                    <Text style={{ fontSize: 12, color: COLORS.text.primary }}>
                      Nghỉ phép
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '50%',
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 8,
                        backgroundColor: 'rgba(148, 163, 184, 0.2)',
                        marginRight: SPACING.sm,
                      }}
                    />
                    <Text style={{ fontSize: 12, color: COLORS.text.primary }}>
                      Cuối tuần
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '50%',
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.accent.cyan]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 8,
                        marginRight: SPACING.sm,
                      }}
                    />
                    <Text style={{ fontSize: 12, color: COLORS.text.primary }}>
                      Đã chọn
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Shift Details */}
            {
              selectedShift && selectedDate && (
                <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: SPACING.md,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: COLORS.primary,
                        marginRight: SPACING.sm,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: COLORS.text.primary,
                      }}
                    >
                      Chi tiết ca làm
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.6)',
                      borderRadius: BORDER_RADIUS.xl,
                      padding: SPACING.lg,
                      borderWidth: 1,
                      borderColor: 'rgba(148, 163, 184, 0.1)',
                      ...SHADOWS.lg,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: SPACING.lg,
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            fontSize: 11,
                            color: COLORS.text.secondary,
                            marginBottom: SPACING.xs / 2,
                          }}
                        >
                          Ngày làm việc
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: COLORS.text.primary,
                          }}
                        >
                          {new Date(selectedDate as string).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          borderWidth: 1,
                          borderColor: 'rgba(34, 197, 94, 0.3)',
                          borderRadius: BORDER_RADIUS.md,
                          paddingHorizontal: SPACING.sm,
                          paddingVertical: SPACING.xs / 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: COLORS.accent.green,
                          }}
                        >
                          Đã xếp lịch
                        </Text>
                      </View>
                    </View>

                    <View>
                      {/* Working Hours */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: SPACING.md,
                          borderRadius: BORDER_RADIUS.lg,
                          backgroundColor: 'rgba(66, 69, 240, 0.1)',
                          marginBottom: SPACING.sm,
                        }}
                      >
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
                        <View>
                          <Text
                            style={{
                              fontSize: 11,
                              color: COLORS.text.secondary,
                              marginBottom: SPACING.xs / 2,
                            }}
                          >
                            Giờ làm việc
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: '500',
                              color: COLORS.text.primary,
                            }}
                          >
                            {selectedShift.start} - {selectedShift.end}
                          </Text>
                        </View>
                      </View>

                      {/* Break Time */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: SPACING.md,
                          borderRadius: BORDER_RADIUS.lg,
                          backgroundColor: 'rgba(34, 211, 238, 0.1)',
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: 'rgba(34, 211, 238, 0.2)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: SPACING.md,
                          }}
                        >
                          <Icon name="coffee" size={20} color={COLORS.accent.cyan} />
                        </View>
                        <View>
                          <Text
                            style={{
                              fontSize: 11,
                              color: COLORS.text.secondary,
                              marginBottom: SPACING.xs / 2,
                            }}
                          >
                            Thời gian nghỉ
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: '500',
                              color: COLORS.text.primary,
                            }}
                          >
                            {selectedShift.break}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )
            }

            {/* No Shift Message */}
            {
              !selectedShift && selectedDate && (
                <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg }}>
                  <View
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.6)',
                      borderRadius: BORDER_RADIUS.xl,
                      padding: SPACING.xxl,
                      borderWidth: 1,
                      borderColor: 'rgba(148, 163, 184, 0.1)',
                      alignItems: 'center',
                      ...SHADOWS.lg,
                    }}
                  >
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        backgroundColor: 'rgba(148, 163, 184, 0.2)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: SPACING.md,
                      }}
                    >
                      <Icon name="schedule" size={32} color={COLORS.text.secondary} />
                    </View>
                    <Text style={{ fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' }}>
                      Không có ca làm việc trong ngày này
                    </Text>
                  </View>
                </View>
              )
            }
          </>
        )
        }
      </ScrollView>
    </View>
  );
}
