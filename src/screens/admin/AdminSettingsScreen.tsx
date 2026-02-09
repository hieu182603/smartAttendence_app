import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminSettingsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const menuItems = [
    {
      id: 'departments',
      title: 'Quản lý Phòng ban',
      subtitle: 'Thêm, sửa, xóa các phòng ban trong công ty',
      icon: 'business',
      color: COLORS.accent.purple,
      onPress: () => navigation.navigate('AdminDepartments' as any),
    },
    {
      id: 'positions',
      title: 'Quản lý Chức vụ',
      subtitle: 'Thiết lập các vị trí công việc (Giám đốc, NV...)',
      icon: 'badge',
      color: COLORS.accent.cyan,
      onPress: () => navigation.navigate('AdminPositions' as any),
    },
    {
      id: 'shifts',
      title: 'Cấu hình Ca làm việc',
      subtitle: 'Thiết lập giờ vào/ra, quy định đi muộn',
      icon: 'schedule',
      color: COLORS.accent.yellow,
      onPress: () => alert('Tính năng đang phát triển'),
    },
    {
      id: 'holidays',
      title: 'Ngày nghỉ lễ',
      subtitle: 'Danh sách các ngày nghỉ lễ trong năm',
      icon: 'event',
      color: COLORS.accent.red,
      onPress: () => alert('Tính năng đang phát triển'),
    },
  ];

  return (
    <ScrollView style={globalStyles.container}>
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
          marginBottom: SPACING.lg,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: SPACING.xs }}>
          Cấu hình Hệ thống
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
          Thiết lập các thông số vận hành cho ứng dụng
        </Text>
      </LinearGradient>

      <View style={{ padding: SPACING.md }}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              borderRadius: BORDER_RADIUS.lg,
              padding: SPACING.lg,
              marginBottom: SPACING.md,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
              ...SHADOWS.md,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${item.color}20`,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.md,
              }}
            >
              <Icon name={item.icon} size={24} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: SPACING.xs / 2 }}>
                {item.title}
              </Text>
              <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                {item.subtitle}
              </Text>
            </View>
            <Icon name="chevron_right" size={24} color={COLORS.text.secondary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
