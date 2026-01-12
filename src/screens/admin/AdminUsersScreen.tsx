import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AdminDrawerParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { UserRole } from '../../types';

type AdminUsersScreenNavigationProp = DrawerNavigationProp<AdminDrawerParamList, 'AdminUsers'>;

interface AdminUsersScreenProps {
  navigation: AdminUsersScreenNavigationProp;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatar: string;
  lastActive: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@company.com',
    role: UserRole.Employee,
    status: 'active',
    avatar: 'AJ',
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah.c@company.com',
    role: UserRole.Manager,
    status: 'active',
    avatar: 'SC',
    lastActive: '5 minutes ago',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.b@company.com',
    role: UserRole.Employee,
    status: 'active',
    avatar: 'MB',
    lastActive: '1 day ago',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@company.com',
    role: UserRole.Employee,
    status: 'inactive',
    avatar: 'ED',
    lastActive: '3 days ago',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@company.com',
    role: UserRole.Manager,
    status: 'active',
    avatar: 'DW',
    lastActive: '30 minutes ago',
  },
];

export default function AdminUsersScreen({ navigation }: AdminUsersScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | UserRole>('all');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || user.role === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return COLORS.accent.red;
      case UserRole.Manager:
        return COLORS.primary;
      default:
        return COLORS.accent.cyan;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return 'Admin';
      case UserRole.Manager:
        return 'Manager';
      default:
        return 'Employee';
    }
  };

  return (
    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
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
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.lg,
          }}
        >
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
            <Icon name="menu" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text
            style={{
              color: '#ffffff',
              fontSize: 24,
              fontWeight: 'bold',
              flex: 1,
            }}
          >
            User Management
          </Text>
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
            <Icon name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: BORDER_RADIUS.lg,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            marginBottom: SPACING.md,
          }}
        >
          <Icon name="search" size={20} color="rgba(255, 255, 255, 0.7)" />
          <TextInput
            style={{
              flex: 1,
              color: '#ffffff',
              fontSize: 14,
              marginLeft: SPACING.sm,
              padding: 0,
            }}
            placeholder="Search users..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={18} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          {(['all', UserRole.Employee, UserRole.Manager, UserRole.Admin] as const).map((filter, index) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.xs,
                borderRadius: BORDER_RADIUS.md,
                backgroundColor:
                  selectedFilter === filter
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)',
                marginRight: index < 3 ? SPACING.sm : 0,
              }}
            >
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: selectedFilter === filter ? 'bold' : '500',
                }}
              >
                {filter === 'all' ? 'All' : getRoleLabel(filter)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* User List */}
      <View style={{ padding: SPACING.xl }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.md,
          }}
        >
          <Text
            style={{
              color: COLORS.text.secondary,
              fontSize: 14,
              fontWeight: '500',
            }}
          >
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          </Text>
        </View>

        {filteredUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={{
              backgroundColor: 'rgba(30, 31, 58, 0.6)',
              borderRadius: BORDER_RADIUS.lg,
              padding: SPACING.lg,
              marginBottom: SPACING.md,
              ...SHADOWS.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {/* Avatar */}
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: getRoleColor(user.role),
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}
                >
                  {user.avatar}
                </Text>
              </View>

              {/* User Info */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: SPACING.xs / 2,
                  }}
                >
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginRight: SPACING.sm,
                    }}
                  >
                    {user.name}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: SPACING.xs,
                      paddingVertical: 2,
                      borderRadius: BORDER_RADIUS.sm,
                      backgroundColor: `${getRoleColor(user.role)}20`,
                      borderWidth: 1,
                      borderColor: `${getRoleColor(user.role)}40`,
                    }}
                  >
                    <Text
                      style={{
                        color: getRoleColor(user.role),
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}
                    >
                      {getRoleLabel(user.role)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    color: COLORS.text.secondary,
                    fontSize: 12,
                    marginBottom: SPACING.xs / 2,
                  }}
                >
                  {user.email}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor:
                        user.status === 'active'
                          ? COLORS.accent.green
                          : COLORS.text.secondary,
                      marginRight: SPACING.xs,
                    }}
                  />
                  <Text
                    style={{
                      color: COLORS.text.secondary,
                      fontSize: 11,
                    }}
                  >
                    {user.status === 'active' ? 'Active' : 'Inactive'} • {user.lastActive}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={{
                  padding: SPACING.sm,
                }}
              >
                <Icon name="more_vert" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
