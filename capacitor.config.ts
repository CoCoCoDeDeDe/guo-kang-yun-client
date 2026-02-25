import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wawngjie2026.guokangyun',
  appName: '果康云',
  webDir: 'dist',
  server: {
    url: 'http://localhost:5173',
    cleartext: true,
  }
};

export default config;
