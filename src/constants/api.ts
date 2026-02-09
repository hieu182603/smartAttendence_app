import { Platform } from 'react-native';

// Get API URL from environment variable
// Expo uses EXPO_PUBLIC_ prefix for public env vars
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// Platform-specific API URL (can override for different platforms if needed)
const getApiUrl = () => {
  // Use environment variable for all platforms
  return BACKEND_URL;
};

export const API_URL = getApiUrl();
export const AUTH_endpoints = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
};
