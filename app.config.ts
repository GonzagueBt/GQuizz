import type { ExpoConfig } from 'expo/config';

/**
 * Config Expo dynamique.
 * Le nom de marque et le bundle id sont des placeholders — voir ARCHITECTURE.md §12.
 */

// Sous-chemin de la démo web. Vide en local et sur le VPS (racine) ;
// "/GQuizz" pour GitHub Pages (gonzaguebt.github.io/GQuizz/).
const webBaseUrl = process.env.EXPO_WEB_BASE_URL ?? '';

const config: ExpoConfig = {
  name: 'GQuizz',
  slug: 'gquizz',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'gquizz',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.gonzaguebt.gquizz',
  },
  android: {
    package: 'com.gonzaguebt.gquizz',
    adaptiveIcon: {
      backgroundColor: '#1E1B4B',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    // SPA : pas de pré-rendu Node (le jeu est une app, pas un site de contenu).
    // nginx doit renvoyer index.html en fallback (try_files ... /index.html).
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#1E1B4B',
        image: './assets/images/splash-icon.png',
        imageWidth: 96,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    ...(webBaseUrl ? { baseUrl: webBaseUrl } : {}),
  },
  extra: {
    // Passé à l'app via expo-constants. Activé automatiquement hors production.
    purchasesStub: process.env.EXPO_PUBLIC_PURCHASES_STUB === '1',
  },
};

export default config;
