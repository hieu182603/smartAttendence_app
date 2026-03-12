import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon } from './Icon';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/styles';
import { useTranslation } from '../i18n';

interface TabItem {
    name: string;
    icon: string;
    label: string;
}

const ADMIN_COLORS = {
    primary: '#4F46E5', // Indigo 600
    primaryDark: '#3730A3', // Indigo 800
    accent: '#818CF8', // Indigo 400
};

export function AdminBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { t } = useTranslation();

    const adminItems: TabItem[] = [
        { name: 'AdminDashboard', icon: 'grid_view', label: t.nav.home || 'Home' },
        { name: 'AdminUsers', icon: 'people', label: 'Users' },
        { name: 'AdminReports', icon: 'analytics', label: 'Reports' },
        { name: 'AdminAudit', icon: 'security', label: 'Audit' },
        { name: 'Profile', icon: 'person', label: t.nav.profile || 'Profile' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                <View style={styles.tabsContainer}>
                    {adminItems.map((item, index) => {
                        const route = state.routes.find(r => r.name === item.name);
                        if (!route) return null;

                        const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name as any);
                            }
                        };

                        // Center button (Reports) as a special floating style
                        if (index === 2) {
                            return (
                                <View key={item.name} style={styles.floatingButtonContainer}>
                                    <TouchableOpacity
                                        onPress={onPress}
                                        style={styles.floatingButton}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={isFocused ? [ADMIN_COLORS.accent, ADMIN_COLORS.primary] : [ADMIN_COLORS.primary, ADMIN_COLORS.primaryDark]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.floatingButtonGradient}
                                        >
                                            <Icon name={item.icon} size={30} color="#ffffff" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <Text style={[styles.floatingLabel, isFocused && styles.floatingLabelActive]}>
                                        {item.label}
                                    </Text>
                                    {isFocused && <View style={styles.activeDotFloating} />}
                                </View>
                            );
                        }

                        return (
                            <Pressable
                                key={item.name}
                                onPress={onPress}
                                style={styles.tabItem}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    isFocused && styles.iconContainerActive
                                ]}>
                                    <Icon
                                        name={item.icon}
                                        size={24}
                                        color={isFocused ? ADMIN_COLORS.accent : 'rgba(255, 255, 255, 0.5)'}
                                    />
                                    {isFocused && <View style={styles.activeDot} />}
                                </View>
                                <Text style={[
                                    styles.tabLabel,
                                    isFocused && styles.tabLabelActive
                                ]}>
                                    {item.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 50,
    },
    tabBar: {
        width: '100%',
        backgroundColor: 'rgba(10, 10, 25, 0.94)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg + 4,
        paddingHorizontal: SPACING.sm,
        ...SHADOWS.lg,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.xs / 2,
        alignItems: 'center',
        position: 'relative',
    },
    iconContainerActive: {
        // backgroundColor: 'rgba(79, 70, 229, 0.08)',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    tabLabelActive: {
        color: ADMIN_COLORS.accent,
        fontWeight: '700',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: ADMIN_COLORS.accent,
        position: 'absolute',
        bottom: -6,
        shadowColor: ADMIN_COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 4,
    },
    floatingButtonContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: -35,
        zIndex: 10,
    },
    floatingButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        padding: 4,
        backgroundColor: 'rgba(10, 10, 25, 1)',
        ...SHADOWS.lg,
    },
    floatingButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: ADMIN_COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    floatingLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: SPACING.xs,
    },
    floatingLabelActive: {
        color: ADMIN_COLORS.accent,
        fontWeight: '800',
    },
    activeDotFloating: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: ADMIN_COLORS.accent,
        marginTop: 4,
        shadowColor: ADMIN_COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 4,
    }
});
