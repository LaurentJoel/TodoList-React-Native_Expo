import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useContext } from 'react';
import { ThemeProvider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, ThemeContext } from './context/theme';
import { View } from 'react-native';
import { Colors } from '@/constants/Colors';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const customLightTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      ...Colors.light,
      primary: Colors.light.tint,
      background: Colors.light.background,
      card: Colors.light.cardBackground,
      text: Colors.light.text,
      border: Colors.light.border,
      surface: Colors.light.cardBackground,
      onSurface: Colors.light.text,
      onBackground: Colors.light.text,
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    dark: true,
    colors: {
      ...DarkTheme.colors,
      ...Colors.dark,
      primary: Colors.dark.tint,
      background: Colors.dark.background,
      card: Colors.dark.cardBackground,
      text: Colors.dark.text,
      border: Colors.dark.border,
      surface: Colors.dark.cardBackground,
      onSurface: Colors.dark.text,
      onBackground: Colors.dark.text,
    },
  };

  const paperTheme = isDark ? {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      ...Colors.dark,
      primary: Colors.dark.tint,
      background: Colors.dark.background,
      surface: Colors.dark.cardBackground,
      onSurface: Colors.dark.text,
      onBackground: Colors.dark.text,
      elevation: {
        level0: Colors.dark.background,
        level1: Colors.dark.cardBackground,
        level2: Colors.dark.cardBackground,
        level3: Colors.dark.cardBackground,
        level4: Colors.dark.cardBackground,
        level5: Colors.dark.cardBackground,
      },
    }
  } : {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      ...Colors.light,
      primary: Colors.light.tint,
      background: Colors.light.background,
      surface: Colors.light.cardBackground,
      onSurface: Colors.light.text,
      onBackground: Colors.light.text,
      elevation: {
        level0: Colors.light.background,
        level1: Colors.light.cardBackground,
        level2: Colors.light.cardBackground,
        level3: Colors.light.cardBackground,
        level4: Colors.light.cardBackground,
        level5: Colors.light.cardBackground,
      },
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? Colors.dark.background : Colors.light.background }}>
      <NavigationThemeProvider value={isDark ? customDarkTheme : customLightTheme}>
        <PaperProvider theme={paperTheme}>
          {children}
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </PaperProvider>
      </NavigationThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ThemedApp>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <Toast />
        </ThemedApp>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
