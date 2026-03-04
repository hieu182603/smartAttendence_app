import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AdminDrawerParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { useAdminStats } from '../../hooks/useAdminQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/queryKeys';

type AdminDashboardScreenNavigationProp = DrawerNavigationProp<AdminDrawerParamList, 'AdminDashboard'>;

interface AdminDashboardScreenProps {
  navigation: AdminDashboardScreenNavigationProp;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  uptime: string;
  serverStatus: string;
  cpuUsage: string;
  memoryUsage: string;
  storageUsage: string;
}

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // TanStack Query hook
  const { data: statsData, isLoading } = useAdminStats();

  // Derive stats with fallback defaults
  const stats = useMemo<DashboardStats>(() => {
    if (statsData) return statsData as DashboardStats;
    return {
      totalUsers: 0,
      activeUsers: 0,
      uptime: '99.9%',
      serverStatus: 'Healthy',
      cpuUsage: '0%',
      memoryUsage: '0%',
      storageUsage: '0%',
    };
  }, [statsData]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() }).finally(() => setRefreshing(false));
  };

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return (
    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
      }
    >
      {/* Header Gradient - Admin Purple/Indigo */}
      <LinearGradient
        colors={['#4f46e5', '#9333ea']}
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
        {/* Header with Menu */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.xl,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.md,
              }}
            >
              <Icon name="admin_panel_settings" size={20} color="#ffffff" />
            </TouchableOpacity>
            <View>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                Quản trị hệ thống
              </Text>
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                Administrator
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="notifications" size={20} color="#ffffff" />
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
            Hệ thống đang hoạt động
          </Text>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg }}>
        {/* System Health Card */}
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
          {isLoading && !refreshing ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: SPACING.lg,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'rgba(11, 218, 104, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: SPACING.md,
                    position: 'relative',
                  }}
                >
                  <Icon name="dns" size={24} color={COLORS.accent.green} />
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: COLORS.accent.green,
                      borderWidth: 2,
                      borderColor: COLORS.surface.dark,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: SPACING.xs / 2,
                    }}
                  >
                    {stats?.uptime || '99.9%'} Uptime
                  </Text>
                  <Text
                    style={{
                      color: COLORS.text.secondary,
                      fontSize: 14,
                    }}
                  >
                    Server status: <Text style={{ color: COLORS.accent.green }}>{stats?.serverStatus || 'Healthy'}</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AdminAudit')}
                  style={{
                    backgroundColor: 'rgba(66, 69, 240, 0.1)',
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    borderRadius: BORDER_RADIUS.md,
                    borderWidth: 1,
                    borderColor: 'rgba(66, 69, 240, 0.2)',
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    Logs
                  </Text>
                </TouchableOpacity>
              </View>

              {/* System Stats */}
              <View
                style={{
                  flexDirection: 'row',
                  paddingTop: SPACING.md,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    style={{
                      color: COLORS.text.secondary,
                      fontSize: 12,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    CPU
                  </Text>
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                  >
                    {stats?.cpuUsage || '--'}
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    marginHorizontal: SPACING.md,
                  }}
                />
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    style={{
                      color: COLORS.text.secondary,
                      fontSize: 12,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    Memory
                  </Text>
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                  >
                    {stats?.memoryUsage || '--'}
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    marginHorizontal: SPACING.md,
                  }}
                />
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    style={{
                      color: COLORS.text.secondary,
                      fontSize: 12,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    Storage
                  </Text>
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                  >
                    {stats?.storageUsage || '--'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* User Stats Grid */}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: SPACING.lg,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminUsers')}
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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: SPACING.xs,
              }}
            >
              <Icon name="group" size={20} color={COLORS.primary} />
              <Icon name="arrow_forward" size={16} color="rgba(255, 255, 255, 0.2)" />
            </View>
            <Text
              style={{
                color: COLORS.text.secondary,
                fontSize: 12,
                marginBottom: SPACING.xs,
              }}
            >
              Tổng người dùng
            </Text>
            <Text
              style={{
                color: '#ffffff',
                fontSize: 24,
                fontWeight: 'bold',
              }}
            >
              {stats?.totalUsers || '--'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('AdminReports')}
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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: SPACING.xs,
              }}
            >
              <Icon name="analytics" size={20} color={COLORS.accent.cyan} />
              <Icon name="arrow_forward" size={16} color="rgba(255, 255, 255, 0.2)" />
            </View>
            <Text
              style={{
                color: COLORS.text.secondary,
                fontSize: 12,
                marginBottom: SPACING.xs,
              }}
            >
              Phân tích
            </Text>
            <Text
              style={{
                color: '#ffffff',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              Báo cáo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
