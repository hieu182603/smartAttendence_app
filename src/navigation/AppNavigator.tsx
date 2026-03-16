import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { UserRole } from '../types';
import { CustomBottomTabBar } from '../components/BottomNav';
import { CustomDrawerContent } from '../components/Sidebar';
import { ManagerBottomTabBar } from '../components/ManagerBottomNav';
import { AdminBottomTabBar } from '../components/AdminBottomNav';

// Import Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DashboardScreen from '../screens/employee/DashboardScreen';
import ScheduleScreen from '../screens/employee/ScheduleScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AttendanceHistoryScreen from '../screens/employee/AttendanceHistoryScreen';
import AttendanceScreen from '../screens/employee/AttendanceScreen';

import RequestsScreen from '../screens/employee/RequestsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Manager Screens
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import ManagerTeamScreen from '../screens/manager/ManagerTeamScreen';
import TeamReportsScreen from '../screens/manager/TeamReportsScreen';
import ManagerApprovalsScreen from '../screens/manager/ManagerApprovalsScreen';
import ManagerScheduleScreen from '../screens/manager/ManagerScheduleScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminAuditScreen from '../screens/admin/AdminAuditScreen';
import AdminDepartmentsScreen from '../screens/admin/AdminDepartmentsScreen';
import AdminPositionsScreen from '../screens/admin/AdminPositionsScreen';

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  EmployeeTabs: undefined;
  ManagerDrawer: undefined;
  AdminTabs: undefined;
  AttendanceHistory: undefined;
  Attendance: { mode: 'check-in' | 'check-out'; reason?: string } | undefined;
  AdminDepartments: undefined;
  AdminPositions: undefined;
  Notifications: undefined;
};

export type EmployeeTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Requests: { openCreateModal?: boolean } | undefined;
  Leaves: { openCreateModal?: boolean } | undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};
export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminReports: undefined;
  AdminSettings: undefined;
  AdminAudit: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};
export type ManagerTabParamList = {
  ManagerDashboard: undefined;
  ManagerTeam: undefined;
  ManagerApprovals: undefined;
  ManagerSchedule: undefined;
  TeamReports: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<EmployeeTabParamList>();
const ManagerTab = createBottomTabNavigator<ManagerTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();
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
      <Tab.Screen name="Requests" component={RequestsScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Leaves" component={RequestsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

// Manager Tab Navigator
function ManagerTabNavigator() {
  return (
    <ManagerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: 'none', // Hide default tab bar, we'll use custom one
        },
      }}
      tabBar={(props) => <ManagerBottomTabBar {...props} />}
    >
      <ManagerTab.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
      <ManagerTab.Screen name="ManagerTeam" component={ManagerTeamScreen} />
      <ManagerTab.Screen name="ManagerApprovals" component={ManagerApprovalsScreen} options={{ tabBarButton: () => null }} />
      <ManagerTab.Screen name="ManagerSchedule" component={ManagerScheduleScreen} />
      <ManagerTab.Screen name="TeamReports" component={TeamReportsScreen} options={{ tabBarButton: () => null }} />
      <ManagerTab.Screen name="Profile" component={ProfileScreen} />
      <ManagerTab.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ tabBarButton: () => null }} />
      <ManagerTab.Screen name="Settings" component={SettingsScreen} options={{ tabBarButton: () => null }} />
    </ManagerTab.Navigator>
  );
}

// Admin Tab Navigator
function AdminTabNavigator() {
  return (
    <AdminTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: 'none', // Hide default tab bar, we'll use custom one
        },
      }}
      tabBar={(props) => <AdminBottomTabBar {...props} />}
    >
      <AdminTab.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <AdminTab.Screen name="AdminUsers" component={AdminUsersScreen} />
      <AdminTab.Screen name="AdminReports" component={AdminReportsScreen} />
      <AdminTab.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <AdminTab.Screen name="AdminAudit" component={AdminAuditScreen} options={{ tabBarButton: () => null }} />
      <AdminTab.Screen name="Profile" component={ProfileScreen} />
      <AdminTab.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ tabBarButton: () => null }} />
      <AdminTab.Screen name="Settings" component={SettingsScreen} options={{ tabBarButton: () => null }} />
    </AdminTab.Navigator>
  );
}

export default function AppNavigator({ userRole, isLoading }: AppNavigatorProps) {
  const navigationRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!isLoading && userRole && navigationRef.current) {
      const routeName =
        userRole === UserRole.Employee ? 'EmployeeTabs' :
          userRole === UserRole.Manager ? 'ManagerDrawer' :
            userRole === UserRole.Admin ? 'AdminTabs' :
              userRole === UserRole.SuperAdmin ? 'AdminTabs' :
                userRole === UserRole.HRManager ? 'AdminTabs' :
                  userRole === UserRole.Supervisor ? 'ManagerDrawer' :
                    userRole === UserRole.Trial ? 'EmployeeTabs' :
                      'Login';

      navigationRef.current.reset({
        index: 0,
        routes: [{ name: routeName }],
      });
    } else if (!isLoading && !userRole && navigationRef.current) {
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
      case UserRole.Trial:
        return 'EmployeeTabs';
      case UserRole.Manager:
      case UserRole.Supervisor:
        return 'ManagerDrawer';
      case UserRole.Admin:
      case UserRole.SuperAdmin:
      case UserRole.HRManager:
        return 'AdminTabs';
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
        <Stack.Screen name="ManagerDrawer" component={ManagerTabNavigator} />
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
        <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="AdminDepartments" component={AdminDepartmentsScreen} />
        <Stack.Screen name="AdminPositions" component={AdminPositionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
