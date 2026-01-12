import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    Modal,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/styles';
import { Icon } from '../components/Icon';

type Language = 'vi' | 'en';

interface LanguageOption {
    code: Language;
    name: string;
    flag: string;
}

const LANGUAGES: LanguageOption[] = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
];

export default function SettingsScreen() {
    const navigation = useNavigation();

    // Settings state
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [language, setLanguage] = useState<Language>('vi');
    const [showLanguagePicker, setShowLanguagePicker] = useState(false);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleClearCache = () => {
        Alert.alert(
            'Xóa bộ nhớ đệm',
            'Bạn có chắc chắn muốn xóa tất cả dữ liệu cache? Điều này có thể khiến ứng dụng tải chậm hơn trong lần sử dụng tiếp theo.',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => {
                        // Simulate cache clearing
                        setTimeout(() => {
                            Alert.alert('Thành công', 'Đã xóa bộ nhớ đệm thành công.');
                        }, 500);
                    },
                },
            ]
        );
    };

    const selectedLanguage = LANGUAGES.find(l => l.code === language);

    return (
        <View style={globalStyles.container}>
            <ScrollView
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
                        paddingBottom: SPACING.xl,
                        paddingHorizontal: SPACING.lg,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: SPACING.md,
                        }}
                    >
                        <TouchableOpacity
                            onPress={handleGoBack}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: SPACING.md,
                            }}
                        >
                            <Icon name="arrow_back" size={20} color="#ffffff" />
                        </TouchableOpacity>
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: '600',
                                color: '#ffffff',
                            }}
                        >
                            Cài đặt
                        </Text>
                    </View>
                    <Text
                        style={{
                            fontSize: 14,
                            color: 'rgba(255, 255, 255, 0.8)',
                        }}
                    >
                        Tùy chỉnh ứng dụng theo sở thích của bạn
                    </Text>
                </LinearGradient>

                {/* Settings Sections */}
                <View style={{ padding: SPACING.lg, marginTop: -SPACING.md }}>
                    {/* Notifications Section */}
                    <View
                        style={{
                            backgroundColor: COLORS.surface.dark,
                            borderRadius: BORDER_RADIUS.xl,
                            padding: SPACING.md,
                            borderWidth: 1,
                            borderColor: 'rgba(148, 163, 184, 0.1)',
                            marginBottom: SPACING.lg,
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
                            Thông báo
                        </Text>

                        {/* Push Notifications */}
                        <View
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
                                        backgroundColor: 'rgba(66, 69, 240, 0.1)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: SPACING.md,
                                    }}
                                >
                                    <Icon name="notifications" size={20} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: COLORS.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        Thông báo đẩy
                                    </Text>
                                    <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                                        Nhận thông báo về lịch làm việc và phê duyệt
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: COLORS.surface.darker, true: COLORS.primary }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    </View>

                    {/* Appearance Section */}
                    <View
                        style={{
                            backgroundColor: COLORS.surface.dark,
                            borderRadius: BORDER_RADIUS.xl,
                            padding: SPACING.md,
                            borderWidth: 1,
                            borderColor: 'rgba(148, 163, 184, 0.1)',
                            marginBottom: SPACING.lg,
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
                            Giao diện
                        </Text>

                        {/* Dark Mode */}
                        <View
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
                                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: SPACING.md,
                                    }}
                                >
                                    <Icon name="dark_mode" size={20} color={COLORS.text.secondary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: COLORS.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        Chế độ tối
                                    </Text>
                                    <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                                        Giao diện tối dễ nhìn vào ban đêm
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={darkMode}
                                onValueChange={setDarkMode}
                                trackColor={{ false: COLORS.surface.darker, true: COLORS.primary }}
                                thumbColor="#ffffff"
                            />
                        </View>

                        {/* Language */}
                        <TouchableOpacity
                            onPress={() => setShowLanguagePicker(true)}
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
                                        backgroundColor: 'rgba(34, 211, 238, 0.1)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: SPACING.md,
                                    }}
                                >
                                    <Icon name="language" size={20} color={COLORS.accent.cyan} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: COLORS.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        Ngôn ngữ
                                    </Text>
                                    <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                                        {selectedLanguage?.flag} {selectedLanguage?.name}
                                    </Text>
                                </View>
                            </View>
                            <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Security Section */}
                    <View
                        style={{
                            backgroundColor: COLORS.surface.dark,
                            borderRadius: BORDER_RADIUS.xl,
                            padding: SPACING.md,
                            borderWidth: 1,
                            borderColor: 'rgba(148, 163, 184, 0.1)',
                            marginBottom: SPACING.lg,
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
                            Bảo mật
                        </Text>

                        {/* Biometric */}
                        <View
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
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: SPACING.md,
                                    }}
                                >
                                    <Icon name="fingerprint" size={20} color={COLORS.accent.green} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: COLORS.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        Đăng nhập sinh trắc học
                                    </Text>
                                    <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                                        Sử dụng vân tay hoặc Face ID
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={biometricEnabled}
                                onValueChange={setBiometricEnabled}
                                trackColor={{ false: COLORS.surface.darker, true: COLORS.primary }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    </View>

                    {/* Storage & Data Section */}
                    <View
                        style={{
                            backgroundColor: COLORS.surface.dark,
                            borderRadius: BORDER_RADIUS.xl,
                            padding: SPACING.md,
                            borderWidth: 1,
                            borderColor: 'rgba(148, 163, 184, 0.1)',
                            marginBottom: SPACING.lg,
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
                            Dữ liệu & Lưu trữ
                        </Text>

                        {/* Clear Cache */}
                        <TouchableOpacity
                            onPress={handleClearCache}
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
                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: SPACING.md,
                                    }}
                                >
                                    <Icon name="delete_sweep" size={20} color={COLORS.accent.yellow} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: COLORS.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        Xóa bộ nhớ đệm
                                    </Text>
                                    <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                                        Kích thước: ~12 MB
                                    </Text>
                                </View>
                            </View>
                            <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* About Section */}
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
                            Thông tin ứng dụng
                        </Text>

                        {/* Version */}
                        <View
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
                                    <Icon name="info" size={20} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: COLORS.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        Phiên bản
                                    </Text>
                                    <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                                        1.0.0 (Build 2026.01.12)
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Terms */}
                        <TouchableOpacity
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
                                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: SPACING.md,
                                    }}
                                >
                                    <Icon name="description" size={20} color={COLORS.text.secondary} />
                                </View>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color: COLORS.text.primary,
                                        fontWeight: '500',
                                    }}
                                >
                                    Điều khoản sử dụng
                                </Text>
                            </View>
                            <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
                        </TouchableOpacity>

                        {/* Privacy */}
                        <TouchableOpacity
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
                                    <Icon name="privacy_tip" size={20} color={COLORS.text.secondary} />
                                </View>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color: COLORS.text.primary,
                                        fontWeight: '500',
                                    }}
                                >
                                    Chính sách bảo mật
                                </Text>
                            </View>
                            <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Language Picker Modal */}
            <Modal
                visible={showLanguagePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLanguagePicker(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'flex-end',
                    }}
                    activeOpacity={1}
                    onPress={() => setShowLanguagePicker(false)}
                >
                    <View
                        style={{
                            backgroundColor: COLORS.surface.dark,
                            borderTopLeftRadius: BORDER_RADIUS.xl,
                            borderTopRightRadius: BORDER_RADIUS.xl,
                            padding: SPACING.lg,
                        }}
                        onStartShouldSetResponder={() => true}
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
                                Chọn ngôn ngữ
                            </Text>
                            <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                                <Icon name="close" size={24} color={COLORS.text.primary} />
                            </TouchableOpacity>
                        </View>

                        {LANGUAGES.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => {
                                    setLanguage(lang.code);
                                    setShowLanguagePicker(false);
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingVertical: SPACING.md,
                                    borderBottomWidth: 1,
                                    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 24, marginRight: SPACING.md }}>{lang.flag}</Text>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: COLORS.text.primary,
                                            fontWeight: language === lang.code ? '600' : '400',
                                        }}
                                    >
                                        {lang.name}
                                    </Text>
                                </View>
                                {language === lang.code && (
                                    <Icon name="check" size={20} color={COLORS.accent.green} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
