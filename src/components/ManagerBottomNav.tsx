import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon } from './Icon';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/styles';
import { useTranslation } from '../i18n';
import { useManagerApprovals } from '../hooks/useManagerQueries';

interface TabItem {
    name: string;
    icon: string;
    label: string;
}

export function ManagerBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { t } = useTranslation();

    // Get pending count for badge
    const { data: approvalsData } = useManagerApprovals();
    const pendingCount = approvalsData?.filter((a: any) => a.status === 'pending').length || 0;

    const managerItems: TabItem[] = [
        { name: 'ManagerDashboard', icon: 'dashboard', label: 'Tổng quan' },
        { name: 'ManagerTeam', icon: 'groups', label: 'Team' },
        { name: 'ManagerApprovals', icon: 'fact_check', label: 'Duyệt đơn' },
        { name: 'ManagerSchedule', icon: 'calendar_month', label: 'Lịch' },
        { name: 'Profile', icon: 'person', label: t.nav.profile },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                <View style={styles.tabsContainer}>
                    {managerItems.map((item, index) => {
                        const route = state.routes.find(r => r.name === item.name);
                        if (!route) return null;

                        const { options } = descriptors[route.key];
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

                        // Floating action button specifically for Manager Approvals
                        if (index === 2) {
                            return (
                                <View key={item.name} style={styles.floatingButtonContainer}>
                                    <TouchableOpacity
                                        onPress={onPress}
                                        style={styles.floatingButton}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={isFocused ? ['#FF9800', '#F57C00'] : ['#4245F0', '#2E32C9']} // Orange if active, primary otherwise
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.floatingButtonGradient}
                                        >
                                            <Icon name="fact_check" size={26} color="#ffffff" />
                                        </LinearGradient>
                                        {pendingCount > 0 && (
                                            <View style={styles.badgeTopRight}>
                                                <Text style={styles.badgeText}>{pendingCount}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <Text style={[styles.floatingLabel, isFocused && styles.floatingLabelActive]}>
                                        Duyệt đơn
                                    </Text>
                                </View>
                            );
                        }

                        return (
                            <Pressable
                                key={item.name}
                                onPress={onPress}
                                style={styles.tabItem}
                                android_ripple={null}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    isFocused && styles.iconContainerActive
                                ]}>
                                    <Icon
                                        name={item.icon}
                                        size={24}
                                        color={isFocused ? '#FF9800' : COLORS.text.secondary} // Use Orange theme for manager active tab
                                    />
                                    {item.name === 'ManagerApprovals' && pendingCount > 0 && !isFocused && (
                                        <View style={styles.badgeSmall}>
                                            <Text style={styles.badgeTextSmall}>{pendingCount}</Text>
                                        </View>
                                    )}
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
        maxWidth: 428,
        backgroundColor: 'rgba(21, 21, 42, 0.95)', // Match current theme dark background
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.lg + 6,
        paddingHorizontal: SPACING.sm,
        ...SHADOWS.lg,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        position: 'relative',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: SPACING.xs,
    },
    iconContainer: {
        padding: SPACING.xs + 2,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xs,
        position: 'relative',
    },
    iconContainerActive: {
        backgroundColor: 'transparent',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: COLORS.text.secondary,
        marginTop: SPACING.xs / 2,
    },
    tabLabelActive: {
        color: '#FF9800',
    },
    floatingButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: -32,
        zIndex: 10,
    },
    floatingButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        ...SHADOWS.lg,
        shadowColor: '#FF9800', // Orange shadow for manager
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 4,
        borderColor: COLORS.background.dark, // Match the app background so it looks cut out
        position: 'relative',
    },
    floatingButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: COLORS.text.secondary,
        marginTop: SPACING.xs + 2,
    },
    floatingLabelActive: {
        color: '#FF9800',
    },
    badgeTopRight: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: COLORS.accent.red,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.background.dark,
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    badgeSmall: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: COLORS.accent.red,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    badgeTextSmall: {
        display: 'none',
    }
});
