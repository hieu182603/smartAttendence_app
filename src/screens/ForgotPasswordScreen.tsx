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
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/styles';
import { Icon } from '../components/Icon';
import api from '../libs/axios';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface ForgotPasswordScreenProps {
    navigation: ForgotPasswordScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        setError(null);

        if (!email.trim()) {
            setError('Vui lòng nhập email');
            return;
        }

        if (!validateEmail(email)) {
            setError('Email không hợp lệ');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email: email.trim() });
            setSuccess(true);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                'Có lỗi xảy ra. Vui lòng thử lại.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigation.goBack();
    };

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
                {/* Back Button */}
                <TouchableOpacity
                    onPress={handleBackToLogin}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: SPACING.xl,
                    }}
                >
                    <Icon name="arrow_back" size={24} color={COLORS.text.primary} />
                    <Text
                        style={{
                            color: COLORS.text.primary,
                            fontSize: 16,
                            marginLeft: SPACING.sm,
                        }}
                    >
                        Quay lại
                    </Text>
                </TouchableOpacity>

                {/* Header */}
                <Animated.View
                    style={{
                        alignItems: 'center',
                        marginBottom: SPACING.xl,
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    {/* Animated Icon */}
                    <Animated.View
                        style={{
                            width: 96,
                            height: 96,
                            marginBottom: SPACING.lg,
                            transform: [{ scale: scaleAnim }],
                        }}
                    >
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
                            <Icon name="lock_reset" size={44} color="#ffffff" />
                        </LinearGradient>
                    </Animated.View>

                    <Text
                        style={{
                            fontSize: 24,
                            fontWeight: '600',
                            color: COLORS.text.primary,
                            marginBottom: SPACING.sm,
                        }}
                    >
                        Quên mật khẩu?
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: COLORS.text.secondary,
                            textAlign: 'center',
                            paddingHorizontal: SPACING.lg,
                        }}
                    >
                        Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
                    </Text>
                </Animated.View>

                {/* Form Card */}
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
                    {success ? (
                        // Success State
                        <View style={{ alignItems: 'center', paddingVertical: SPACING.lg }}>
                            <View
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: SPACING.lg,
                                }}
                            >
                                <Icon name="check_circle" size={40} color={COLORS.accent.green} />
                            </View>
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: '600',
                                    color: COLORS.text.primary,
                                    marginBottom: SPACING.sm,
                                    textAlign: 'center',
                                }}
                            >
                                Kiểm tra email của bạn
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: COLORS.text.secondary,
                                    textAlign: 'center',
                                    marginBottom: SPACING.lg,
                                }}
                            >
                                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{'\n'}
                                <Text style={{ color: COLORS.primary, fontWeight: '500' }}>{email}</Text>
                            </Text>
                            <TouchableOpacity
                                onPress={handleBackToLogin}
                                style={{
                                    paddingVertical: SPACING.md,
                                    paddingHorizontal: SPACING.xl,
                                }}
                            >
                                <Text
                                    style={{
                                        color: COLORS.primary,
                                        fontSize: 16,
                                        fontWeight: '500',
                                    }}
                                >
                                    Quay lại đăng nhập
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Form State
                        <>
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
                                        borderColor: error ? 'rgba(239, 68, 68, 0.5)' : 'rgba(148, 163, 184, 0.2)',
                                        paddingHorizontal: SPACING.md,
                                    }}
                                >
                                    <Icon name="email" size={20} color={COLORS.text.secondary} />
                                    <TextInput
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            if (error) setError(null);
                                        }}
                                        placeholder="vidu@company.com"
                                        placeholderTextColor="rgba(148, 163, 184, 0.5)"
                                        style={{
                                            flex: 1,
                                            color: COLORS.text.primary,
                                            fontSize: 16,
                                            paddingVertical: SPACING.md,
                                            marginLeft: SPACING.sm,
                                        }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!isLoading}
                                    />
                                </View>
                            </View>

                            {/* Error Message */}
                            {error && (
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
                                        {error}
                                    </Text>
                                </View>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isLoading}
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
                                        opacity: isLoading ? 0.7 : 1,
                                    }}
                                >
                                    {isLoading ? (
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
                                                Đang gửi...
                                            </Text>
                                        </View>
                                    ) : (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon name="send" size={20} color="#ffffff" />
                                            <Text
                                                style={{
                                                    color: '#ffffff',
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                    marginLeft: SPACING.sm,
                                                }}
                                            >
                                                Gửi hướng dẫn
                                            </Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Back to Login Link */}
                            <TouchableOpacity
                                onPress={handleBackToLogin}
                                style={{
                                    marginTop: SPACING.lg,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color: COLORS.text.secondary,
                                        fontSize: 14,
                                    }}
                                >
                                    Đã nhớ mật khẩu?{' '}
                                    <Text style={{ color: COLORS.primary, fontWeight: '500' }}>
                                        Đăng nhập
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
