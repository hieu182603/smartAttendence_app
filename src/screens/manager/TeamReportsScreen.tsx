import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ManagerDrawerParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { useManagerReports } from '../../hooks/useManagerQueries';

type TeamReportsScreenNavigationProp = DrawerNavigationProp<ManagerDrawerParamList, 'TeamReports'>;

interface TeamReportsScreenProps {
    navigation: TeamReportsScreenNavigationProp;
}

const screenWidth = Dimensions.get('window').width;

export default function TeamReportsScreen({ navigation }: TeamReportsScreenProps) {
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

    // TanStack Query hook
    const { data: stats, isLoading: loading } = useManagerReports(period);

    const chartData = stats ? [
        {
            name: 'Đúng giờ',
            population: stats.attendance.present,
            color: COLORS.accent.green,
            legendFontColor: '#fff',
            legendFontSize: 12,
        },
        {
            name: 'Đi muộn',
            population: stats.attendance.late,
            color: COLORS.accent.yellow,
            legendFontColor: '#fff',
            legendFontSize: 12,
        },
        {
            name: 'Vắng',
            population: stats.attendance.absent,
            color: COLORS.accent.red,
            legendFontColor: '#fff',
            legendFontSize: 12,
        },
        {
            name: 'Nghỉ phép',
            population: stats.attendance.leave,
            color: COLORS.accent.cyan,
            legendFontColor: '#fff',
            legendFontSize: 12,
        },
    ] : [];

    const chartConfig = {
        backgroundGradientFrom: "#1E2923",
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: "#08130D",
        backgroundGradientToOpacity: 0.5,
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false
    };

    const FilterButton = ({ title, value }: { title: string, value: 'day' | 'week' | 'month' }) => (
        <TouchableOpacity
            onPress={() => setPeriod(value)}
            style={[
                styles.filterButton,
                period === value && styles.filterButtonActive
            ]}
        >
            <Text style={[
                styles.filterText,
                period === value && styles.filterTextActive
            ]}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={globalStyles.container}>
            {/* Header */}
            <LinearGradient
                colors={[COLORS.primaryDark, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: SPACING.xs }}>
                    <Icon name="menu" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo công</Text>
                <View style={{ width: 24 }} />
            </LinearGradient>

            <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
                {/* Filter */}
                <View style={styles.filterContainer}>
                    <FilterButton title="Hôm nay" value="day" />
                    <FilterButton title="Tuần này" value="week" />
                    <FilterButton title="Tháng này" value="month" />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
                ) : stats ? (
                    <>
                        {/* Chart Section */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Tỷ lệ chuyên cần</Text>
                            <PieChart
                                data={chartData}
                                width={screenWidth - SPACING.lg * 4}
                                height={220}
                                chartConfig={chartConfig}
                                accessor={"population"}
                                backgroundColor={"transparent"}
                                paddingLeft={"15"}
                                center={[0, 0]}
                                absolute
                            />
                        </View>

                        {/* Summary Cards */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
                            <View style={[styles.statCard, { borderLeftColor: COLORS.accent.yellow }]}>
                                <Text style={styles.statLabel}>Đi muộn</Text>
                                <Text style={styles.statValue}>{stats.attendance.late}</Text>
                            </View>
                            <View style={[styles.statCard, { borderLeftColor: COLORS.accent.red }]}>
                                <Text style={styles.statLabel}>Vắng mặt</Text>
                                <Text style={styles.statValue}>{stats.attendance.absent}</Text>
                            </View>
                        </View>

                        {/* Issues List */}
                        <View style={styles.card}>
                            <Text style={[styles.cardTitle, { marginBottom: SPACING.md }]}>Danh sách cần lưu ý</Text>
                            {stats.issues.map((issue: any) => (
                                <View key={issue.id} style={styles.issueItem}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={[
                                            styles.avatarPlaceholder,
                                            { backgroundColor: issue.type === 'late' ? `${COLORS.accent.yellow}20` : `${COLORS.accent.red}20` }
                                        ]}>
                                            <Text style={{
                                                color: issue.type === 'late' ? COLORS.accent.yellow : COLORS.accent.red,
                                                fontWeight: 'bold'
                                            }}>
                                                {issue.name.charAt(0)}
                                            </Text>
                                        </View>
                                        <View style={{ marginLeft: SPACING.md }}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{issue.name}</Text>
                                            <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>{issue.date}</Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <View style={[
                                            styles.badge,
                                            { backgroundColor: issue.type === 'late' ? `${COLORS.accent.yellow}20` : `${COLORS.accent.red}20` }
                                        ]}>
                                            <Text style={{
                                                color: issue.type === 'late' ? COLORS.accent.yellow : COLORS.accent.red,
                                                fontSize: 12,
                                                fontWeight: 'bold'
                                            }}>
                                                {issue.type === 'late' ? 'Đi muộn' : 'Vắng'}
                                            </Text>
                                        </View>
                                        <Text style={{ color: '#fff', marginTop: 4 }}>
                                            {issue.time}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: SPACING.xxl * 1.5,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface.dark,
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
    },
    filterButton: {
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.text.secondary,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#fff',
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        ...SHADOWS.md,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    statCard: {
        flex: 0.48,
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderLeftWidth: 4,
    },
    statLabel: {
        color: COLORS.text.secondary,
        fontSize: 12,
        marginBottom: SPACING.xs,
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    issueItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
    },
});
