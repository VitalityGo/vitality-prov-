import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'VitalityGo.app',
  appName: 'Vitality Go ',
  webDir: 'dist/myapp/browser',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1023939118177-12t6esvjfvvanihmp05jjdqbbt3b49da.apps.googleusercontent.com', // Reemplaza con tu Client ID
      forceCodeForRefreshToken: true
    }
  }
};

export default config;