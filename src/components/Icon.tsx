import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/styles';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Map từ Material Symbols sang Expo Vector Icons
const iconMap: { [key: string]: { family: string; name: string } } = {
  // Navigation
  home: { family: 'Ionicons', name: 'home' },
  person: { family: 'Ionicons', name: 'person' },
  settings: { family: 'Ionicons', name: 'settings' },
  notifications: { family: 'Ionicons', name: 'notifications' },
  menu: { family: 'Ionicons', name: 'menu' },
  close: { family: 'Ionicons', name: 'close' },
  search: { family: 'Ionicons', name: 'search' },
  add: { family: 'Ionicons', name: 'add' },
  check: { family: 'Ionicons', name: 'checkmark' },

  // Time & Calendar
  schedule: { family: 'Ionicons', name: 'time' },
  calendar_month: { family: 'Ionicons', name: 'calendar' },
  history_toggle_off: { family: 'MaterialIcons', name: 'history' },
  history_edu: { family: 'MaterialIcons', name: 'history-edu' },
  timelapse: { family: 'MaterialIcons', name: 'timelapse' },
  date_range: { family: 'MaterialIcons', name: 'date-range' },

  // Communication
  mail: { family: 'Ionicons', name: 'mail' },
  call: { family: 'Ionicons', name: 'call' },
  message: { family: 'Ionicons', name: 'chatbubble' },

  // Location
  location_on: { family: 'Ionicons', name: 'location' },
  map: { family: 'Ionicons', name: 'map' },
  gps_fixed: { family: 'MaterialIcons', name: 'gps-fixed' },

  // Actions
  login: { family: 'Ionicons', name: 'log-in' },
  logout: { family: 'Ionicons', name: 'log-out' },
  edit: { family: 'Ionicons', name: 'create' },
  delete: { family: 'Ionicons', name: 'trash' },
  save: { family: 'Ionicons', name: 'save' },

  // Status
  check_circle: { family: 'Ionicons', name: 'checkmark-circle' },
  error: { family: 'Ionicons', name: 'close-circle' },
  warning: { family: 'Ionicons', name: 'warning' },
  info: { family: 'Ionicons', name: 'information-circle' },

  // Business
  business: { family: 'Ionicons', name: 'business' },
  work: { family: 'MaterialIcons', name: 'work' },
  group: { family: 'Ionicons', name: 'people' },
  people: { family: 'Ionicons', name: 'people' },
  person_off: { family: 'Ionicons', name: 'person-outline' },
  groups: { family: 'MaterialIcons', name: 'groups' },
  manage_accounts: { family: 'MaterialIcons', name: 'manage-accounts' },
  assignment: { family: 'Ionicons', name: 'document-text' },
  fact_check: { family: 'MaterialIcons', name: 'fact-check' },

  // Analytics
  analytics: { family: 'Ionicons', name: 'analytics' },
  bar_chart: { family: 'Ionicons', name: 'bar-chart' },
  pie_chart: { family: 'Ionicons', name: 'pie-chart' },
  trending_up: { family: 'Ionicons', name: 'trending-up' },

  // System
  dns: { family: 'MaterialIcons', name: 'dns' },
  admin_panel_settings: { family: 'MaterialIcons', name: 'admin-panel-settings' },
  dashboard: { family: 'MaterialIcons', name: 'dashboard' },
  grid_view: { family: 'Ionicons', name: 'grid' },

  // Arrows
  chevron_right: { family: 'Ionicons', name: 'chevron-forward' },
  chevron_left: { family: 'Ionicons', name: 'chevron-back' },
  arrow_forward: { family: 'Ionicons', name: 'arrow-forward' },
  arrow_back: { family: 'Ionicons', name: 'arrow-back' },

  // Misc
  coffee: { family: 'MaterialIcons', name: 'local-cafe' },
  event: { family: 'Ionicons', name: 'calendar' },
  auto_awesome: { family: 'MaterialIcons', name: 'auto-awesome' },
  done_all: { family: 'MaterialIcons', name: 'done-all' },
  credit_card: { family: 'MaterialIcons', name: 'credit-card' },
  dark_mode: { family: 'MaterialIcons', name: 'dark-mode' },

  // Visibility
  visibility: { family: 'Ionicons', name: 'eye' },
  visibility_off: { family: 'Ionicons', name: 'eye-off' },

  // More icons
  lock: { family: 'Ionicons', name: 'lock-closed' },
  lock_open: { family: 'Ionicons', name: 'lock-open' },
  key: { family: 'Ionicons', name: 'key' },
  phone: { family: 'Ionicons', name: 'call' },
  lock_reset: { family: 'MaterialIcons', name: 'lock-reset' },

  // Manager Dashboard icons
  person_check: { family: 'MaterialIcons', name: 'person-check' },
  supervisor_account: { family: 'MaterialIcons', name: 'supervisor-account' },
  email: { family: 'Ionicons', name: 'mail' },

  // Camera
  cameraswitch: { family: 'MaterialIcons', name: 'cameraswitch' },
  camera: { family: 'Ionicons', name: 'camera' },
  photo_camera: { family: 'MaterialIcons', name: 'photo-camera' },
  face: { family: 'MaterialIcons', name: 'face' },

  // Alerts
  alarm: { family: 'Ionicons', name: 'alarm' },
  cancel: { family: 'MaterialIcons', name: 'cancel' },
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = COLORS.text.primary,
  style
}) => {
  const iconData = iconMap[name];

  if (!iconData) {
    // Fallback to a default icon if not found
    return (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ color, fontSize: size * 0.6 }}>?</Text>
      </View>
    );
  }

  const { family, name: iconName } = iconData;

  switch (family) {
    case 'Ionicons':
      return <Ionicons name={iconName as any} size={size} color={color} style={style} />;
    case 'MaterialIcons':
      return <MaterialIcons name={iconName as any} size={size} color={color} style={style} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={iconName as any} size={size} color={color} style={style} />;
    default:
      return <Ionicons name={iconName as any} size={size} color={color} style={style} />;
  }
};

