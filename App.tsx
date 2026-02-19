import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { globalStyles } from './src/utils/styles';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';

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

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <View style={globalStyles.container}>
            <StatusBar style="light" backgroundColor="#101122" />
            <AppContent />
          </View>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
