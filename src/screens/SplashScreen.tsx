import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { globalStyles, COLORS, useTheme } from '../utils/styles';

// Import icon image
const appIcon = require('../../assets/icon.png');

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const theme = useTheme();
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
    <View style={[globalStyles.container, { backgroundColor: theme.background }]}>
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
        {/* Decorative background circles */}
        <View style={{
          position: 'absolute',
          top: -100,
          right: -50,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: 'rgba(66, 69, 240, 0.05)',
        }} />
        <View style={{
          position: 'absolute',
          bottom: -50,
          left: -100,
          width: 250,
          height: 250,
          borderRadius: 125,
          backgroundColor: 'rgba(34, 211, 238, 0.05)',
        }} />

        {/* Logo Container with Glow */}
        <Animated.View
          style={[
            {
              width: 140,
              height: 140,
              borderRadius: 35,
              backgroundColor: theme.surface,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 40,
              transform: [{ translateY: slideAnim }],
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
              borderWidth: 1,
              borderColor: 'rgba(66, 69, 240, 0.2)',
            },
          ]}
        >
          <Image
            source={appIcon}
            style={{ width: 90, height: 90, borderRadius: 20 }}
            resizeMode="contain"
            onError={(error) => {
              console.warn('Failed to load app icon:', error);
            }}
          />
        </Animated.View>

        {/* App Name */}
        <Animated.Text
          style={[
            {
              fontSize: 36,
              fontWeight: '800',
              color: COLORS.text.primary,
              textAlign: 'center',
              marginBottom: 12,
              letterSpacing: 0.5,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          Smatt
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={[
            {
              fontSize: 16,
              color: COLORS.text.secondary,
              textAlign: 'center',
              fontWeight: '500',
              letterSpacing: 0.5,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          Quản Lý Nhân Sự Thông Minh chó hiệu
        </Animated.Text>

        {/* Loading indicator */}
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              marginTop: 60,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                {
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: COLORS.primary,
                  marginHorizontal: 6,
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

