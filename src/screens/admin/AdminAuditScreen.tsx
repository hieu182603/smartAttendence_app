import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS, useTheme } from '../../utils/styles';
import { Icon } from '../../components/Icon';

export default function AdminAuditScreen() {
  const theme = useTheme();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filters = ['All', 'Security', 'User', 'Attendance', 'System'];

  const auditLogs = [
    {
      id: 1,
      action: 'Đăng nhập hệ thống',
      user: 'Admin (hieu182603)',
      time: '10:45 AM, Hôm nay',
      type: 'Security',
      status: 'success',
      icon: 'login',
      details: 'Đăng nhập thành công từ địa chỉ IP 192.168.1.1 (Chrome trên Windows 11)',
    },
    {
      id: 2,
      action: 'Tạo phòng ban mới',
      user: 'Manager (Lan Anh)',
      time: '09:30 AM, Hôm nay',
      type: 'User',
      status: 'success',
      icon: 'business',
      details: 'Đã thêm phòng ban "Marketing & Sales" vào hệ thống',
    },
    {
      id: 3,
      action: 'Truy cập bị từ chối',
      user: 'Unknown User',
      time: '08:15 AM, Hôm qua',
      type: 'Security',
      status: 'error',
      icon: 'gpp_bad',
      details: 'Phát hiện truy cập trái phép vào trang Cài đặt Hệ thống',
    },
    {
      id: 4,
      action: 'Cập nhật Ca làm việc',
      user: 'Admin (hieu182603)',
      time: '04:00 PM, Hôm qua',
      type: 'Attendance',
      status: 'info',
      icon: 'restore',
      details: 'Đã thay đổi giờ bắt đầu ca sáng cho nhân viên Nguyễn Văn A',
    },
    {
      id: 5,
      action: 'Bảo trì hệ thống',
      user: 'System',
      time: '02:00 AM, 12/03',
      type: 'System',
      status: 'info',
      icon: 'settings',
      details: 'Tự động dọn dẹp bộ nhớ đệm và tối ưu hóa cơ sở dữ liệu định kỳ',
    },
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesFilter = activeFilter === 'All' || log.type === activeFilter;
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSelectFilter = (filter: string) => {
    setActiveFilter(filter);
    setShowFilterModal(false);
  };

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
            <Text style={styles.headerTitle}>Nhật ký hệ thống</Text>
            <Text style={styles.headerSubtitle}>Lịch sử hoạt động và thay đổi</Text>
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: activeFilter !== 'All' ? '#ffffff20' : 'rgba(255, 255, 255, 0.1)' }]}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon name="tune" size={20} color="#fff" />
            <Text style={styles.filterBtnText}>
              {activeFilter === 'All' ? 'Lọc' : activeFilter}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBarWrapper}>
          <View style={[styles.searchContainer, { backgroundColor: theme.surfaceDarker }]}>
            <Icon name="search" size={20} color={theme.text.muted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text.primary }]}
              placeholder="Tìm hành động, chi tiết..."
              placeholderTextColor={theme.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={18} color={theme.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Audit List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.text.secondary }]}>
            {activeFilter === 'All' ? 'Tất cả nhật ký' : `Nhật ký: ${activeFilter}`}
          </Text>
          <Text style={[styles.logCount, { color: theme.text.muted }]}>{filteredLogs.length} kết quả</Text>
        </View>

        {filteredLogs.map((log) => (
          <View key={log.id} style={[styles.logCard, { backgroundColor: theme.surface, borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }]}>
            <View style={styles.logMain}>
              <View style={[
                styles.iconWrap,
                {
                  backgroundColor: log.status === 'success' ? 'rgba(11, 218, 104, 0.1)' :
                    log.status === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                      'rgba(66, 69, 240, 0.1)'
                }
              ]}>
                <Icon
                  name={log.icon as any}
                  size={20}
                  color={log.status === 'success' ? '#0bda68' :
                    log.status === 'error' ? '#ef4444' :
                      '#4245f0'}
                />
              </View>

              <View style={styles.logInfo}>
                <View style={styles.logTopRow}>
                  <Text style={[styles.logActionText, { color: theme.text.primary }]}>{log.action}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: theme.surfaceDarker }]}>
                    <Text style={[styles.typeBadgeText, { color: theme.text.secondary }]}>{log.type}</Text>
                  </View>
                </View>
                <Text style={[styles.logTimeText, { color: theme.text.muted }]}>{log.time}</Text>
              </View>
            </View>

            <View style={styles.logDivider} />

            <View style={styles.logBottom}>
              <View style={styles.userRow}>
                <Icon name="person" size={14} color={theme.text.secondary} />
                <Text style={[styles.userLabel, { color: theme.text.secondary }]}>{log.user}</Text>
              </View>
              <Text style={[styles.logDetailText, { color: theme.text.primary }]}>{log.details}</Text>
            </View>
          </View>
        ))}

        {filteredLogs.length === 0 && (
          <View style={styles.emptyWrap}>
            <Icon name="history_toggle_off" size={60} color={theme.text.muted} />
            <Text style={[styles.emptyLabel, { color: theme.text.muted }]}>Không tìm thấy kết quả nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Selection Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Lọc theo danh mục</Text>
            </View>

            <View style={styles.modalOptions}>
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.modalOption,
                      isActive && { backgroundColor: `${COLORS.primary}10` }
                    ]}
                    onPress={() => handleSelectFilter(filter)}
                  >
                    <View style={styles.optionInfo}>
                      <View style={[styles.optionDot, { backgroundColor: isActive ? COLORS.primary : theme.text.muted }]} />
                      <Text style={[
                        styles.optionText,
                        { color: isActive ? COLORS.primary : theme.text.primary, fontWeight: isActive ? '700' : '500' }
                      ]}>
                        {filter === 'All' ? 'Tất cả nhật ký' : filter}
                      </Text>
                    </View>
                    {isActive && <Icon name="check" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.surfaceDarker }]}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={[styles.closeBtnText, { color: theme.text.primary }]}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
    marginBottom: SPACING.lg,
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
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  filterBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  searchBarWrapper: {
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 100,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  logCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  logMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  logInfo: {
    flex: 1,
  },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logActionText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logTimeText: {
    fontSize: 12,
  },
  logDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: SPACING.md,
  },
  logBottom: {
    gap: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  logDetailText: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.9,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.4,
  },
  emptyLabel: {
    marginTop: SPACING.md,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: SPACING.xl,
    minHeight: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalOptions: {
    gap: 8,
    marginBottom: SPACING.xl,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    fontSize: 16,
  },
  closeBtn: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  }
});
