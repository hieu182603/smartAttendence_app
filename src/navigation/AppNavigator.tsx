import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { UserRole } from '../types';
import { CustomBottomTabBar } from '../components/BottomNav';
import { CustomDrawerContent } from '../components/Sidebar';

// Import Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DashboardScreen from '../screens/employee/DashboardScreen';
import ScheduleScreen from '../screens/employee/ScheduleScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

import RequestsScreen from '../screens/employee/RequestsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Manager Screens
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import ManagerTeamScreen from '../screens/manager/ManagerTeamScreen';
import ManagerApprovalsScreen from '../screens/manager/ManagerApprovalsScreen';
import ManagerScheduleScreen from '../screens/manager/ManagerScheduleScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminAuditScreen from '../screens/admin/AdminAuditScreen';

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  EmployeeTabs: undefined;
  ManagerDrawer: undefined;
  AdminDrawer: undefined;
};

export type EmployeeTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Requests: { openCreateModal?: boolean } | undefined;
  Notifications: { openCreateModal?: boolean } | undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};

export type ManagerDrawerParamList = {
  ManagerDashboard: undefined;
  ManagerTeam: undefined;
  ManagerApprovals: undefined;
  ManagerSchedule: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};

export type AdminDrawerParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminReports: undefined;
  AdminSettings: undefined;
  AdminAudit: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<EmployeeTabParamList>();
const Drawer = createDrawerNavigator();

interface AppNavigatorProps {
  userRole?: UserRole;
  isLoading?: boolean;
}

// Employee Bottom Tab Navigator
function EmployeeTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: 'none', // Hide default tab bar, we'll use custom one
        },
      }}
      tabBar={(props) => <CustomBottomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

// Manager Drawer Navigator
function ManagerDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#15152a',
          width: 280,
        },
        overlayColor: 'rgba(0, 0, 0, 0.6)',
        drawerType: 'front',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="ManagerDashboard"
        component={ManagerDashboardScreen}
        options={{ drawerLabel: 'Dashboard' }}
      />
      <Drawer.Screen
        name="ManagerTeam"
        component={ManagerTeamScreen}
        options={{ drawerLabel: 'Team' }}
      />
      <Drawer.Screen
        name="ManagerApprovals"
        component={ManagerApprovalsScreen}
        options={{ drawerLabel: 'Approvals' }}
      />
      <Drawer.Screen
        name="ManagerSchedule"
        component={ManagerScheduleScreen}
        options={{ drawerLabel: 'Schedule' }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ drawerLabel: 'Profile' }}
      />
      <Drawer.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ drawerLabel: 'Đổi mật khẩu', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ drawerLabel: 'Cài đặt' }}
      />
    </Drawer.Navigator>
  );
}

// Admin Drawer Navigator
function AdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#15152a',
          width: 280,
        },
        overlayColor: 'rgba(0, 0, 0, 0.6)',
        drawerType: 'front',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ drawerLabel: 'Dashboard' }}
      />
      <Drawer.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{ drawerLabel: 'Users' }}
      />
      <Drawer.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{ drawerLabel: 'Reports' }}
      />
      <Drawer.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        options={{ drawerLabel: 'Settings' }}
      />
      <Drawer.Screen
        name="AdminAudit"
        component={AdminAuditScreen}
        options={{ drawerLabel: 'Audit' }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ drawerLabel: 'Profile' }}
      />
      <Drawer.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ drawerLabel: 'Đổi mật khẩu', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ drawerLabel: 'Cài đặt' }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator({ userRole, isLoading }: AppNavigatorProps) {
  // Force re-render when userRole changes
  const navigationRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!isLoading && userRole && navigationRef.current) {
      // Reset navigation stack when user logs in
      const routeName =
        userRole === UserRole.Employee ? 'EmployeeTabs' :
          userRole === UserRole.Manager ? 'ManagerDrawer' :
            userRole === UserRole.Admin ? 'AdminDrawer' :
              'Login';

      navigationRef.current.reset({
        index: 0,
        routes: [{ name: routeName }],
      });
    } else if (!isLoading && !userRole && navigationRef.current) {
      // Reset to Login when user logs out
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [userRole, isLoading]);

  const getInitialRoute = () => {
    if (isLoading) return 'Splash';
    if (!userRole) return 'Login';

    switch (userRole) {
      case UserRole.Employee:
        return 'EmployeeTabs';
      case UserRole.Manager:
        return 'ManagerDrawer';
      case UserRole.Admin:
        return 'AdminDrawer';
      default:
        return 'Login';
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="EmployeeTabs" component={EmployeeTabNavigator} />
        <Stack.Screen name="ManagerDrawer" component={ManagerDrawerNavigator} />
        <Stack.Screen name="AdminDrawer" component={AdminDrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

