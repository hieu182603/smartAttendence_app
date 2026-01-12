import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { EmployeeTabParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';

type EmployeeHomeScreenNavigationProp = BottomTabNavigationProp<EmployeeTabParamList, 'Home'>;

interface EmployeeHomeScreenProps {
  navigation: EmployeeHomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function EmployeeHomeScreen({ navigation }: EmployeeHomeScreenProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning,' : hour < 18 ? 'Good Afternoon,' : 'Good Evening,';

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  // Mock check-in status (Office hours 08:30 - 17:30)
  const isWorkingHours = (hour > 8 || (hour === 8 && now.getMinutes() >= 30)) &&
    (hour < 17 || (hour === 17 && now.getMinutes() < 30));
  const isCheckedIn = isWorkingHours;

  const navigateToSchedule = () => {
    navigation.navigate('Schedule');
  };

  const navigateToRequests = () => {
    navigation.navigate('Requests');
  };

  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };

  return (
    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent.cyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: SPACING.xxl * 2,
          paddingBottom: SPACING.xl,
          paddingHorizontal: SPACING.xl,
          borderBottomLeftRadius: BORDER_RADIUS.xxl,
          borderBottomRightRadius: BORDER_RADIUS.xxl,
          marginBottom: -SPACING.lg,
        }}
      >
        {/* Header with Profile */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.xl,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ position: 'relative', marginRight: SPACING.md }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>A</Text>
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: COLORS.accent.green,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                }}
              />
            </View>
            <View>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                {greeting}
              </Text>
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                Alex Johnson
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={navigateToNotifications}
            style={{
              position: 'relative',
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="notifications" size={20} color="#ffffff" />
            <View
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.accent.red,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Clock Display */}
        <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: '#ffffff',
                marginRight: SPACING.xs,
              }}
            >
              {hours}:{minutes}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {seconds}
            </Text>
          </View>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 14,
              fontWeight: '500',
              marginTop: SPACING.xs,
            }}
          >
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg }}>
        {/* Status Card */}
        <View
          style={{
            backgroundColor: 'rgba(30, 31, 58, 0.6)',
            borderRadius: BORDER_RADIUS.xl,
            padding: SPACING.lg,
            marginBottom: SPACING.lg,
            ...SHADOWS.lg,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Status Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: SPACING.md,
              marginBottom: SPACING.md,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isCheckedIn ? COLORS.accent.green : COLORS.accent.red,
                  marginRight: SPACING.sm,
                }}
              />
              <Text
                style={{
                  color: isCheckedIn ? COLORS.accent.green : COLORS.accent.red,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                {isCheckedIn ? 'Checked In' : 'Checked Out'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                paddingHorizontal: SPACING.sm,
                paddingVertical: SPACING.xs,
                borderRadius: BORDER_RADIUS.full,
              }}
            >
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 10,
                  fontWeight: '500',
                  textTransform: 'uppercase',
                }}
              >
                Office
              </Text>
            </View>
          </View>

          {/* Check-in/out Times */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.lg,
            }}
          >
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 10,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: SPACING.xs,
                }}
              >
                Check In
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="login" size={16} color={COLORS.primary} />
                <Text
                  style={{
                    marginLeft: SPACING.sm,
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  08:30 <Text style={{ fontSize: 10, fontWeight: 'normal' }}>AM</Text>
                </Text>
              </View>
            </View>

            <View style={{ width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 10,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: SPACING.xs,
                }}
              >
                Check Out
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    color: isCheckedIn && hour > 12 ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  {isCheckedIn && hour > 12 ? '17:30' : '--:--'}
                </Text>
                <Icon
                  name="logout"
                  size={16}
                  color={isCheckedIn && hour > 12 ? COLORS.accent.red : 'rgba(255, 255, 255, 0.3)'}
                  style={{ marginLeft: SPACING.sm }}
                />
              </View>
            </View>
          </View>

          {/* Location and Hours */}
          <View
            style={{
              backgroundColor: 'rgba(30, 31, 58, 0.4)',
              borderRadius: BORDER_RADIUS.lg,
              padding: SPACING.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Icon name="map" size={16} color={COLORS.accent.cyan} />
              </View>
              <View>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: 10,
                    marginBottom: SPACING.xs,
                  }}
                >
                  Location
                </Text>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: '500',
                  }}
                >
                  Main Office, Floor 3
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 10,
                }}
              >
                Total Hrs
              </Text>
              <Text
                style={{
                  color: COLORS.accent.cyan,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                {isCheckedIn ? '4h 15m' : '0h 00m'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: SPACING.lg,
          }}
        >
          <TouchableOpacity
            onPress={navigateToSchedule}
            style={{
              flex: 1,
              backgroundColor: 'rgba(30, 31, 58, 0.6)',
              borderRadius: BORDER_RADIUS.lg,
              padding: SPACING.lg,
              marginRight: SPACING.sm,
              ...SHADOWS.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <Icon name="history_toggle_off" size={20} color={COLORS.accent.red} />
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: 10,
                marginTop: SPACING.xs,
                marginBottom: SPACING.xs,
              }}
            >
              Late / Early
            </Text>
            <Text
              style={{
                color: '#ffffff',
                fontSize: 20,
                fontWeight: 'bold',
              }}
            >
              1
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={navigateToRequests}
            style={{
              flex: 1,
              backgroundColor: 'rgba(30, 31, 58, 0.6)',
              borderRadius: BORDER_RADIUS.lg,
              padding: SPACING.lg,
              ...SHADOWS.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <Icon name="timelapse" size={20} color={COLORS.accent.purple} />
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: 10,
                marginTop: SPACING.xs,
                marginBottom: SPACING.xs,
              }}
            >
              Overtime
            </Text>
            <Text
              style={{
                color: '#ffffff',
                fontSize: 20,
                fontWeight: 'bold',
              }}
            >
              2.5h
            </Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Shifts */}
        <View style={{ marginBottom: SPACING.xl }}>
          <Text
            style={{
              color: '#ffffff',
              fontSize: 18,
              fontWeight: '600',
              marginBottom: SPACING.md,
            }}
          >
            Upcoming Shifts
          </Text>
          <TouchableOpacity
            onPress={navigateToSchedule}
            style={{
              backgroundColor: 'rgba(30, 31, 58, 0.6)',
              borderRadius: BORDER_RADIUS.lg,
              padding: SPACING.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderLeftWidth: 4,
              borderLeftColor: COLORS.primary,
              ...SHADOWS.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(66, 69, 240, 0.2)',
                paddingHorizontal: SPACING.sm,
                paddingVertical: SPACING.xs,
                borderRadius: BORDER_RADIUS.sm,
              }}
            >
              <Text
                style={{
                  color: COLORS.primary,
                  fontSize: 8,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                IN 14H
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: 'rgba(66, 69, 240, 0.2)',
                  borderRadius: BORDER_RADIUS.md,
                  padding: SPACING.sm,
                  alignItems: 'center',
                  minWidth: 50,
                  marginRight: SPACING.md,
                }}
              >
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: 8,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  Oct
                </Text>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  24
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: '500',
                    marginBottom: SPACING.xs,
                  }}
                >
                  Tomorrow
                </Text>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: 12,
                  }}
                >
                  09:00 - 18:00
                </Text>
              </View>
            </View>
            <Icon name="chevron_right" size={20} color="rgba(255, 255, 255, 0.3)" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

