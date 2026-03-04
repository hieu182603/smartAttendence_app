import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ManagerDrawerParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { EmptyState } from '../../components/EmptyState';
import { useTeamMembers } from '../../hooks/useManagerQueries';
import { TeamMember } from '../../types';

type ManagerTeamScreenNavigationProp = DrawerNavigationProp<ManagerDrawerParamList, 'ManagerTeam'>;

interface ManagerTeamScreenProps {
  navigation: ManagerTeamScreenNavigationProp;
}

type FilterType = 'all' | 'online' | 'on-leave' | 'offline';

export default function ManagerTeamScreen({ navigation }: ManagerTeamScreenProps) {
  const { data: teamData, isLoading } = useTeamMembers();
  const members: TeamMember[] = (teamData as TeamMember[]) ?? [];
  const onlineCount = members.filter((m: TeamMember) => m.status === 'online').length;
  const onLeaveCount = members.filter((m: TeamMember) => m.status === 'on-leave').length;
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter members based on search and filter
  const filteredMembers = useMemo(() => {
    let result = members;

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(member => member.status === filter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        member =>
          member.name.toLowerCase().includes(query) ||
          member.department.toLowerCase().includes(query)
      );
    }

    return result;
  }, [members, filter, searchQuery]);

  const offlineCount = members.filter(m => m.status === 'offline').length;

  const getStatusBadgeStyle = (status: TeamMember['status']) => {
    switch (status) {
      case 'online':
        return {
          backgroundColor: 'rgba(11, 218, 104, 0.1)',
          borderColor: 'rgba(11, 218, 104, 0.2)',
          color: COLORS.status.success,
        };
      case 'on-leave':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.2)',
          color: COLORS.status.warning,
        };
      default:
        return {
          backgroundColor: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          color: COLORS.text.secondary,
        };
    }
  };

  const getStatusText = (status: TeamMember['status']) => {
    switch (status) {
      case 'online':
        return 'Trực tuyến';
      case 'on-leave':
        return 'Nghỉ phép';
      default:
        return 'Offline';
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
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={styles.menuButton}
              activeOpacity={0.7}
            >
              <Icon name="menu" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications' as any)}
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <Icon name="notifications" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Quản lý team</Text>
            <Text style={styles.headerSubtitle}>
              Danh sách nhân viên trong team
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color={COLORS.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm theo tên hoặc phòng ban..."
              placeholderTextColor={COLORS.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Icon name="close" size={18} color={COLORS.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(11, 218, 104, 0.1)' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(11, 218, 104, 0.2)' }]}>
              <Icon name="people" size={20} color={COLORS.status.success} />
            </View>
            <Text style={styles.statValue}>{onlineCount}</Text>
            <Text style={styles.statLabel}>Trực tuyến</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Icon name="event" size={20} color={COLORS.status.warning} />
            </View>
            <Text style={styles.statValue}>{onLeaveCount}</Text>
            <Text style={styles.statLabel}>Nghỉ phép</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(148, 163, 184, 0.1)' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(148, 163, 184, 0.2)' }]}>
              <Icon name="person_off" size={20} color={COLORS.text.secondary} />
            </View>
            <Text style={styles.statValue}>{offlineCount}</Text>
            <Text style={styles.statLabel}>Offline</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {(['all', 'online', 'on-leave', 'offline'] as FilterType[]).map(filterType => (
            <TouchableOpacity
              key={filterType}
              onPress={() => setFilter(filterType)}
              style={[
                styles.filterButton,
                filter === filterType && styles.filterButtonActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterType && styles.filterButtonTextActive,
                ]}
              >
                {filterType === 'all'
                  ? 'Tất cả'
                  : filterType === 'online'
                    ? 'Trực tuyến'
                    : filterType === 'on-leave'
                      ? 'Nghỉ phép'
                      : 'Offline'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Team Members List */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>
            {filteredMembers.length} thành viên
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : filteredMembers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon="people"
                title={
                  searchQuery
                    ? 'Không tìm thấy thành viên'
                    : filter !== 'all'
                      ? `Không có thành viên ${getStatusText(filter as TeamMember['status']).toLowerCase()}`
                      : 'Chưa có thành viên'
                }
                description={
                  searchQuery
                    ? 'Thử tìm kiếm với từ khóa khác'
                    : 'Danh sách đội nhóm trống'
                }
              />
            </View>
          ) : (
            <View style={styles.membersList}>
              {filteredMembers.map(member => {
                const statusStyle = getStatusBadgeStyle(member.status);
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.memberCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      // TODO: Navigate to member details
                    }}
                  >
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
                        {/* Status Indicator */}
                        <View
                          style={[
                            styles.statusIndicator,
                            {
                              backgroundColor:
                                member.status === 'online'
                                  ? COLORS.status.success
                                  : member.status === 'on-leave'
                                    ? COLORS.status.warning
                                    : COLORS.text.secondary,
                            },
                          ]}
                        />
                      </View>

                      {/* Info */}
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberDepartment}>{member.department}</Text>
                      </View>

                      {/* Status Badge */}
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: statusStyle.backgroundColor,
                            borderColor: statusStyle.borderColor,
                          },
                        ]}
                      >
                        <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>
                          {getStatusText(member.status)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.dark,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.text.primary,
    fontSize: 14,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface.dark,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
  },
  filterButtonText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#f97316',
    fontWeight: '600',
  },
  membersSection: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
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
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.surface.dark,
  },
  memberInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  memberDepartment: {
    fontSize: 13,
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
});
