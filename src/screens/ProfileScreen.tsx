import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS, useTheme } from '../utils/styles';
import { useTranslation } from '../i18n';
import { Icon } from '../components/Icon';
import { UserService } from '../services/user.service';

interface UserInfo {
  name: string;
  employeeId: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  salary: {
    basic: string;
    currency: string;
    taxCode: string;
  };
  bankInfo: {
    name: string;
    accountNumber: string;
  };
}

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const { isDarkMode, toggleDarkMode, notificationsEnabled, toggleNotifications } = usePreferences();
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showSalary, setShowSalary] = useState(false);

  // Edit dialogs state
  const [showEditPersonal, setShowEditPersonal] = useState(false);
  const [showEditSalary, setShowEditSalary] = useState(false);
  const [loading, setLoading] = useState(true);

  // User data state
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Form states for editing
  const [editPersonalForm, setEditPersonalForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [editSalaryForm, setEditSalaryForm] = useState({
    basic: '',
    taxCode: '',
    bankName: '',
    accountNumber: '',
  });

  const fetchProfile = async () => {
    try {
      const profile = await UserService.getProfile();
      // Map backend response to frontend UserInfo interface if needed
      // Assuming backend returns matching structure or we map it here
      setUserInfo({
        name: profile.name || user?.name || '',
        employeeId: profile.employeeId || user?.employeeId || '',
        department: profile.department?.name || profile.department || '',
        position: profile.position || '',
        email: profile.email || '',
        phone: profile.phone || '',
        salary: {
          basic: profile.salary?.basic || '0',
          currency: profile.salary?.currency || 'VNĐ',
          taxCode: profile.salary?.taxCode || '',
        },
        bankInfo: {
          name: profile.bankInfo?.name || '',
          accountNumber: profile.bankInfo?.accountNumber || '',
        }
      });

      // Initial form values
      setEditPersonalForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
      setEditSalaryForm({
        basic: profile.salary?.basic || '',
        taxCode: profile.salary?.taxCode || '',
        bankName: profile.bankInfo?.name || '',
        accountNumber: profile.bankInfo?.accountNumber || '',
      });

    } catch (error) {
      console.log('Error fetching user profile, using auth data as fallback', error);
      // Fallback to AuthContext user data when API fails
      if (user) {
        setUserInfo({
          name: user.name || '',
          employeeId: (user as any).employeeId || '',
          department: (user as any).department?.name || (user as any).department || '',
          position: (user as any).position || '',
          email: user.email || '',
          phone: (user as any).phone || '',
          salary: {
            basic: '0',
            currency: 'VNĐ',
            taxCode: '',
          },
          bankInfo: {
            name: '',
            accountNumber: '',
          }
        });
        setEditPersonalForm({
          name: user.name || '',
          email: user.email || '',
          phone: (user as any).phone || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.text.secondary }}>{t.profile.loadError}</Text>
        <TouchableOpacity onPress={() => { setLoading(true); fetchProfile(); }} style={{ padding: 10, marginTop: 10 }}>
          <Text style={{ color: COLORS.primary }}>{t.common.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSavePersonal = async () => {
    try {
      await UserService.updateProfile({
        name: editPersonalForm.name,
        phone: editPersonalForm.phone,
        // Email might be read-only depending on backend rules
      });

      setUserInfo((prev) => prev ? ({
        ...prev,
        name: editPersonalForm.name,
        phone: editPersonalForm.phone,
        // Update email if allowed
      }) : null);
      setShowEditPersonal(false);
    } catch (error) {
      console.log('Error updating profile', error);
      // Show alert error
    }
  };

  const handleSaveSalary = async () => {
    try {
      // Only update bank info
      await UserService.updateBankInfo({
        bankName: editSalaryForm.bankName,
        accountNumber: editSalaryForm.accountNumber,
      });

      setUserInfo((prev) => prev ? ({
        ...prev,
        bankInfo: {
          name: editSalaryForm.bankName,
          accountNumber: editSalaryForm.accountNumber,
        },
      }) : null);
      setShowEditSalary(false);
    } catch (error) {
      console.log('Error updating bank info', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView
      style={[globalStyles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header with Avatar */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent.cyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: SPACING.xxl * 2,
          paddingBottom: SPACING.xxl,
          paddingHorizontal: SPACING.lg,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 4,
            borderColor: '#ffffff',
            marginBottom: SPACING.md,
            ...SHADOWS.lg,
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 36,
              fontWeight: '600',
            }}
          >
            {userInfo.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: SPACING.xs / 2,
          }}
        >
          {userInfo.name}
        </Text>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
          {userInfo.employeeId}
        </Text>
      </LinearGradient>

      {/* Personal Information */}
      <View style={{ paddingHorizontal: SPACING.lg, marginTop: -SPACING.lg, marginBottom: SPACING.lg }}>
        <View
          style={{
            backgroundColor: COLORS.surface.dark,
            borderRadius: BORDER_RADIUS.xl,
            padding: SPACING.md,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.1)',
            ...SHADOWS.lg,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: COLORS.text.primary,
              marginBottom: SPACING.md,
            }}
          >
            Thông tin cá nhân
          </Text>
          <View>
            {/* Name */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.md,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: 'rgba(66, 69, 240, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name="person" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs / 2 }}>
                  {t.profile.fullName}
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.text.primary, fontWeight: '500' }}>
                  {userInfo.name}
                </Text>
              </View>
            </View>

            {/* Position */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.md,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: 'rgba(34, 211, 238, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name="work" size={20} color={COLORS.accent.cyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs / 2 }}>
                  {t.profile.position}
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.text.primary, fontWeight: '500' }}>
                  {userInfo.position}
                </Text>
              </View>
            </View>

            {/* Department */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.md,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name="business" size={20} color={COLORS.accent.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs / 2 }}>
                  {t.profile.department}
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.text.primary, fontWeight: '500' }}>
                  {userInfo.department}
                </Text>
              </View>
            </View>

            {/* Email */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.md,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name="email" size={20} color={COLORS.accent.yellow} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs / 2 }}>
                  Email
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.text.primary,
                    fontWeight: '500',
                  }}
                  numberOfLines={1}
                >
                  {userInfo.email}
                </Text>
              </View>
            </View>

            {/* Phone */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.md,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: 'rgba(66, 69, 240, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name="phone" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs / 2 }}>
                  {t.profile.phone}
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.text.primary, fontWeight: '500' }}>
                  {userInfo.phone}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowEditPersonal(true)}
            style={{
              marginTop: SPACING.md,
              paddingVertical: SPACING.md,
              borderRadius: BORDER_RADIUS.lg,
              borderWidth: 1,
              borderColor: 'rgba(66, 69, 240, 0.5)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="edit" size={20} color={COLORS.primary} />
            <Text
              style={{
                color: COLORS.primary,
                fontSize: 14,
                fontWeight: '500',
                marginLeft: SPACING.sm,
              }}
            >
              {t.profile.editPersonal}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payroll Information */}
      <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
        <View
          style={{
            backgroundColor: COLORS.surface.dark,
            borderRadius: BORDER_RADIUS.xl,
            padding: SPACING.md,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.1)',
            ...SHADOWS.lg,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: COLORS.text.primary,
              marginBottom: SPACING.md,
            }}
          >
            {t.profile.payrollInfo}
          </Text>
          <View>
            {/* Salary */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: SPACING.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: BORDER_RADIUS.md,
                    backgroundColor: 'rgba(34, 211, 238, 0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: SPACING.md,
                  }}
                >
                  <Icon name="credit_card" size={20} color={COLORS.accent.cyan} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs / 2 }}>
                    {t.profile.basicSalary}
                  </Text>
                  <Text style={{ fontSize: 14, color: COLORS.text.primary, fontWeight: '500' }}>
                    {showSalary
                      ? `${userInfo.salary.basic} ${userInfo.salary.currency}`
                      : '••••••••'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowSalary(!showSalary)}
                style={{ padding: SPACING.sm }}
              >
                <Icon
                  name={showSalary ? 'visibility_off' : 'visibility'}
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Tax Code */}
            <View
              style={{
                paddingTop: SPACING.md,
                borderTopWidth: 1,
                borderTopColor: 'rgba(148, 163, 184, 0.1)',
                marginBottom: SPACING.md,
              }}
            >
              <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs }}>
                {t.profile.taxCode}
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.text.primary, fontWeight: '500' }}>
                {userInfo.salary.taxCode}
              </Text>
            </View>

            {/* Bank Info */}
            <View
              style={{
                paddingTop: SPACING.md,
                borderTopWidth: 1,
                borderTopColor: 'rgba(148, 163, 184, 0.1)',
              }}
            >
              <Text style={{ fontSize: 11, color: COLORS.text.secondary, marginBottom: SPACING.xs }}>
                {t.profile.bankInfo}
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.text.primary, fontWeight: '500', marginBottom: SPACING.xs / 2 }}>
                {userInfo.bankInfo.name}
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                STK: {userInfo.bankInfo.accountNumber}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowEditSalary(true)}
            style={{
              marginTop: SPACING.md,
              paddingVertical: SPACING.md,
              borderRadius: BORDER_RADIUS.lg,
              borderWidth: 1,
              borderColor: 'rgba(66, 69, 240, 0.5)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="edit" size={20} color={COLORS.primary} />
            <Text
              style={{
                color: COLORS.primary,
                fontSize: 14,
                fontWeight: '500',
                marginLeft: SPACING.sm,
              }}
            >
              {t.profile.editPayroll}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Settings */}
      <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
        <View
          style={{
            backgroundColor: COLORS.surface.dark,
            borderRadius: BORDER_RADIUS.xl,
            padding: SPACING.md,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.1)',
            ...SHADOWS.lg,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: COLORS.text.primary,
              marginBottom: SPACING.md,
            }}
          >
            {t.profile.appSettings}
          </Text>
          <View>
            {/* Notifications */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: SPACING.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: BORDER_RADIUS.md,
                    backgroundColor: 'rgba(66, 69, 240, 0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: SPACING.md,
                  }}
                >
                  <Icon name="notifications" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: COLORS.text.primary, fontWeight: '500', marginBottom: SPACING.xs / 2 }}>
                    {t.profile.pushNotifications}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                    {t.profile.pushNotificationsDesc}
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: COLORS.surface.darker, true: COLORS.primary }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Dark Mode */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: BORDER_RADIUS.md,
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: SPACING.md,
                  }}
                >
                  <Icon name="dark_mode" size={20} color={COLORS.text.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: COLORS.text.primary, fontWeight: '500', marginBottom: SPACING.xs / 2 }}>
                    {t.profile.darkModeLabel}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                    {t.profile.darkModeDesc}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: COLORS.surface.darker, true: COLORS.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
        <View
          style={{
            backgroundColor: COLORS.surface.dark,
            borderRadius: BORDER_RADIUS.xl,
            padding: SPACING.md,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.1)',
            ...SHADOWS.lg,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: COLORS.text.primary,
              marginBottom: SPACING.md,
            }}
          >
            {t.profile.account}
          </Text>

          {/* Change Password */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ChangePassword' as never)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: SPACING.sm,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(148, 163, 184, 0.1)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: 'rgba(66, 69, 240, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name="lock_reset" size={20} color={COLORS.primary} />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.text.primary,
                  fontWeight: '500',
                }}
              >
                {t.profile.changePassword}
              </Text>
            </View>
            <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings' as never)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: SPACING.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name="settings" size={20} color={COLORS.text.secondary} />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.text.primary,
                  fontWeight: '500',
                }}
              >
                {t.profile.settings}
              </Text>
            </View>
            <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg }}>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            paddingVertical: SPACING.md,
            borderRadius: BORDER_RADIUS.lg,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.5)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="logout" size={20} color={COLORS.accent.red} />
          <Text
            style={{
              color: COLORS.accent.red,
              fontSize: 14,
              fontWeight: '500',
              marginLeft: SPACING.sm,
            }}
          >
            {t.profile.logout}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Personal Dialog */}
      <Modal
        visible={showEditPersonal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditPersonal(false)}
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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: COLORS.text.primary,
                }}
              >
                {t.profile.editPersonal}
              </Text>
              <TouchableOpacity onPress={() => setShowEditPersonal(false)}>
                <Icon name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: SPACING.md }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.sm,
                  }}
                >
                  {t.profile.fullName}
                </Text>
                <TextInput
                  placeholder={t.profile.enterName}
                  placeholderTextColor={COLORS.text.secondary}
                  value={editPersonalForm.name}
                  onChangeText={(text) => setEditPersonalForm({ ...editPersonalForm, name: text })}
                  style={{
                    backgroundColor: COLORS.surface.darker,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    padding: SPACING.md,
                    color: COLORS.text.primary,
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ marginBottom: SPACING.md }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.sm,
                  }}
                >
                  Email
                </Text>
                <TextInput
                  placeholder={t.profile.enterEmail}
                  placeholderTextColor={COLORS.text.secondary}
                  value={editPersonalForm.email}
                  onChangeText={(text) => setEditPersonalForm({ ...editPersonalForm, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    backgroundColor: COLORS.surface.darker,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    padding: SPACING.md,
                    color: COLORS.text.primary,
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ marginBottom: SPACING.lg }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.sm,
                  }}
                >
                  {t.profile.phone}
                </Text>
                <TextInput
                  placeholder={t.profile.enterPhone}
                  placeholderTextColor={COLORS.text.secondary}
                  value={editPersonalForm.phone}
                  onChangeText={(text) => setEditPersonalForm({ ...editPersonalForm, phone: text })}
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: COLORS.surface.darker,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    padding: SPACING.md,
                    color: COLORS.text.primary,
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                <TouchableOpacity
                  onPress={() => setShowEditPersonal(false)}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING.md,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: COLORS.text.primary, fontSize: 16, fontWeight: '500' }}>
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSavePersonal}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING.md,
                    borderRadius: BORDER_RADIUS.lg,
                    backgroundColor: COLORS.primary,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '500' }}>
                    Lưu
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Salary Dialog */}
      <Modal
        visible={showEditSalary}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditSalary(false)}
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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: COLORS.text.primary,
                }}
              >
                {t.profile.editPayroll}
              </Text>
              <TouchableOpacity onPress={() => setShowEditSalary(false)}>
                <Icon name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: SPACING.md }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.sm,
                  }}
                >
                  {t.profile.basicSalaryLabel}
                </Text>
                <TextInput
                  placeholder="15,000,000"
                  placeholderTextColor={COLORS.text.secondary}
                  value={editSalaryForm.basic}
                  onChangeText={(text) => setEditSalaryForm({ ...editSalaryForm, basic: text })}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: COLORS.surface.darker,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    padding: SPACING.md,
                    color: COLORS.text.primary,
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ marginBottom: SPACING.md }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.sm,
                  }}
                >
                  {t.profile.taxCode}
                </Text>
                <TextInput
                  placeholder="0123456789"
                  placeholderTextColor={COLORS.text.secondary}
                  value={editSalaryForm.taxCode}
                  onChangeText={(text) => setEditSalaryForm({ ...editSalaryForm, taxCode: text })}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: COLORS.surface.darker,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    padding: SPACING.md,
                    color: COLORS.text.primary,
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ marginBottom: SPACING.md }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.sm,
                  }}
                >
                  {t.profile.bankName}
                </Text>
                <TextInput
                  placeholder={t.profile.enterBankName}
                  placeholderTextColor={COLORS.text.secondary}
                  value={editSalaryForm.bankName}
                  onChangeText={(text) => setEditSalaryForm({ ...editSalaryForm, bankName: text })}
                  style={{
                    backgroundColor: COLORS.surface.darker,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    padding: SPACING.md,
                    color: COLORS.text.primary,
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ marginBottom: SPACING.lg }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: COLORS.text.primary,
                    marginBottom: SPACING.sm,
                  }}
                >
                  {t.profile.accountNumber}
                </Text>
                <TextInput
                  placeholder="1234567890"
                  placeholderTextColor={COLORS.text.secondary}
                  value={editSalaryForm.accountNumber}
                  onChangeText={(text) => setEditSalaryForm({ ...editSalaryForm, accountNumber: text })}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: COLORS.surface.darker,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    padding: SPACING.md,
                    color: COLORS.text.primary,
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                <TouchableOpacity
                  onPress={() => setShowEditSalary(false)}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING.md,
                    borderRadius: BORDER_RADIUS.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: COLORS.text.primary, fontSize: 16, fontWeight: '500' }}>
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveSalary}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING.md,
                    borderRadius: BORDER_RADIUS.lg,
                    backgroundColor: COLORS.primary,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '500' }}>
                    Lưu
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
