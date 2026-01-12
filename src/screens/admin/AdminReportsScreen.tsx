import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS } from '../../utils/styles';

export default function AdminReportsScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <View style={{ padding: SPACING.xl }}>
        <Text style={[globalStyles.heading2, { marginBottom: SPACING.xl }]}>
          Reports & Analytics
        </Text>
        <View
          style={{
            backgroundColor: COLORS.surface.dark,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.lg,
          }}
        >
          <Text style={globalStyles.body}>
            Reports screen coming soon...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

