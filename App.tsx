import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import { UserRole } from './src/types';
import { globalStyles } from './src/utils/styles';

// Auth Context - Matching web version
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  employeeId?: string;
  department?: string;
  position?: string;
  phone?: string;
}

export interface AuthContextType {
  userRole: UserRole | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo accounts matching web version
const DEMO_ACCOUNTS = [
  {
    id: 'emp-001',
    email: 'employee@demo.com',
    password: '123456',
    role: UserRole.Employee,
    name: 'Nguyễn Văn A',
  },
  {
    id: 'mgr-001',
    email: 'manager@demo.com',
    password: '123456',
    role: UserRole.Manager,
    name: 'Trần Thị B',
  },
  {
    id: 'adm-001',
    email: 'admin@demo.com',
    password: '123456',
    role: UserRole.Admin,
    name: 'Lê Văn C',
  },
];

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored auth state on app start
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('smartattendance_user');
      const savedSession = await AsyncStorage.getItem('smartattendance_session');

      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setUserRole(userData.role);
        } catch (err) {
          console.error('Failed to parse saved user:', err);
          await AsyncStorage.removeItem('smartattendance_user');
        }
      } else if (savedSession) {
        try {
          const userData = JSON.parse(savedSession);
          setUser(userData);
          setUserRole(userData.role);
        } catch (err) {
          console.error('Failed to parse saved session:', err);
          await AsyncStorage.removeItem('smartattendance_session');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Find matching account
      const account = DEMO_ACCOUNTS.find(
        acc => acc.email === email && acc.password === password
      );

      if (!account) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Create user object (without password)
      const userData: User = {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
        employeeId: account.id === 'emp-001' ? 'NV001234' : account.id === 'mgr-001' ? 'MGR001' : 'ADM001',
        department: account.role === UserRole.Employee ? 'Phòng Kinh Doanh' : account.role === UserRole.Manager ? 'Phòng Nhân Sự' : 'Phòng IT',
        position: account.role === UserRole.Employee ? 'Nhân viên' : account.role === UserRole.Manager ? 'Quản lý' : 'Admin',
        phone: '0123 456 789',
      };

      console.log('Login successful:', { email, role: account.role, userData });
      setUser(userData);
      setUserRole(account.role);
      console.log('UserRole set to:', account.role);

      // Persist based on remember me
      if (rememberMe) {
        await AsyncStorage.setItem('smartattendance_user', JSON.stringify(userData));
      } else {
        await AsyncStorage.setItem('smartattendance_session', JSON.stringify(userData));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('smartattendance_user');
      await AsyncStorage.removeItem('smartattendance_session');
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  const value: AuthContextType = {
    userRole,
    user,
    isLoading,
    error,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={globalStyles.container}>
          <StatusBar style="light" backgroundColor="#101122" />
          <AppContent />
    </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[globalStyles.container, globalStyles.center]}>
        <ActivityIndicator size="large" color="#4245f0" />
      </View>
    );
  }

  return <AppNavigator userRole={userRole || undefined} isLoading={isLoading} />;
}
