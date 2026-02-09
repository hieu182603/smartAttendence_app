import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
    const { logout, user } = useAuth();
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Welcome {user?.name}</Text>
            <Button title="Logout" onPress={logout} style={{ marginTop: 20 }} />
        </View>
    );
};

export const TabsNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
        </Tab.Navigator>
    );
};
