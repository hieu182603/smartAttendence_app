import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../../App';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/styles';
import { Icon } from '../components/Icon';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

import { UserRole } from '../types';

// Demo accounts matching web version
const DEMO_ACCOUNTS = [
  {
    email: 'employee@demo.com',
    password: '123456',
    role: UserRole.Employee,
    name: 'Nguyễn Văn A',
  },
  {
    email: 'manager@demo.com',
    password: '123456',
    role: UserRole.Manager,
    name: 'Trần Thị B',
  },
  {
    email: 'admin@demo.com',
    password: '123456',
    role: UserRole.Admin,
    name: 'Lê Văn C',
  },
];

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login, error: authError, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    setLocalError(null);

    // Validation
    if (!email.trim() || !password.trim()) {
      setLocalError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      console.log('Attempting login with:', { email, password: '***' });
      await login(email, password, rememberMe);
      console.log('Login call completed successfully');
    } catch (err) {
      console.error('Login failed:', err);
      // Error is already set in AuthContext, but we can also set local error
      if (err instanceof Error) {
        setLocalError(err.message);
      }
    }
  };

  const handleQuickLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setLocalError(null);

    try {
      await login(account.email, account.password, rememberMe);
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.Employee:
        return {
          bg: 'rgba(66, 69, 240, 0.1)',
          text: COLORS.primary,
          border: 'rgba(66, 69, 240, 0.2)',
        };
      case UserRole.Manager:
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          text: COLORS.accent.yellow,
          border: 'rgba(245, 158, 11, 0.2)',
        };
      case UserRole.Admin:
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          text: COLORS.accent.red,
          border: 'rgba(239, 68, 68, 0.2)',
        };
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.1)',
          text: COLORS.text.secondary,
          border: 'rgba(148, 163, 184, 0.2)',
        };
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.Employee:
        return 'Nhân viên';
      case UserRole.Manager:
        return 'Quản lý';
      case UserRole.Admin:
        return 'Admin/HR';
      default:
        return role;
    }
  };

  const errorMessage = localError || authError;

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Animated Background Gradient */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Animated Background Elements */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}
        pointerEvents="none"
      >
        <View
          style={{
            position: 'absolute',
            top: 80,
            left: 40,
            width: 288,
            height: 288,
            borderRadius: 144,
            backgroundColor: 'rgba(66, 69, 240, 0.2)',
            opacity: 0.5,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 80,
            right: 40,
            width: 384,
            height: 384,
            borderRadius: 192,
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            opacity: 0.5,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: height / 2 - 128,
            left: width / 2 - 128,
            width: 256,
            height: 256,
            borderRadius: 128,
            backgroundColor: 'rgba(66, 69, 240, 0.1)',
            opacity: 0.5,
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: SPACING.lg,
          paddingTop: SPACING.xxl * 2,
          paddingBottom: SPACING.xl,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={{
            alignItems: 'center',
            marginBottom: SPACING.xl,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Animated Logo */}
          <Animated.View
            style={{
              width: 96,
              height: 96,
              marginBottom: SPACING.lg,
              transform: [{ scale: scaleAnim }],
            }}
          >
            {/* Outer glow ring */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 24,
                backgroundColor: 'rgba(66, 69, 240, 0.3)',
                opacity: 0.75,
              }}
            />
            {/* Middle ring */}
            <View
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                right: 4,
                bottom: 4,
                borderRadius: 20,
                backgroundColor: 'rgba(34, 211, 238, 0.3)',
              }}
            />
            {/* Inner icon container */}
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                right: 8,
                bottom: 8,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                ...SHADOWS.lg,
              }}
            >
              <Icon name="person" size={44} color="#ffffff" />
            </LinearGradient>
          </Animated.View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: SPACING.sm,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: '600',
                color: COLORS.text.primary,
                marginRight: SPACING.xs,
              }}
            >
              SmartAttendance
            </Text>
            <Icon name="auto_awesome" size={20} color={COLORS.accent.cyan} />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.text.secondary,
              textAlign: 'center',
            }}
          >
            Đăng nhập vào tài khoản của bạn
          </Text>
        </Animated.View>

        {/* Login Form - Glassmorphism Card */}
        <Animated.View
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            borderRadius: BORDER_RADIUS.xxl,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.2)',
            ...SHADOWS.lg,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Email Input */}
          <View style={{ marginBottom: SPACING.lg }}>
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                borderRadius: BORDER_RADIUS.lg,
                borderWidth: 1,
                borderColor: 'rgba(148, 163, 184, 0.2)',
                paddingHorizontal: SPACING.md,
              }}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="vidu@company.com"
                placeholderTextColor="rgba(148, 163, 184, 0.5)"
                style={{
                  flex: 1,
                  color: COLORS.text.primary,
                  fontSize: 16,
                  paddingVertical: SPACING.md,
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: COLORS.text.primary,
                marginBottom: SPACING.sm,
              }}
            >
              Mật khẩu
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                borderRadius: BORDER_RADIUS.lg,
                borderWidth: 1,
                borderColor: 'rgba(148, 163, 184, 0.2)',
                paddingHorizontal: SPACING.md,
              }}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="rgba(148, 163, 184, 0.5)"
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  color: COLORS.text.primary,
                  fontSize: 16,
                  paddingVertical: SPACING.md,
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: SPACING.xs }}
              >
                <Icon
                  name={showPassword ? 'visibility_off' : 'visibility'}
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me & Forgot Password */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.lg,
            }}
          >
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: rememberMe ? COLORS.primary : COLORS.text.secondary,
                  backgroundColor: rememberMe ? COLORS.primary : 'transparent',
                  marginRight: SPACING.sm,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {rememberMe && (
                  <Icon name="check" size={12} color="#ffffff" />
                )}
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.text.secondary,
                }}
              >
                Ghi nhớ đăng nhập
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.primary,
                  fontWeight: '500',
                }}
              >
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {errorMessage && (
            <View
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.3)',
                borderRadius: BORDER_RADIUS.md,
                padding: SPACING.md,
                marginBottom: SPACING.lg,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Icon name="error" size={16} color={COLORS.accent.red} />
              <Text
                style={{
                  color: COLORS.accent.red,
                  fontSize: 14,
                  marginLeft: SPACING.sm,
                  flex: 1,
                }}
              >
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={authLoading}
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
                justifyContent: 'center',
                ...SHADOWS.md,
                opacity: authLoading ? 0.7 : 1,
              }}
            >
              {authLoading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: '600',
                      marginLeft: SPACING.sm,
                    }}
                  >
                    Đang đăng nhập...
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="login" size={20} color="#ffffff" />
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: '600',
                      marginLeft: SPACING.sm,
                    }}
                  >
                    Đăng nhập
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Demo Accounts Quick Login */}
        <View style={{ marginTop: SPACING.xl }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: COLORS.text.secondary,
              textAlign: 'center',
              marginBottom: SPACING.md,
            }}
          >
            Hoặc đăng nhập nhanh với tài khoản demo:
          </Text>
          {DEMO_ACCOUNTS.map((account) => {
            const badgeColors = getRoleBadgeColor(account.role);
            return (
              <TouchableOpacity
                key={account.email}
                onPress={() => handleQuickLogin(account)}
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: BORDER_RADIUS.lg,
                  padding: SPACING.md,
                  marginBottom: SPACING.sm,
                  borderWidth: 1,
                  borderColor: 'rgba(148, 163, 184, 0.1)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: COLORS.text.primary,
                      fontSize: 14,
                      fontWeight: '500',
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    {account.name}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.text.secondary,
                      fontSize: 12,
                    }}
                  >
                    {account.email}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: badgeColors.bg,
                    borderWidth: 1,
                    borderColor: badgeColors.border,
                    borderRadius: BORDER_RADIUS.sm,
                    paddingHorizontal: SPACING.sm,
                    paddingVertical: SPACING.xs / 2,
                  }}
                >
                  <Text
                    style={{
                      color: badgeColors.text,
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                  >
                    {getRoleLabel(account.role)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
