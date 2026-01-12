import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { globalStyles, COLORS } from '../utils/styles';
import { Icon } from '../components/Icon';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to Login after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, slideAnim]);

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.accent.cyan]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.container}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Logo/Icon */}
        <Animated.View
          style={[
            {
              width: 120,
              height: 120,
              borderRadius: 30,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Icon name="business" size={60} color="#ffffff" />
        </Animated.View>

        {/* App Name */}
        <Animated.Text
          style={[
            {
              fontSize: 32,
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: 8,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          SmartAttendance
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={[
            {
              fontSize: 16,
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          Smart Employee Management
        </Animated.Text>

        {/* Loading dots */}
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              marginTop: 40,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                {
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#ffffff',
                  marginHorizontal: 4,
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

