import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { useAttendanceHistory } from '../../hooks/useAttendanceQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/queryKeys';

type AttendanceHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AttendanceHistory'>;

interface AttendanceHistoryScreenProps {
    navigation: AttendanceHistoryScreenNavigationProp;
}


const getLocalISODate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

export default function AttendanceHistoryScreen({ navigation }: AttendanceHistoryScreenProps) {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(getLocalISODate());
    const [currentMonth, setCurrentMonth] = useState(getLocalISODate().substring(0, 7)); // YYYY-MM

    // Build date range for the month
    const dateRange = useMemo(() => {
        const [year, monthNum] = currentMonth.split('-');
        const from = `${year}-${monthNum}-01`;
        const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
        const to = `${year}-${monthNum}-${lastDay}`;
        return { from, to };
    }, [currentMonth]);

    // TanStack Query hook for attendance history
    const { data: historyResponse, isLoading } = useAttendanceHistory({
        from: dateRange.from,
        to: dateRange.to,
        limit: 100,
    });

    // Helper to parse duration string "Xh Ym"
    const parseDuration = (str: string) => {
        const h = str.match(/(\d+)h/)?.[1] || '0';
        const m = str.match(/(\d+)m/)?.[1] || '0';
        return parseInt(h) * 60 + parseInt(m);
    };

    // Derive markedDates and monthlyStats from query data
    const { markedDates, monthlyStats } = useMemo(() => {
        const data = (historyResponse as any)?.records || [];
        const newMarkedDates: any = {};
        let stats = { present: 0, late: 0, absent: 0, totalHours: 0 };

        data.forEach((item: any) => {
            let date = item.date;

            // Try Vietnamese date format fallback if standard ISO parse fails
            if (date && !/^\d{4}-\d{2}-\d{2}/.test(date)) {
                const dateRegex = /(\d{1,2})\s*(?:tháng|[/-])\s*(\d{1,2})(?:,\s*|\s+|[/-])\s*(\d{4})/;
                const match = dateRegex.exec(date);
                if (match) {
                    const day = parseInt(match[1], 10);
                    const mo = parseInt(match[2], 10);
                    const yr = parseInt(match[3], 10);
                    const d = new Date(yr, mo - 1, day);
                    if (!isNaN(d.getTime())) {
                        const offset = d.getTimezoneOffset() * 60000;
                        date = new Date(d.getTime() - offset).toISOString().split('T')[0];
                    }
                }
            }

            let color = COLORS.accent.green;
            if (item.status === 'late') color = COLORS.accent.yellow;
            if (item.status === 'absent' || item.status === 'on_leave') color = COLORS.accent.red;

            newMarkedDates[date] = {
                selected: date === selectedDate,
                marked: true,
                dotColor: color,
                details: {
                    status: item.status,
                    checkIn: item.checkIn || '--:--',
                    checkOut: item.checkOut || '--:--',
                    total: item.hours || '0h 0m'
                }
            };

            if (item.status === 'present') stats.present++;
            if (item.status === 'late') stats.late++;
            if (item.status === 'absent' || item.status === 'on_leave') stats.absent++;

            if (item.hours) {
                stats.totalHours += parseDuration(item.hours);
            }
        });

        // Ensure marked dates include current selection
        if (!newMarkedDates[selectedDate]) {
            newMarkedDates[selectedDate] = { selected: true };
        }

        const totalH = Math.floor(stats.totalHours / 60);
        const totalM = stats.totalHours % 60;
        const totalHoursStr = `${totalH}h ${totalM}m`;

        return {
            markedDates: newMarkedDates,
            monthlyStats: {
                present: stats.present,
                late: stats.late,
                absent: stats.absent,
                totalHours: totalHoursStr,
            },
        };
    }, [historyResponse, selectedDate]);

    // Derive day details from markedDates
    const dayDetails = useMemo(() => {
        return markedDates[selectedDate]?.details || null;
    }, [selectedDate, markedDates]);

    const onMonthChange = (date: DateData) => {
        const newMonth = `${date.year}-${String(date.month).padStart(2, '0')}`;
        setCurrentMonth(newMonth);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return COLORS.accent.green;
            case 'late': return COLORS.accent.yellow;
            case 'absent': return COLORS.accent.red;
            default: return COLORS.text.secondary;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'present': return 'Đúng giờ';
            case 'late': return 'Đi muộn';
            case 'absent': return 'Vắng mặt';
            default: return 'Không có dữ liệu';
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
                    paddingTop: SPACING.xxl * 1.5,
                    paddingBottom: SPACING.xl,
                    paddingHorizontal: SPACING.md,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ padding: SPACING.sm }}
                    >
                        <Icon name="arrow_back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginLeft: SPACING.sm }}>
                        Lịch sử chấm công
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={{ paddingBottom: SPACING.xxl }}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* Calendar Section */}
                <View style={{
                    margin: SPACING.md,
                    borderRadius: BORDER_RADIUS.lg,
                    overflow: 'hidden',
                    ...SHADOWS.md,
                    backgroundColor: COLORS.surface.dark
                }}>
                    <Calendar
                        current={currentMonth}
                        onDayPress={(day: DateData) => {
                            setSelectedDate(day.dateString);
                        }}
                        onMonthChange={onMonthChange}
                        markedDates={markedDates}
                        theme={{
                            backgroundColor: COLORS.surface.dark,
                            calendarBackground: COLORS.surface.dark,
                            textSectionTitleColor: '#b6c1cd',
                            selectedDayBackgroundColor: COLORS.primary,
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: COLORS.accent.cyan,
                            dayTextColor: '#ffffff',
                            textDisabledColor: '#4b5563',
                            dotColor: COLORS.primary,
                            selectedDotColor: '#ffffff',
                            arrowColor: COLORS.primary,
                            monthTextColor: '#ffffff',
                            textDayFontWeight: '300',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '300',
                            textDayFontSize: 14,
                            textMonthFontSize: 16,
                            textDayHeaderFontSize: 14
                        }}
                    />
                </View>

                {/* Monthly Stats */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginBottom: SPACING.lg,
                    paddingHorizontal: SPACING.md
                }}>
                    <View style={styles.statItem}>
                        <View style={[styles.statDot, { backgroundColor: COLORS.accent.green }]} />
                        <Text style={styles.statLabel}>Đúng giờ</Text>
                        <Text style={styles.statValue}>{monthlyStats.present}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={[styles.statDot, { backgroundColor: COLORS.accent.yellow }]} />
                        <Text style={styles.statLabel}>Đi muộn</Text>
                        <Text style={styles.statValue}>{monthlyStats.late}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={[styles.statDot, { backgroundColor: COLORS.accent.red }]} />
                        <Text style={styles.statLabel}>Vắng</Text>
                        <Text style={styles.statValue}>{monthlyStats.absent}</Text>
                    </View>
                </View>

                {/* Selected Day Details */}
                <View style={{ paddingHorizontal: SPACING.md }}>
                    <Text style={{
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: '600',
                        marginBottom: SPACING.md
                    }}>
                        Chi tiết ngày {selectedDate}
                    </Text>

                    {dayDetails ? (
                        <View style={{
                            backgroundColor: 'rgba(30, 41, 59, 0.6)',
                            borderRadius: BORDER_RADIUS.lg,
                            padding: SPACING.lg,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.05)',
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
                                <Text style={{ color: COLORS.text.secondary }}>Trạng thái</Text>
                                <View style={{
                                    backgroundColor: `${getStatusColor(dayDetails.status)}20`,
                                    paddingHorizontal: SPACING.sm,
                                    borderRadius: BORDER_RADIUS.sm,
                                    borderWidth: 1,
                                    borderColor: getStatusColor(dayDetails.status)
                                }}>
                                    <Text style={{
                                        color: getStatusColor(dayDetails.status),
                                        fontWeight: 'bold',
                                        fontSize: 12
                                    }}>
                                        {getStatusText(dayDetails.status)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <View style={styles.detailItem}>
                                    <Icon name="login" size={20} color={COLORS.accent.green} />
                                    <View style={{ marginLeft: SPACING.sm }}>
                                        <Text style={styles.detailLabel}>Giờ vào</Text>
                                        <Text style={styles.detailValue}>{dayDetails.checkIn}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailItem}>
                                    <Icon name="logout" size={20} color={COLORS.accent.red} />
                                    <View style={{ marginLeft: SPACING.sm }}>
                                        <Text style={styles.detailLabel}>Giờ ra</Text>
                                        <Text style={styles.detailValue}>{dayDetails.checkOut}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: SPACING.md,
                                paddingTop: SPACING.md,
                                borderTopWidth: 1,
                                borderTopColor: 'rgba(255,255,255,0.1)'
                            }}>
                                <Icon name="schedule" size={20} color={COLORS.accent.cyan} />
                                <Text style={{ color: COLORS.text.secondary, marginLeft: SPACING.sm }}>Tổng thời gian:</Text>
                                <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 'auto' }}>
                                    {dayDetails.total}
                                </Text>
                            </View>

                        </View>
                    ) : (
                        <View style={{
                            padding: SPACING.xl,
                            alignItems: 'center',
                            backgroundColor: 'rgba(30, 41, 59, 0.3)',
                            borderRadius: BORDER_RADIUS.lg
                        }}>
                            <Text style={{ color: COLORS.text.secondary }}>Không có dữ liệu chấm công ngày này</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    statItem: {
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        width: '30%'
    },
    statDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: SPACING.xs
    },
    statLabel: {
        color: COLORS.text.secondary,
        fontSize: 12,
        marginBottom: SPACING.xs
    },
    statValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    detailLabel: {
        color: COLORS.text.secondary,
        fontSize: 12
    },
    detailValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
});
