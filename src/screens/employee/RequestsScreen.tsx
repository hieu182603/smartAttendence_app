import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { EmployeeTabParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { DateTimePickerWrapper } from '../../components/DateTimePickerWrapper';

type RequestsScreenNavigationProp = BottomTabNavigationProp<EmployeeTabParamList, 'Requests'>;

interface RequestsScreenProps {
  navigation: RequestsScreenNavigationProp;
}

interface LeaveRequest {
  id: string | number;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  rejectionReason?: string;
}

export default function RequestsScreen({ navigation }: RequestsScreenProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reason, setReason] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showLeaveTypePicker, setShowLeaveTypePicker] = useState(false);

  // Listen for navigation params to open create leave modal
  useFocusEffect(
    React.useCallback(() => {
      // Get current route params
      const state = navigation.getState();
      const currentRoute = state?.routes[state?.index];
      const params = currentRoute?.params as { openCreateModal?: boolean } | undefined;

      if (params?.openCreateModal) {
        setIsDialogOpen(true);
        // Clear the param after opening
        navigation.setParams({ openCreateModal: undefined } as any);
      }
    }, [navigation])
  );

  // State for fetched data
  const [leaveBalance, setLeaveBalance] = useState<any[]>([
    { id: 'annual', name: 'Nghỉ phép năm', remaining: 0 },
    { id: 'sick', name: 'Nghỉ ốm', remaining: 0 },
    { id: 'unpaid', name: 'Nghỉ không lương', remaining: 0 },
  ]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leaveTypes = [
    'Nghỉ phép năm',
    'Nghỉ ốm',
    'Nghỉ không lương',
    'Đăng ký tăng ca',
    'Nghỉ bù',
    'Nghỉ thai sản'
  ];

  // Map Vietnamese labels to canonical API codes
  const mapLeaveTypeToCode = (label: string): string => {
    const mapping: Record<string, string> = {
      'Nghỉ phép năm': 'annual',
      'Nghỉ ốm': 'sick',
      'Nghỉ không lương': 'unpaid',
      'Đăng ký tăng ca': 'other',
      'Nghỉ bù': 'compensatory',
      'Nghỉ thai sản': 'maternity'
    };
    return mapping[label] || 'other';
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setIsLoading(true);
      const { LeaveService } = await import('../../services/leave.service');

      // Parallel fetching
      const [balanceRes, historyRes] = await Promise.all([
        LeaveService.getBalance(),
        LeaveService.getHistory({ limit: 10 })
      ]);

      console.log('Balance Response:', balanceRes);

      // Map Balance
      if (Array.isArray(balanceRes) && balanceRes.length > 0) {
        setLeaveBalance(balanceRes);
      } else if (balanceRes && typeof balanceRes === 'object') {
        // Fallback if backend returns object with keys
        // This handles potential transition period or API format change
        const mapped = [];
        if (balanceRes.annual) mapped.push({ id: 'annual', name: 'Nghỉ phép năm', remaining: balanceRes.annual.remaining || 0 });
        if (balanceRes.sick) mapped.push({ id: 'sick', name: 'Nghỉ ốm', remaining: balanceRes.sick.remaining || 0 });
        if (balanceRes.unpaid) mapped.push({ id: 'unpaid', name: 'Nghỉ không lương', remaining: balanceRes.unpaid.remaining || 0 });

        if (mapped.length > 0) setLeaveBalance(mapped);
      }

      // Map History
      if (historyRes && Array.isArray(historyRes)) {
        const mappedRequests = historyRes.map((item: any) => ({
          id: item._id, // Use string ID from DB
          type: item.type,
          startDate: item.startDate,
          endDate: item.endDate,
          reason: item.reason,
          status: item.status,
          submittedDate: item.createdAt,
          rejectionReason: item.rejectionReason,
        }));
        setRequests(mappedRequests);
      }

    } catch (error) {
      console.error('Error fetching leave data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!leaveType || !reason) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setIsSubmitting(true);
      const { LeaveService } = await import('../../services/leave.service');

      // Map Vietnamese label to canonical code for backend
      const canonicalType = mapLeaveTypeToCode(leaveType);

      await LeaveService.createRequest({
        type: canonicalType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: reason,
      });

      alert('Gửi đơn thành công!');
      setIsDialogOpen(false);
      setLeaveType('');
      setReason('');
      fetchLeaveData(); // Refresh list

    } catch (error: any) {
      console.error('Submit leave error', error);
      alert(error.response?.data?.message || 'Gửi đơn thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <View
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(34, 197, 94, 0.3)',
              borderRadius: BORDER_RADIUS.sm,
              paddingHorizontal: SPACING.sm,
              paddingVertical: SPACING.xs / 2,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon name="check_circle" size={12} color={COLORS.accent.green} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: COLORS.accent.green,
                marginLeft: SPACING.xs / 2,
              }}
            >
              Đã duyệt
            </Text>
          </View>
        );
      case 'rejected':
        return (
          <View
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.3)',
              borderRadius: BORDER_RADIUS.sm,
              paddingHorizontal: SPACING.sm,
              paddingVertical: SPACING.xs / 2,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon name="error" size={12} color={COLORS.accent.red} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: COLORS.accent.red,
                marginLeft: SPACING.xs / 2,
              }}
            >
              Từ chối
            </Text>
          </View>
        );
      default:
        return (
          <View
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(245, 158, 11, 0.3)',
              borderRadius: BORDER_RADIUS.sm,
              paddingHorizontal: SPACING.sm,
              paddingVertical: SPACING.xs / 2,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon name="schedule" size={12} color={COLORS.accent.yellow} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: COLORS.accent.yellow,
                marginLeft: SPACING.xs / 2,
              }}
            >
              Chờ duyệt
            </Text>
          </View>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

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
          paddingBottom: SPACING.lg,
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
              Nghỉ phép & Đơn từ
            </Text>
            <Icon name="auto_awesome" size={20} color={COLORS.accent.cyan} />
          </View>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
            Quản lý các đơn xin nghỉ
          </Text>
        </View>
      </LinearGradient>

      {/* Leave Balance */}
      <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.md,
          }}
        >
          <Icon name="schedule" size={16} color={COLORS.primary} />
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: COLORS.text.primary,
              marginLeft: SPACING.sm,
            }}
          >
            Số ngày phép còn lại
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {Array.isArray(leaveBalance) && leaveBalance.map((item: any) => (
            <View
              key={item.id}
              style={{
                width: '48%',
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                borderRadius: BORDER_RADIUS.lg,
                padding: SPACING.md,
                marginBottom: SPACING.md,
                borderWidth: 1,
                borderColor: 'rgba(148, 163, 184, 0.1)',
                ...SHADOWS.md,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.text.secondary,
                  marginBottom: SPACING.xs,
                  height: 32, // Fixed height for alignment
                }}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: item.remaining > 0 ? COLORS.accent.green : COLORS.text.secondary,
                }}
              >
                {item.remaining}
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.text.secondary }}>
                ngày
              </Text>
            </View>
          ))}
        </View>
      </View>



      {/* Request History */}
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
            Lịch sử đơn từ
          </Text>
        </View>
        <View>
          {requests.map((request) => (
            <View
              key={request.id}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                borderRadius: BORDER_RADIUS.lg,
                padding: SPACING.md,
                marginBottom: SPACING.md,
                borderWidth: 1,
                borderColor: 'rgba(148, 163, 184, 0.1)',
                ...SHADOWS.md,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: SPACING.md,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: COLORS.text.primary,
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    {request.type}
                  </Text>
                  <Text style={{ fontSize: 11, color: COLORS.text.secondary }}>
                    Gửi ngày {formatDate(request.submittedDate)}
                  </Text>
                </View>
                {getStatusBadge(request.status)}
              </View>

              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: SPACING.sm,
                    borderRadius: BORDER_RADIUS.md,
                    backgroundColor: 'rgba(66, 69, 240, 0.05)',
                    marginBottom: SPACING.sm,
                  }}
                >
                  <Icon
                    name="event"
                    size={16}
                    color={COLORS.text.secondary}
                    style={{ marginRight: SPACING.sm }}
                  />
                  <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: SPACING.sm,
                    borderRadius: BORDER_RADIUS.md,
                    backgroundColor: 'rgba(34, 211, 238, 0.05)',
                  }}
                >
                  <Icon
                    name="assignment"
                    size={16}
                    color={COLORS.text.secondary}
                    style={{ marginRight: SPACING.sm, marginTop: 2 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.text.secondary,
                      flex: 1,
                    }}
                  >
                    {request.reason}
                  </Text>
                </View>
              </View>

              {request.status === 'rejected' && request.rejectionReason && (
                <View
                  style={{
                    marginTop: SPACING.md,
                    padding: SPACING.md,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: BORDER_RADIUS.md,
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '500',
                      color: COLORS.accent.red,
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    Lý do từ chối:
                  </Text>
                  <Text style={{ fontSize: 11, color: COLORS.accent.red, opacity: 0.8 }}>
                    {request.rejectionReason}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Create Leave Request Modal */}
      <Modal
        visible={isDialogOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDialogOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.surface.dark,
              borderTopLeftRadius: BORDER_RADIUS.xl,
              borderTopRightRadius: BORDER_RADIUS.xl,
              padding: SPACING.lg,
              maxHeight: '90%',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.lg,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.xs / 2,
                  }}
                >
                  Tạo đơn xin nghỉ
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                  Điền thông tin đơn xin nghỉ của bạn
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsDialogOpen(false)}>
                <Icon name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Leave Type */}
              <View style={{ marginBottom: SPACING.lg }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.sm,
                  }}
                >
                  Loại đơn
                </Text>
                <TouchableOpacity
                  onPress={() => setShowLeaveTypePicker(true)}
                  style={{
                    backgroundColor: COLORS.surface.darker,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    paddingVertical: SPACING.md,
                    paddingHorizontal: SPACING.md,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: leaveType ? COLORS.text.primary : COLORS.text.secondary,
                      fontSize: 16,
                    }}
                  >
                    {leaveType || 'Chọn loại đơn'}
                  </Text>
                  <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
                </TouchableOpacity>

                {/* Leave Type Picker Modal */}
                <Modal
                  visible={showLeaveTypePicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowLeaveTypePicker(false)}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    activeOpacity={1}
                    onPress={() => setShowLeaveTypePicker(false)}
                  >
                    <View
                      style={{
                        backgroundColor: COLORS.surface.dark,
                        borderRadius: BORDER_RADIUS.xl,
                        padding: SPACING.md,
                        width: '80%',
                        maxWidth: 400,
                      }}
                      onStartShouldSetResponder={() => true}
                    >
                      {leaveTypes.map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => {
                            setLeaveType(type);
                            setShowLeaveTypePicker(false);
                          }}
                          style={{
                            padding: SPACING.md,
                            borderRadius: BORDER_RADIUS.md,
                            marginBottom: SPACING.xs,
                            backgroundColor:
                              leaveType === type
                                ? 'rgba(66, 69, 240, 0.1)'
                                : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              color:
                                leaveType === type
                                  ? COLORS.primary
                                  : COLORS.text.primary,
                              fontSize: 16,
                              fontWeight: leaveType === type ? '600' : '400',
                            }}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              {/* Date Pickers */}
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: SPACING.lg,
                }}
              >
                <View style={{ flex: 1, marginRight: SPACING.sm }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: COLORS.text.primary,
                      marginBottom: SPACING.sm,
                    }}
                  >
                    Từ ngày
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(true)}
                    style={{
                      backgroundColor: COLORS.surface.darker,
                      borderRadius: BORDER_RADIUS.lg,
                      borderWidth: 1,
                      borderColor: 'rgba(148, 163, 184, 0.2)',
                      paddingVertical: SPACING.md,
                      paddingHorizontal: SPACING.md,
                    }}
                  >
                    <Text style={{ color: COLORS.text.primary, fontSize: 16 }}>
                      {formatDateForInput(startDate)}
                    </Text>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePickerWrapper
                      value={startDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event: any, selectedDate?: Date) => {
                        if (Platform.OS === 'android') {
                          setShowStartDatePicker(false);
                        }
                        if (selectedDate) {
                          setStartDate(selectedDate);
                        }
                      }}
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: COLORS.text.primary,
                      marginBottom: SPACING.sm,
                    }}
                  >
                    Đến ngày
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(true)}
                    style={{
                      backgroundColor: COLORS.surface.darker,
                      borderRadius: BORDER_RADIUS.lg,
                      borderWidth: 1,
                      borderColor: 'rgba(148, 163, 184, 0.2)',
                      paddingVertical: SPACING.md,
                      paddingHorizontal: SPACING.md,
                    }}
                  >
                    <Text style={{ color: COLORS.text.primary, fontSize: 16 }}>
                      {formatDateForInput(endDate)}
                    </Text>
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePickerWrapper
                      value={endDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event: any, selectedDate?: Date) => {
                        if (Platform.OS === 'android') {
                          setShowEndDatePicker(false);
                        }
                        if (selectedDate) {
                          setEndDate(selectedDate);
                        }
                      }}
                    />
                  )}
                  {Platform.OS === 'web' && showEndDatePicker && (
                    <TextInput
                      value={formatDateForInput(endDate)}
                      onChangeText={(text) => {
                        if (text) {
                          const date = new Date(text);
                          if (!isNaN(date.getTime())) {
                            setEndDate(date);
                          }
                        }
                      }}
                      onBlur={() => setShowEndDatePicker(false)}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={COLORS.text.secondary}
                      style={{
                        backgroundColor: COLORS.surface.darker,
                        borderRadius: BORDER_RADIUS.lg,
                        borderWidth: 1,
                        borderColor: 'rgba(148, 163, 184, 0.2)',
                        padding: SPACING.md,
                        color: COLORS.text.primary,
                        fontSize: 16,
                        marginTop: SPACING.sm,
                      }}
                    />
                  )}
                </View>
              </View>

              {/* Reason */}
              <View style={{ marginBottom: SPACING.lg }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.sm,
                  }}
                >
                  Lý do
                </Text>
                <TextInput
                  placeholder="Nhập lý do xin nghỉ..."
                  placeholderTextColor={COLORS.text.secondary}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: COLORS.surface.darker,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    padding: SPACING.md,
                    color: COLORS.text.primary,
                    fontSize: 16,
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitRequest}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent.cyan]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: BORDER_RADIUS.lg,
                    paddingVertical: SPACING.md,
                    alignItems: 'center',
                    ...SHADOWS.md,
                  }}
                >
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Gửi đơn
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
