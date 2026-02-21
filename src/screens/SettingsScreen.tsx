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
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS, useTheme } from '../utils/styles';
import { useTranslation } from '../i18n';
import { Icon } from '../components/Icon';
import { usePreferences } from '../context/PreferencesContext';

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
    const theme = useTheme();
    const { t } = useTranslation();

    // Use global preferences
    const {
        isDarkMode, toggleDarkMode,
        notificationsEnabled, toggleNotifications,
        biometricEnabled, toggleBiometric,
        language, setLanguage
    } = usePreferences();

    const [showLanguagePicker, setShowLanguagePicker] = useState(false);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleClearCache = () => {
        Alert.alert(
            t.settings.clearCache,
            t.settings.clearCacheConfirm,
            [
                {
                    text: t.common.cancel,
                    style: 'cancel',
                },
                {
                    text: t.common.delete,
                    style: 'destructive',
                    onPress: () => {
                        // Simulate cache clearing
                        setTimeout(() => {
                            Alert.alert(t.settings.clearCacheSuccess, t.settings.clearCacheSuccessMsg);
                        }, 500);
                    },
                },
            ]
        );
    };

    const selectedLanguage = LANGUAGES.find(l => l.code === language);

    return (
        <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
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
                            {t.settings.title}
                        </Text>
                    </View>
                    <Text
                        style={{
                            fontSize: 14,
                            color: 'rgba(255, 255, 255, 0.8)',
                        }}
                    >
                        {t.settings.subtitle}
                    </Text>
                </LinearGradient>

                {/* Settings Sections */}
                <View style={{ padding: SPACING.lg, marginTop: -SPACING.md }}>
                    {/* Notifications Section */}
                    <View
                        style={{
                            backgroundColor: theme.surface,
                            borderRadius: BORDER_RADIUS.xl,
                            padding: SPACING.md,
                            borderWidth: 1,
                            borderColor: theme.cardBorder,
                            marginBottom: SPACING.lg,
                            ...SHADOWS.lg,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: theme.text.primary,
                                marginBottom: SPACING.md,
                            }}
                        >
                            {t.settings.notifications}
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
                                        {t.settings.pushNotifications}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: COLORS.text.secondary }}>
                                        {t.settings.pushNotificationsDesc}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={toggleNotifications}
                                trackColor={{ false: theme.surfaceDarker, true: COLORS.primary }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    </View>

                    {/* Appearance Section */}
                    <View
                        style={{
                            backgroundColor: theme.surface,
                            borderRadius: BORDER_RADIUS.xl,
                            padding: SPACING.md,
                            borderWidth: 1,
                            borderColor: theme.cardBorder,
                            marginBottom: SPACING.lg,
                            ...SHADOWS.lg,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: theme.text.primary,
                                marginBottom: SPACING.md,
                            }}
                        >
                            {t.settings.appearance}
                        </Text>

                        {/* Dark Mode */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingVertical: SPACING.sm,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.divider,
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
                                            color: theme.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        {t.settings.darkMode}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: theme.text.secondary }}>
                                        {t.settings.darkModeDesc}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleDarkMode}
                                trackColor={{ false: theme.surfaceDarker, true: COLORS.primary }}
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
                                            color: theme.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        {t.settings.language}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: theme.text.secondary }}>
                                        {selectedLanguage?.flag} {selectedLanguage?.name}
                                    </Text>
                                </View>
                            </View>
                            <Icon name="chevron_right" size={20} color={theme.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Security Section */}
                    <View
                        style={{
                            backgroundColor: theme.surface,
                            borderRadius: BORDER_RADIUS.xl,
                            padding: SPACING.md,
                            borderWidth: 1,
                            borderColor: theme.cardBorder,
                            marginBottom: SPACING.lg,
                            ...SHADOWS.lg,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: theme.text.primary,
                                marginBottom: SPACING.md,
                            }}
                        >
                            {t.settings.security}
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
                                            color: theme.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        {t.settings.biometric}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: theme.text.secondary }}>
                                        {t.settings.biometricDesc}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={biometricEnabled}
                                onValueChange={toggleBiometric}
                                trackColor={{ false: theme.surfaceDarker, true: COLORS.primary }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    </View>

                    {/* Storage & Data Section */}
                    <View
                        style={{
                            backgroundColor: theme.surface,
                            borderRadius: BORDER_RADIUS.xl,
                            padding: SPACING.md,
                            borderWidth: 1,
                            borderColor: theme.cardBorder,
                            marginBottom: SPACING.lg,
                            ...SHADOWS.lg,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: theme.text.primary,
                                marginBottom: SPACING.md,
                            }}
                        >
                            {t.settings.storage}
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
                                            color: theme.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        {t.settings.clearCache}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: theme.text.secondary }}>
                                        Kích thước: ~12 MB
                                    </Text>
                                </View>
                            </View>
                            <Icon name="chevron_right" size={20} color={theme.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* About Section */}
                    <View
                        style={{
                            backgroundColor: theme.surface,
                            borderRadius: BORDER_RADIUS.xl,
                            padding: SPACING.md,
                            borderWidth: 1,
                            borderColor: theme.cardBorder,
                            ...SHADOWS.lg,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: theme.text.primary,
                                marginBottom: SPACING.md,
                            }}
                        >
                            {t.settings.about}
                        </Text>

                        {/* Version */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingVertical: SPACING.sm,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.divider,
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
                                            color: theme.text.primary,
                                            fontWeight: '500',
                                            marginBottom: SPACING.xs / 2,
                                        }}
                                    >
                                        {t.settings.version}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: theme.text.secondary }}>
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
                                borderBottomColor: theme.divider,
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
                                        color: theme.text.primary,
                                        fontWeight: '500',
                                    }}
                                >
                                    {t.settings.terms}
                                </Text>
                            </View>
                            <Icon name="chevron_right" size={20} color={theme.text.secondary} />
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
                                        color: theme.text.primary,
                                        fontWeight: '500',
                                    }}
                                >
                                    {t.settings.privacy}
                                </Text>
                            </View>
                            <Icon name="chevron_right" size={20} color={theme.text.secondary} />
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
                            backgroundColor: theme.surface,
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
                                    color: theme.text.primary,
                                }}
                            >
                                {t.settings.selectLanguage}
                            </Text>
                            <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                                <Icon name="close" size={24} color={theme.text.primary} />
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
                                    borderBottomColor: theme.divider,
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
