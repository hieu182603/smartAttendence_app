const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure SVG assets work properly
config.resolver.assetExts.push('svg');

// Exclude native modules from web bundler
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Exclude @react-native-community/datetimepicker on web
  if (platform === 'web' && moduleName === '@react-native-community/datetimepicker') {
    return {
      type: 'empty',
    };
  }
  
  // Use default resolver for other modules
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

