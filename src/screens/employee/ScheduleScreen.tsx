import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { EmployeeTabParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';

type ScheduleScreenNavigationProp = BottomTabNavigationProp<EmployeeTabParamList, 'Schedule'>;

interface ScheduleScreenProps {
  navigation: ScheduleScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const CALENDAR_ITEM_SIZE = (width - SPACING.lg * 2 - SPACING.sm * 6) / 7;

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

const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Mock shift data matching web version
const shifts: { [key: string]: { start: string; end: string; break: string } } = {
  '2026-01-12': {
    start: '08:00',
    end: '17:00',
    break: '60 phút',
  },
  '2026-01-13': {
    start: '08:00',
    end: '17:00',
    break: '60 phút',
  },
  '2026-01-14': {
    start: '08:00',
    end: '17:00',
    break: '60 phút',
  },
  '2026-01-16': {
    start: '08:00',
    end: '17:00',
    break: '60 phút',
  },
  '2026-01-17': {
    start: '08:00',
    end: '17:00',
    break: '60 phút',
  },
  '2026-01-19': {
    start: '08:00',
    end: '17:00',
    break: '60 phút',
  },
  '2026-01-20': {
    start: '08:00',
    end: '17:00',
    break: '60 phút',
  },
  '2026-01-21': {
    start: '08:00',
    end: '17:00',
    break: '60 phút',
  },
  '2026-01-23': {
    start: '08:00',
    end: '17:00',
    break: '60 phút',
  },
  '2026-01-24': {
    start: '08:00',
    end: '17:00',
    break: '60 phút',
  },
};

// Leave days (red)
const leaveDays = ['2026-01-15', '2026-01-16', '2026-01-20'];

export default function ScheduleScreen({ navigation }: ScheduleScreenProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0)); // January 2026
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-01-12');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
      ),
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
      ),
    );
  };

  const days = getDaysInMonth(currentMonth);
  const selectedShift = selectedDate ? shifts[selectedDate] : null;
  const today = new Date();
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent.cyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: SPACING.xxl * 2,
          paddingBottom: SPACING.xl,
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: '#ffffff',
                marginRight: SPACING.xs,
              }}
            >
              Lịch làm việc
            </Text>
            <Icon name="auto_awesome" size={20} color={COLORS.accent.cyan} />
          </View>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
            Xem lịch ca làm của bạn
          </Text>
        </View>
      </LinearGradient>

      {/* Calendar */}
      <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
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
          {/* Month Navigator */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.lg,
            }}
          >
            <TouchableOpacity
              onPress={prevMonth}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: COLORS.surface.dark,
                justifyContent: 'center',
                alignItems: 'center',
                ...SHADOWS.md,
              }}
            >
              <Icon name="chevron_left" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="event" size={16} color={COLORS.primary} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: COLORS.text.primary,
                    marginLeft: SPACING.xs,
                  }}
                >
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={nextMonth}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: COLORS.surface.dark,
                justifyContent: 'center',
                alignItems: 'center',
                ...SHADOWS.md,
              }}
            >
              <Icon name="chevron_right" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Day Names */}
          <View
            style={{
              flexDirection: 'row',
              marginBottom: SPACING.sm,
            }}
          >
            {dayNames.map((day, index) => (
              <View
                key={day}
                style={{
                  width: CALENDAR_ITEM_SIZE,
                  alignItems: 'center',
                  paddingVertical: SPACING.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: index === 0 ? COLORS.accent.red : COLORS.text.secondary,
                  }}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            {days.map((day, index) => {
              if (day === null) {
                return (
                  <View
                    key={`empty-${index}`}
                    style={{
                      width: CALENDAR_ITEM_SIZE,
                      height: CALENDAR_ITEM_SIZE,
                      marginRight: SPACING.sm,
                      marginBottom: SPACING.sm,
                    }}
                  />
                );
              }

              const dateKey = formatDateKey(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day,
              );
              const hasShift = shifts[dateKey];
              const isSelected = selectedDate === dateKey;
              const isToday = dateKey === todayKey;

              const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day,
              );
              const dayOfWeek = date.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isLeaveDay = leaveDays.includes(dateKey);

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
                  key={dateKey}
                  onPress={() => setSelectedDate(dateKey)}
                  style={{
                    width: CALENDAR_ITEM_SIZE,
                    height: CALENDAR_ITEM_SIZE,
                    borderRadius: BORDER_RADIUS.lg,
                    backgroundColor,
                    borderWidth: 1,
                    borderColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: SPACING.sm,
                    marginBottom: SPACING.sm,
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
                  {isToday && !isSelected && (
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
        </View>
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
      {selectedShift && selectedDate && (
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
                  {new Date(selectedDate).toLocaleDateString('vi-VN', {
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
      )}

      {/* No Shift Message */}
      {!selectedShift && selectedDate && (
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
      )}
    </ScrollView>
  );
}
