import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS } from '../../utils/styles';

export default function AdminAuditScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <View style={{ padding: SPACING.xl }}>
        <Text style={[globalStyles.heading2, { marginBottom: SPACING.xl }]}>
          System Audit Logs
        </Text>
        <View
          style={{
            backgroundColor: COLORS.surface.dark,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.lg,
          }}
        >
          <Text style={globalStyles.body}>
            Audit logs screen coming soon...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

