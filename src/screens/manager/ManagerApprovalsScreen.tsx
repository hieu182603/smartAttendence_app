import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ManagerDrawerParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { EmptyState } from '../../components/EmptyState';
import { useApprovals } from '../../hooks/useApprovals';
import { ApprovalRequest } from '../../types';

type ManagerApprovalsScreenNavigationProp = DrawerNavigationProp<ManagerDrawerParamList, 'ManagerApprovals'>;

interface ManagerApprovalsScreenProps {
  navigation: ManagerApprovalsScreenNavigationProp;
}

export default function ManagerApprovalsScreen({ navigation }: ManagerApprovalsScreenProps) {
  const { approvals, isLoading, error, approve, reject, pendingCount } = useApprovals();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter approvals based on search
  const filteredApprovals = useMemo(() => {
    if (!searchQuery.trim()) return approvals;

    const query = searchQuery.toLowerCase();
    return approvals.filter(
      approval =>
        approval.employeeName.toLowerCase().includes(query) ||
        approval.reason.toLowerCase().includes(query) ||
        approval.type.toLowerCase().includes(query)
    );
  }, [approvals, searchQuery]);

  // Get stats
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  // Handle approve
  const handleApprove = useCallback(
    async (approval: ApprovalRequest) => {
      if (isProcessing) return;

      try {
        setIsProcessing(true);
        await approve(approval.id, 'Đã phê duyệt');
        Alert.alert('Thành công', 'Đã duyệt đơn nghỉ phép thành công');
      } catch (err) {
        console.error('Failed to approve:', err);
        Alert.alert('Lỗi', 'Không thể duyệt đơn. Vui lòng thử lại.');
      } finally {
        setIsProcessing(false);
      }
    },
    [approve, isProcessing]
  );

  // Handle reject
  const handleReject = useCallback(async () => {
    if (!selectedApproval || !rejectNote.trim() || isProcessing) return;

    try {
      setIsProcessing(true);
      await reject(selectedApproval.id, rejectNote);
      setShowRejectDialog(false);
      setSelectedApproval(null);
      setRejectNote('');
      Alert.alert('Thành công', 'Đã từ chối đơn nghỉ phép');
    } catch (err) {
      console.error('Failed to reject:', err);
      Alert.alert('Lỗi', 'Không thể từ chối đơn. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  }, [reject, selectedApproval, rejectNote, isProcessing]);

  // Open reject dialog
  const openRejectDialog = useCallback((approval: ApprovalRequest) => {
    setSelectedApproval(approval);
    setShowRejectDialog(true);
  }, []);

  // Close reject dialog
  const closeRejectDialog = useCallback(() => {
    if (!isProcessing) {
      setShowRejectDialog(false);
      setSelectedApproval(null);
      setRejectNote('');
    }
  }, [isProcessing]);

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'annual':
        return 'Nghỉ phép';
      case 'sick':
        return 'Nghỉ ốm';
      case 'unpaid':
        return 'Nghỉ không lương';
      default:
        return 'Khác';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            {pendingCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{pendingCount} đơn</Text>
              </View>
            )}
          </View>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Duyệt đơn nghỉ phép</Text>
            <Text style={styles.headerSubtitle}>Quản lý và xử lý đơn nghỉ phép</Text>
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
              placeholder="Tìm theo tên, lý do..."
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

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
              <Icon name="schedule" size={20} color="#f97316" />
            </View>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Chờ duyệt</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(11, 218, 104, 0.1)' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(11, 218, 104, 0.2)' }]}>
              <Icon name="check_circle" size={20} color={COLORS.status.success} />
            </View>
            <Text style={styles.statValue}>{approvedCount}</Text>
            <Text style={styles.statLabel}>Đã duyệt</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Icon name="error" size={20} color={COLORS.status.error} />
            </View>
            <Text style={styles.statValue}>{rejectedCount}</Text>
            <Text style={styles.statLabel}>Từ chối</Text>
          </View>
        </View>

        {/* Approvals List */}
        <View style={styles.approvalsSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <EmptyState icon="error" title="Lỗi tải dữ liệu" description={error} />
            </View>
          ) : filteredApprovals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                emoji="✅"
                title={searchQuery ? 'Không tìm thấy kết quả' : 'Không có đơn chờ duyệt'}
                description={
                  searchQuery
                    ? 'Thử tìm kiếm với từ khóa khác'
                    : 'Tất cả đơn nghỉ phép đã được xử lý'
                }
              />
            </View>
          ) : (
            <View style={styles.approvalsList}>
              {filteredApprovals.map(approval => (
                <View key={approval.id} style={styles.approvalCard}>
                  <View style={styles.approvalContent}>
                    {/* Avatar */}
                    <LinearGradient
                      colors={['rgba(249, 115, 22, 0.2)', 'rgba(245, 158, 11, 0.1)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>
                        {approval.employeeName.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>

                    {/* Content */}
                    <View style={styles.approvalInfo}>
                      {/* Header */}
                      <View style={styles.approvalHeader}>
                        <View style={styles.approvalHeaderLeft}>
                          <Text style={styles.employeeName}>{approval.employeeName}</Text>
                          <Text style={styles.submittedDate}>
                            Gửi lúc {formatDate(approval.submittedAt)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.typeBadge,
                            { backgroundColor: 'rgba(249, 115, 22, 0.1)' },
                          ]}
                        >
                          <Text style={[styles.typeBadgeText, { color: '#f97316' }]}>
                            {getLeaveTypeLabel(approval.type)}
                          </Text>
                        </View>
                      </View>

                      {/* Details */}
                      <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                          <Icon name="calendar_month" size={16} color={COLORS.text.secondary} />
                          <Text style={styles.detailText}>
                            {approval.startDate} → {approval.endDate}
                          </Text>
                          <View style={styles.daysBadge}>
                            <Text style={styles.daysBadgeText}>{approval.days} ngày</Text>
                          </View>
                        </View>

                        <View style={styles.detailRow}>
                          <Icon name="assignment" size={16} color={COLORS.text.secondary} />
                          <Text style={styles.reasonText}>{approval.reason}</Text>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.actionsContainer}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={() => handleApprove(approval)}
                          disabled={isProcessing}
                          activeOpacity={0.7}
                        >
                          <Icon name="check_circle" size={18} color="#ffffff" />
                          <Text style={styles.approveButtonText}>Duyệt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => openRejectDialog(approval)}
                          disabled={isProcessing}
                          activeOpacity={0.7}
                        >
                          <Icon name="error" size={18} color={COLORS.status.error} />
                          <Text style={styles.rejectButtonText}>Từ chối</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reject Dialog Modal */}
      <Modal
        visible={showRejectDialog}
        transparent
        animationType="fade"
        onRequestClose={closeRejectDialog}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeRejectDialog}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Từ chối đơn nghỉ phép</Text>
                <TouchableOpacity
                  onPress={closeRejectDialog}
                  disabled={isProcessing}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Từ chối đơn của <Text style={styles.modalDescriptionBold}>{selectedApproval?.employeeName}</Text>
              </Text>

              {/* Note Input */}
              <View style={styles.noteInputContainer}>
                <Text style={styles.noteInputLabel}>
                  Lý do từ chối <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Nhập lý do từ chối..."
                  placeholderTextColor={COLORS.text.secondary}
                  value={rejectNote}
                  onChangeText={setRejectNote}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isProcessing}
                />
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={closeRejectDialog}
                  disabled={isProcessing}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelButtonText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalConfirmButton,
                    (!rejectNote.trim() || isProcessing) && styles.modalButtonDisabled,
                  ]}
                  onPress={handleReject}
                  disabled={!rejectNote.trim() || isProcessing}
                  activeOpacity={0.7}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.modalConfirmButtonText}>Từ chối</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
  approvalsSection: {
    marginTop: SPACING.sm,
  },
  loadingContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: SPACING.xxl,
  },
  approvalsList: {
    gap: SPACING.md,
  },
  approvalCard: {
    backgroundColor: COLORS.surface.dark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    ...SHADOWS.sm,
  },
  approvalContent: {
    flexDirection: 'row',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316',
  },
  approvalInfo: {
    flex: 1,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  approvalHeaderLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  submittedDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  daysBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  daysBadgeText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  approveButton: {
    backgroundColor: COLORS.status.success,
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.status.error,
  },
  rejectButtonText: {
    color: COLORS.status.error,
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface.dark,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  modalDescriptionBold: {
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  noteInputContainer: {
    marginBottom: SPACING.lg,
  },
  noteInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  requiredStar: {
    color: COLORS.status.error,
  },
  noteInput: {
    backgroundColor: COLORS.surface.darker,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    padding: SPACING.md,
    color: COLORS.text.primary,
    fontSize: 14,
    minHeight: 100,
    maxHeight: 150,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  modalCancelButtonText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmButton: {
    backgroundColor: COLORS.status.error,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalConfirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
