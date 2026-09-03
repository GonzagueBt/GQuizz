import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { ConfirmProvider } from '@/components/ConfirmProvider';
import { useHydrated } from '@/hooks/useHydrated';
import { useTheme } from '@/hooks/useTheme';
import { useOwnershipStore } from '@/store/ownershipStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrated = useHydrated();
  const { colors, dark } = useTheme();
  const syncOwnership = useOwnershipStore((s) => s.sync);

  useEffect(() => {
    if (hydrated) {
      syncOwnership().finally(() => SplashScreen.hideAsync());
    }
  }, [hydrated, syncOwnership]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={dark ? 'light' : 'dark'} />
        {hydrated ? (
          <ConfirmProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </ConfirmProvider>
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.background }} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
