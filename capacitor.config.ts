import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.rpl3.tobias',
  appName: 'Tobias',
  webDir: 'dist',
  backgroundColor: '#f2efe6',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'LIGHT',
      initialViewportFitValueHint: 'cover'
    }
  }
}

export default config
