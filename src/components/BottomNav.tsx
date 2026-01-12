import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon } from './Icon';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/styles';

interface TabItem {
  name: string;
  icon: string;
  label: string;
}

export function CustomBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const employeeItems: TabItem[] = [
    { name: 'Home', icon: 'home', label: 'Home' },
    { name: 'Schedule', icon: 'calendar_month', label: 'Schedule' },
    { name: 'Requests', icon: 'assignment', label: 'Requests' },
    { name: 'Notifications', icon: 'assignment', label: 'Ngày nghỉ' },
    { name: 'Profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <View style={styles.tabsContainer}>
          {employeeItems.map((item, index) => {
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

            // Special styling for the middle button (Requests) - floating button
            // This button opens create leave request modal
            if (index === 2) {
              const handleCreateLeave = () => {
                // Navigate to Notifications tab (which shows RequestsScreen) and open modal
                navigation.navigate('Notifications' as any, { openCreateModal: true } as any);
                // Also navigate to Requests tab as fallback
                navigation.navigate('Requests' as any, { openCreateModal: true } as any);
              };

              return (
                <View key={item.name} style={styles.floatingButtonContainer}>
                  <TouchableOpacity
                    onPress={handleCreateLeave}
                    style={styles.floatingButton}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[COLORS.primaryDark, COLORS.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.floatingButtonGradient}
                    >
                      <Icon name="add" size={28} color="#ffffff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              );
            }

            // Add specific margins for certain tabs
            const tabItemStyle: any[] = [styles.tabItem];
            if (item.name === 'Notifications') {
              // Tăng margin trái cho tab "Ngày nghỉ"
              tabItemStyle.push({ marginLeft: SPACING.md });
            }
            if (item.name === 'Schedule') {
              // Tăng margin phải cho tab "Schedule"
              tabItemStyle.push({ marginRight: SPACING.md });
            }

            return (
              <TouchableOpacity
                key={item.name}
                onPress={onPress}
                style={tabItemStyle}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.iconContainer,
                  isFocused && styles.iconContainerActive
                ]}>
                  <Icon
                    name={item.icon}
                    size={24}
                    color={isFocused ? '#ffffff' : COLORS.text.secondary}
                  />
                </View>
                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(21, 21, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg + 6,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.lg,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    position: 'relative',
    paddingHorizontal: SPACING.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 56,
    paddingTop: SPACING.xs,
    marginHorizontal: SPACING.sm,
  },
  iconContainer: {
    padding: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xs,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  floatingButtonContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -28,
    bottom: 20,
    zIndex: 10,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    ...SHADOWS.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 4,
    borderColor: COLORS.background.dark,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

