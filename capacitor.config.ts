import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ir.ajwibah.istiftaat',
  appName: 'اجوبة الاستفتائات',
  webDir: 'dist',
  android: {
    backgroundColor: '#F8F5EE',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
