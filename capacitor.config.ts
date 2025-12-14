import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finmate.app',
  appName: 'FinMate',
  webDir: 'dist',
  server: {
    url: 'https://kart-i-quo-fujv.onrender.com',
    cleartext: true
  }
};

export default config;
