import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { AttendanceService } from '../../services/attendance.service';

type AttendanceHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AttendanceHistory'>;

interface AttendanceHistoryScreenProps {
    navigation: AttendanceHistoryScreenNavigationProp;
}

// Mock data for initial development if API fails
const MOCK_ATTENDANCE: Record<string, any> = {
    '2024-01-15': { status: 'present', checkIn: '08:25', checkOut: '17:35', total: '9h 10m' },
    '2024-01-16': { status: 'late', checkIn: '09:15', checkOut: '17:30', total: '8h 15m' },
    '2024-01-17': { status: 'absent', checkIn: '--:--', checkOut: '--:--', total: '0h 00m' },
    '2024-01-18': { status: 'present', checkIn: '08:30', checkOut: '17:30', total: '9h 00m' },
};

export default function AttendanceHistoryScreen({ navigation }: AttendanceHistoryScreenProps) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [monthlyStats, setMonthlyStats] = useState({
        present: 0,
        late: 0,
        absent: 0,
        totalHours: '0h',
    });
    const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7)); // YYYY-MM
    const [dayDetails, setDayDetails] = useState<any>(null);

    useEffect(() => {
        fetchAttendanceData(currentMonth);
    }, [currentMonth]);

    useEffect(() => {
        // Update details when selected date changes
        if (markedDates[selectedDate]?.details) {
            setDayDetails(markedDates[selectedDate].details);
        } else {
            setDayDetails(null);
        }
    }, [selectedDate, markedDates]);

    const fetchAttendanceData = async (month: string) => {
        try {
            setIsLoading(true);
            // Construct date range for the month
            const [year, monthNum] = month.split('-');
            const from = `${year}-${monthNum}-01`;
            const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
            const to = `${year}-${monthNum}-${lastDay}`;

            // Call API
            const response = await AttendanceService.getHistory({ from, to, limit: 100 });
            const data = response.records || [];

            // Transform data for Calendar
            const newMarkedDates: any = {};
            let stats = { present: 0, late: 0, absent: 0, totalHours: 0 };

            data.forEach((item: any) => {
                const date = item.date; // Assuming API returns YYYY-MM-DD
                let color = COLORS.accent.green;

                // Map API status to UI colors
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
                        total: item.hours || '0h'
                    }
                };

                if (item.status === 'present') stats.present++;
                if (item.status === 'late') stats.late++;
                if (item.status === 'absent' || item.status === 'on_leave') stats.absent++;
            });

            // Ensure marked dates include current selection
            if (!newMarkedDates[selectedDate]) {
                newMarkedDates[selectedDate] = { selected: true };
            }

            setMarkedDates(newMarkedDates);
            setMonthlyStats({
                ...stats,
                totalHours: '0h' // You might want to calculate this if API doesn't provide total for month
            });

        } catch (error) {
            console.error('Error fetching attendance history:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

            <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
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
                            // Update selection styling
                            const updatedMarked = { ...markedDates };
                            // Unselect old
                            Object.keys(updatedMarked).forEach(key => {
                                if (updatedMarked[key].selected) updatedMarked[key].selected = false;
                            });
                            // Select new
                            if (updatedMarked[day.dateString]) {
                                updatedMarked[day.dateString].selected = true;
                            } else {
                                updatedMarked[day.dateString] = { selected: true };
                            }
                            setMarkedDates(updatedMarked);
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
