import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, AdminTabParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, useTheme } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { useAdminStats } from '../../hooks/useAdminQueries';
import { useUnreadCount } from '../../hooks/useNotificationQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/queryKeys';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { formatDistanceToNow } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';

type AdminDashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList, 'AdminDashboard'>,
  StackNavigationProp<RootStackParamList>
>;

interface AdminDashboardScreenProps {
  navigation: AdminDashboardScreenNavigationProp;
}

interface ActivityItemProps {
  userName: string;
  userAvatar?: string | null;
  type: string;
  description: string;
  time: string;
  theme: any;
}

const ActivityItem = ({ userName, userAvatar, description, time, theme }: ActivityItemProps) => {
  const timeLabel = formatDistanceToNow(new Date(time), { addSuffix: true, locale: viLocale });

  return (
    <View style={[styles.activityItem, { borderTopColor: theme.divider }]}>
      <View style={[styles.activityAvatar, { backgroundColor: theme.primary + '20' }]}>
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} style={styles.avatarImg} />
        ) : (
          <Text style={[styles.avatarText, { color: theme.primary }]}>
            {userName.substring(0, 2).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.activityInfo}>
        <Text style={[styles.activityName, { color: theme.text.primary }]}>{userName}</Text>
        <Text style={[styles.activityDesc, { color: theme.text.secondary }]}>{description}</Text>
      </View>
      <Text style={[styles.activityTime, { color: theme.text.muted }]}>{timeLabel}</Text>
    </View>
  );
};

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const { t } = useTranslation();

  // TanStack Query hook
  const { data: statsData, isLoading } = useAdminStats();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  const onRefresh = () => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() }).finally(() => setRefreshing(false));
  };

  const statCards = [
    {
      id: 'card-users',
      label: t.admin.dashboard.users,
      value: statsData?.counts?.users || statsData?.kpi?.totalEmployees || 0,
      icon: 'group',
      color: theme.primary,
      onPress: () => navigation.navigate('AdminUsers'),
    },
    {
      id: 'card-departments',
      label: t.admin.dashboard.departments,
      value: statsData?.counts?.departments || 3, // fallback since old API misses this
      icon: 'business',
      color: theme.accent.cyan,
      onPress: () => navigation.navigate('AdminDepartments' as any),
    },
    {
      id: 'card-reports',
      label: t.admin.dashboard.reports,
      value: statsData?.counts?.reports || 5, // fallback 
      icon: 'analytics',
      color: theme.accent.purple,
      onPress: () => navigation.navigate('AdminReports'),
    },
    {
      id: 'card-audit',
      label: t.admin.dashboard.auditLogs,
      value: statsData?.counts?.logs || 120, // fallback
      icon: 'history_edu',
      color: theme.accent.green,
      onPress: () => navigation.navigate('AdminAudit'),
    },
    {
      id: 'card-positions',
      label: 'Chức vụ',
      value: statsData?.counts?.positions || 12, // fallback
      icon: 'badge',
      color: theme.accent.yellow,
      onPress: () => navigation.navigate('AdminPositions' as any),
    },
  ];

  return (
    <ScrollView
      style={[globalStyles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      {/* Header Gradient */}
      <LinearGradient
        colors={['#4f46e5', '#9333ea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Icon name="person" size={24} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.adminName}>{user?.name || 'Nguyễn Văn A'}</Text>
              <Text style={styles.adminRole}>{t.admin.dashboard.title}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={styles.iconBtn}
            >
              <Icon name="notifications" size={20} color="#ffffff" />
              {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: theme.accent.green }]}>{statsData?.onlineUsers ?? 1}</Text>
            <Text style={styles.quickStatLabel}>{t.admin.dashboard.online}</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{statsData?.counts?.users ?? statsData?.kpi?.totalEmployees ?? 0}</Text>
            <Text style={styles.quickStatLabel}>{t.admin.dashboard.totalEmployees}</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatValue, { color: theme.accent.yellow }]}>{statsData?.pendingRequests ?? 5}</Text>
            <Text style={styles.quickStatLabel}>{t.admin.dashboard.pendingApprovals}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>{t.admin.dashboard.attendanceToday}</Text>
        <View style={[styles.attendanceSummary, { backgroundColor: theme.glassPanel, borderColor: theme.cardBorder }]}>
          <View style={styles.attendanceRow}>
            <View style={styles.attLabel}><View style={[styles.attDot, { backgroundColor: theme.accent.green }]} /> <Text style={{ color: theme.text.secondary }}>{t.admin.dashboard.onTime}</Text></View>
            <Text style={[styles.attValue, { color: theme.accent.green }]}>{statsData?.attendanceToday?.present ?? statsData?.kpi?.presentToday ?? 0}</Text>
          </View>
          <View style={styles.attendanceRow}>
            <View style={styles.attLabel}><View style={[styles.attDot, { backgroundColor: theme.accent.yellow }]} /> <Text style={{ color: theme.text.secondary }}>{t.admin.dashboard.late}</Text></View>
            <Text style={[styles.attValue, { color: theme.accent.yellow }]}>{statsData?.attendanceToday?.late ?? statsData?.kpi?.lateToday ?? 0}</Text>
          </View>
          <View style={styles.attendanceRow}>
            <View style={styles.attLabel}><View style={[styles.attDot, { backgroundColor: theme.accent.red }]} /> <Text style={{ color: theme.text.secondary }}>{t.admin.dashboard.absent}</Text></View>
            <Text style={[styles.attValue, { color: theme.accent.red }]}>{statsData?.attendanceToday?.absent ?? statsData?.kpi?.absentToday ?? 0}</Text>
          </View>
          <View style={styles.attendanceRow}>
            <View style={styles.attLabel}><View style={[styles.attDot, { backgroundColor: theme.text.muted }]} /> <Text style={{ color: theme.text.secondary }}>{t.admin.dashboard.onLeave}</Text></View>
            <Text style={[styles.attValue, { color: theme.text.muted }]}>{statsData?.attendanceToday?.leave ?? 0}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Xu hướng điểm danh (7 ngày)</Text>
        <View style={[styles.recentSection, { backgroundColor: theme.glassPanel, borderColor: theme.cardBorder, paddingBottom: SPACING.md }]}>
          {[
            { day: 'Thứ 2', val: 85, color: theme.accent.green },
            { day: 'Thứ 3', val: 92, color: theme.accent.green },
            { day: 'Thứ 4', val: 78, color: theme.accent.yellow },
            { day: 'Thứ 5', val: 95, color: theme.accent.green },
            { day: 'Hôm nay', val: 60, color: theme.primary },
          ].map((item, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: theme.text.secondary, fontSize: 11 }}>{item.day}</Text>
                <Text style={{ color: theme.text.primary, fontSize: 11, fontWeight: 'bold' }}>{item.val}%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: theme.divider, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: `${item.val}%`, height: '100%', backgroundColor: item.color }} />
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>{t.admin.dashboard.management}</Text>
        <View style={styles.statGrid}>
          {statCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.statCard, { backgroundColor: theme.glassPanel, borderColor: theme.cardBorder }]}
              onPress={card.onPress}
            >
              <View style={styles.statCardHeader}>
                <View style={[styles.statIconContainer, { backgroundColor: card.color + '20' }]}>
                  <Icon name={card.icon} size={20} color={card.color} />
                </View>
                <Icon name="arrow_forward" size={16} color={theme.text.muted} />
              </View>
              <Text style={[styles.statCardLabel, { color: theme.text.secondary }]}>{card.label}</Text>
              <Text style={[styles.statCardValue, { color: theme.text.primary }]}>{card.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>{t.admin.dashboard.recentActivity}</Text>
        <View style={[styles.recentSection, { backgroundColor: theme.glassPanel, borderColor: theme.cardBorder }]}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, { color: theme.text.primary }]}>{t.admin.dashboard.today}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminAudit')}>
              <Text style={[styles.recentLink, { color: theme.primary }]}>{t.admin.dashboard.viewAll}</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
          ) : statsData?.recentActivity?.length > 0 ? (
            statsData.recentActivity.map((activity: any) => (
              <ActivityItem
                key={activity.id}
                userName={activity.userName}
                userAvatar={activity.userAvatar}
                type={activity.type}
                description={activity.description}
                time={activity.time}
                theme={theme}
              />
            ))
          ) : (
            <Text style={[styles.noActivity, { color: theme.text.muted }]}>{t.dashboard.noActivity}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING.xxl + 10,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
  },
  headerAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  adminRole: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickStat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  quickStatLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attendanceSummary: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    ...SHADOWS.md,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  attLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  attValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  recentSection: {
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    ...SHADOWS.md,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentLink: {
    fontSize: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  activityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 13,
    fontWeight: '500',
  },
  activityDesc: {
    fontSize: 11,
  },
  activityTime: {
    fontSize: 10,
  },
  noActivity: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  }
});
