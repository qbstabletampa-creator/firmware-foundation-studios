import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.firmwarefoundation.studios',
  appName: 'FFS Games',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#10100E',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#10100E',
  },
};

export default config;
