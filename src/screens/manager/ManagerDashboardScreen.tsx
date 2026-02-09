import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ManagerDrawerParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { StatCard } from '../../components/StatCard';
import { NotificationPanel } from '../../components/NotificationPanel';
import { EmptyState } from '../../components/EmptyState';
import { useNotifications } from '../../hooks/useNotifications';
import { useApprovals } from '../../hooks/useApprovals';
import { useTeam } from '../../hooks/useTeam';
import { useAuth } from '../../context/AuthContext';
import { ApprovalRequest } from '../../types';

type ManagerDashboardScreenNavigationProp = DrawerNavigationProp<ManagerDrawerParamList, 'ManagerDashboard'>;

interface ManagerDashboardScreenProps {
  navigation: ManagerDashboardScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - SPACING.xl * 2 - SPACING.sm) / 2;

export default function ManagerDashboardScreen({ navigation }: ManagerDashboardScreenProps) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const {
    approvals,
    isLoading: approvalsLoading,
    pendingCount,
  } = useApprovals();

  const {
    members,
    isLoading: teamLoading,
    onlineCount,
    onLeaveCount,
  } = useTeam();

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [markAllAsRead]);

  const handleDeleteNotification = useCallback(async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [deleteNotification]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'annual': return 'Nghỉ phép';
      case 'sick': return 'Nghỉ ốm';
      case 'unpaid': return 'Nghỉ không lương';
      default: return 'Khác';
    }
  };

  const userName = user?.name || 'Manager';
  const userAvatar = user?.avatar;

  return (
    <View style={globalStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header - Orange/Gold Theme for Manager */}
        <LinearGradient
          colors={['#FF9800', '#F57C00', '#FFC107']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {userAvatar ? (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>IMG</Text>
                  </View>
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.statusDot} />
              </View>
              <View>
                <Text style={styles.userRole}>Quản lý,</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity
              onPress={toggleNotifications}
              style={styles.notificationButton}
            >
              <Icon name="notifications" size={20} color="#ffffff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Welcome Message */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              Bảng điều khiển quản lý 📊
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Tổng quan đội nhóm và công việc cần xử lý
            </Text>
          </View>
        </LinearGradient>

        {/* Notification Panel */}
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          isOpen={showNotifications}
          onClose={closeNotifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDeleteNotification}
        />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Manager Stats - Orange Theme */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="error"
              title="Chờ duyệt"
              value={approvalsLoading ? '...' : pendingCount}
              unit="đơn nghỉ phép"
              color="warning"
            />
            <StatCard
              icon="groups"
              title="Thành viên"
              value={teamLoading ? '...' : members.length}
              unit="nhân viên"
              color="warning"
            />
            <StatCard
              icon="person_check"
              title="Đang làm việc"
              value={teamLoading ? '...' : onlineCount}
              unit="người trực tuyến"
              color="success"
            />
            <StatCard
              icon="event"
              title="Đang nghỉ"
              value={teamLoading ? '...' : onLeaveCount}
              unit="nhân viên"
              color="primary"
            />
          </View>

          {/* Pending Approvals Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Icon name="check_circle" size={16} color="#FF9800" />
                <Text style={styles.sectionTitle}>Đơn chờ duyệt</Text>
              </View>
              {pendingCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{pendingCount} đơn</Text>
                </View>
              )}
            </View>

            <View style={styles.approvalsList}>
              {approvalsLoading ? (
                // Loading skeleton
                [1, 2].map(i => (
                  <View key={i} style={styles.approvalCard}>
                    <View style={styles.approvalSkeleton} />
                  </View>
                ))
              ) : approvals.length === 0 ? (
                <View style={styles.approvalCard}>
                  <EmptyState
                    emoji="✅"
                    title="Không có đơn chờ duyệt"
                    description="Tất cả đơn nghỉ phép đã được xử lý"
                  />
                </View>
              ) : (
                approvals.slice(0, 3).map((approval: ApprovalRequest) => (
                  <TouchableOpacity
                    key={approval.id}
                    style={styles.approvalCard}
                    onPress={() => navigation.navigate('ManagerApprovals')}
                  >
                    <View style={styles.approvalContent}>
                      <View style={styles.approvalAvatar}>
                        <Text style={styles.approvalAvatarText}>
                          {approval.employeeName.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.approvalInfo}>
                        <Text style={styles.approvalName}>{approval.employeeName}</Text>
                        <Text style={styles.approvalDate}>
                          {approval.startDate} → {approval.endDate} ({approval.days} ngày)
                        </Text>
                        <Text style={styles.approvalReason} numberOfLines={1}>
                          Lý do: {approval.reason}
                        </Text>
                        <View style={styles.approvalMeta}>
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>
                              {getLeaveTypeLabel(approval.type)}
                            </Text>
                          </View>
                          <Text style={styles.approvalTime}>
                            {new Date(approval.submittedAt).toLocaleDateString('vi-VN')}
                          </Text>
                        </View>
                      </View>
                      <Icon name="schedule" size={16} color={COLORS.text.secondary} />
                    </View>
                  </TouchableOpacity>
                ))
              )}

              {approvals.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('ManagerApprovals')}
                >
                  <Text style={styles.viewAllText}>
                    Xem tất cả {approvals.length} đơn →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Team Overview */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="groups" size={16} color="#FF9800" />
              <Text style={styles.sectionTitle}>Đội nhóm</Text>
            </View>

            <View style={styles.teamCard}>
              {teamLoading ? (
                <View style={styles.teamSkeleton}>
                  {[1, 2, 3].map(i => (
                    <View key={i} style={styles.memberSkeleton} />
                  ))}
                </View>
              ) : members.length === 0 ? (
                <EmptyState
                  icon="groups"
                  title="Chưa có thành viên"
                  description="Danh sách đội nhóm trống"
                />
              ) : (
                <View style={styles.membersList}>
                  {members.map(member => (
                    <View key={member.id} style={styles.memberItem}>
                      <View style={styles.memberAvatarContainer}>
                        <View style={styles.memberAvatar}>
                          <Text style={styles.memberAvatarText}>
                            {member.name.charAt(0)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.memberStatusDot,
                            {
                              backgroundColor:
                                member.status === 'online'
                                  ? COLORS.accent.green
                                  : member.status === 'on-leave'
                                    ? '#FF9800'
                                    : COLORS.text.secondary,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberDepartment}>{member.department}</Text>
                      </View>
                      <View
                        style={[
                          styles.memberStatusBadge,
                          {
                            backgroundColor:
                              member.status === 'online'
                                ? 'rgba(11, 218, 104, 0.1)'
                                : member.status === 'on-leave'
                                  ? 'rgba(255, 152, 0, 0.1)'
                                  : 'rgba(255, 255, 255, 0.05)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.memberStatusText,
                            {
                              color:
                                member.status === 'online'
                                  ? COLORS.accent.green
                                  : member.status === 'on-leave'
                                    ? '#FF9800'
                                    : COLORS.text.secondary,
                            },
                          ]}
                        >
                          {member.status === 'online'
                            ? 'Trực tuyến'
                            : member.status === 'on-leave'
                              ? 'Nghỉ phép'
                              : 'Offline'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions for Manager */}
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="trending_up" size={16} color="#FF9800" />
              <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            </View>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('ManagerApprovals')}
              >
                <LinearGradient
                  colors={['rgba(255, 152, 0, 0.2)', 'rgba(255, 193, 7, 0.1)']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="check_circle" size={20} color="#FF9800" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Duyệt đơn</Text>
                <Text style={styles.quickActionSubtitle}>Xử lý đơn nghỉ phép</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('ManagerSchedule')}
              >
                <LinearGradient
                  colors={['rgba(255, 193, 7, 0.2)', 'rgba(255, 152, 0, 0.1)']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="event" size={20} color="#FFC107" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Lịch team</Text>
                <Text style={styles.quickActionSubtitle}>Xem lịch làm việc</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <LinearGradient
                  colors={['rgba(11, 218, 104, 0.2)', 'rgba(11, 218, 104, 0.1)']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="trending_up" size={20} color={COLORS.accent.green} />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Báo cáo</Text>
                <Text style={styles.quickActionSubtitle}>Thống kê team</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('ManagerTeam')}
              >
                <LinearGradient
                  colors={['rgba(66, 69, 240, 0.2)', 'rgba(66, 69, 240, 0.1)']}
                  style={styles.quickActionIcon}
                >
                  <Icon name="groups" size={20} color={COLORS.primary} />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>Quản lý team</Text>
                <Text style={styles.quickActionSubtitle}>Danh sách nhân viên</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING.xxl * 2,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
    marginBottom: -SPACING.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.accent.green,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  userRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  userName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  badge: {
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
    borderColor: '#FF9800',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeSection: {
    marginTop: SPACING.md,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.2)',
  },
  countBadgeText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
  },
  approvalsList: {
    gap: SPACING.sm,
  },
  approvalCard: {
    backgroundColor: COLORS.surface.dark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.md,
  },
  approvalContent: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  approvalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approvalAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  approvalInfo: {
    flex: 1,
    minWidth: 0,
  },
  approvalName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  approvalDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  approvalReason: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  approvalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  typeBadge: {
    backgroundColor: COLORS.surface.light,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeBadgeText: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  approvalTime: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  approvalSkeleton: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
  },
  viewAllButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
  },
  teamCard: {
    backgroundColor: COLORS.surface.dark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.md,
  },
  membersList: {
    gap: SPACING.xs,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.xs,
  },
  memberAvatarContainer: {
    position: 'relative',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  memberStatusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.surface.dark,
  },
  memberInfo: {
    flex: 1,
    minWidth: 0,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  memberDepartment: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  memberStatusBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  memberStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  teamSkeleton: {
    gap: SPACING.xs,
  },
  memberSkeleton: {
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickActionCard: {
    width: cardWidth,
    backgroundColor: COLORS.surface.dark,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.md,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});
