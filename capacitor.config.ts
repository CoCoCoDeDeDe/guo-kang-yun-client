import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wawngjie2026.guokangyun',
  appName: '果康云',
  webDir: 'dist',
  server: {
    // url: 'http://10.27.89.34:5173/home',
    cleartext: true,
  }
};

export default config;
