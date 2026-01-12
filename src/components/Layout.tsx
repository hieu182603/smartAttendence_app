import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/styles';

interface LayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  className?: string; // For backward compatibility with web code
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  style,
  safeAreaEdges = ['top', 'bottom'],
  className,
}) => {
  return (
    <SafeAreaView
      edges={safeAreaEdges}
      style={[styles.container, style]}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
    width: '100%',
    maxWidth: 428, // iPhone max width
    alignSelf: 'center',
  },
});

