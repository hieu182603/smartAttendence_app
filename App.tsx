import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import { globalStyles } from './src/utils/styles';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { PreferencesProvider } from './src/context/PreferencesContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 minutes
      gcTime: 24 * 60 * 60 * 1000,     // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'SMARTATTENDANCE_QUERY_CACHE',
});

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
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <PreferencesProvider>
          <AuthProvider>
            <SocketProvider>
              <View style={globalStyles.container}>
                <StatusBar style="light" backgroundColor="#101122" />
                <AppContent />
              </View>
            </SocketProvider>
          </AuthProvider>
        </PreferencesProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
