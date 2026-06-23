import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saiyantrainer.dbzfit',
  appName: 'Saiyan Warrior Trainer',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
