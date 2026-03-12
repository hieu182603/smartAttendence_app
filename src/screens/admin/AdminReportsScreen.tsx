import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS, useTheme } from '../../utils/styles';
import { Icon } from '../../components/Icon';

const { width } = Dimensions.get('window');

export default function AdminReportsScreen() {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');

  const stats = [
    { label: 'Tỉ lệ đi làm', value: '94.2%', icon: 'trending_up', color: '#0bda68' },
    { label: 'Giờ làm tb', value: '7.8h', icon: 'schedule', color: '#4245f0' },
    { label: 'Số người muộn', value: '12', icon: 'timelapse', color: '#ef4444' },
  ];

  const chartData = [
    { day: 'T2', value: 85 },
    { day: 'T3', value: 92 },
    { day: 'T4', value: 88 },
    { day: 'T5', value: 95 },
    { day: 'T6', value: 82 },
    { day: 'T7', value: 45 },
    { day: 'CN', value: 40 },
  ];

  const reportTypes = [
    { id: 1, title: 'Báo cáo điểm danh', subtitle: 'Chi tiết check-in/out hằng ngày', icon: 'assignment' },
    { id: 2, title: 'Tổng hợp bảng lương', subtitle: 'Thống kê giờ làm và tăng ca', icon: 'credit_card' },
    { id: 3, title: 'Năng suất phòng ban', subtitle: 'Hiệu quả theo từng phòng ban', icon: 'business' },
    { id: 4, title: 'Kiểm tra bảo mật', subtitle: 'Nhật ký truy cập và thay đổi', icon: 'security' },
  ];

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
      {/* Header Section */}
      <LinearGradient
        colors={['#4f46e5', '#9333ea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Báo cáo & Phân tích</Text>
            <Text style={styles.headerSubtitle}>Dữ liệu hệ thống thời gian thực</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn}>
            <Icon name="more_vert" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelectorWrapper}>
          <View style={[styles.periodSelector, { backgroundColor: theme.surfaceDarker }]}>
            {['Daily', 'Weekly', 'Monthly'].map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={[
                  styles.periodBtn,
                  selectedPeriod === period && styles.periodBtnActive
                ]}
              >
                <Text style={[
                  styles.periodText,
                  { color: theme.text.muted },
                  selectedPeriod === period && styles.periodTextActive
                ]}>
                  {period === 'Daily' ? 'Ngày' : period === 'Weekly' ? 'Tuần' : 'Tháng'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: theme.surface, borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }]}>
              <View style={[styles.statIconBox, { backgroundColor: `${stat.color}15` }]}>
                <Icon name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.text.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Attendance Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Xu hướng điểm danh</Text>
            <Icon name="trending_up" size={18} color="#0bda68" />
          </View>

          <View style={styles.chartArea}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={[styles.barBg, { backgroundColor: theme.surfaceDarker }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${item.value}%`,
                        backgroundColor: item.value > 80 ? COLORS.primary : COLORS.accent.purple
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0)']}
                      style={[StyleSheet.absoluteFill, { borderRadius: 4 }]}
                    />
                  </View>
                </View>
                <Text style={[styles.barLabel, { color: theme.text.muted }]}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Report List */}
        <View style={styles.reportListSection}>
          <Text style={[styles.sectionHeading, { color: theme.text.primary }]}>Danh sách báo cáo</Text>
          {reportTypes.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={[styles.reportCard, { backgroundColor: theme.surface, borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }]}
            >
              <View style={[styles.reportIconBox, { backgroundColor: 'rgba(66, 69, 240, 0.1)' }]}>
                <Icon name={report.icon} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.reportMetaData}>
                <Text style={[styles.reportTitleText, { color: theme.text.primary }]}>{report.title}</Text>
                <Text style={[styles.reportSubtitleText, { color: theme.text.muted }]}>{report.subtitle}</Text>
              </View>
              <Icon name="chevron_right" size={20} color={theme.text.muted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: SPACING.xxl * 2,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelectorWrapper: {
    marginBottom: SPACING.sm,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    padding: 6,
    height: 48,
  },
  periodBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  periodBtnActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '700',
  },
  periodTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  chartCard: {
    padding: 20,
    borderRadius: BORDER_RADIUS.xxl,
    marginBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartArea: {
    flexDirection: 'row',
    height: 160,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barBg: {
    width: 10,
    height: 120,
    borderRadius: 5,
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  barFill: {
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportListSection: {
    marginTop: SPACING.xs,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: SPACING.lg,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: 12,
    ...SHADOWS.md,
  },
  reportIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportMetaData: {
    flex: 1,
  },
  reportTitleText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  reportSubtitleText: {
    fontSize: 13,
  }
});
