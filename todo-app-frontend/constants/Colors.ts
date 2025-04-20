/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#64B5F6';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    cardBackground: '#ffffff',
    inputBorder: '#e0e0e0',
    todoItem: '#f8f9fa',
    accent: '#FF4081',
    success: '#4CAF50',
    error: '#f44336',
    headerBackground: '#ffffff',
    modalBackground: '#ffffff',
    chipBackground: '#f5f5f5',
    border: '#E5E5E5',
    secondaryText: '#666666',
    surface: '#ffffff',
  },
  dark: {
    text: '#ffffff',
    background: '#121212',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    cardBackground: '#1E1E1E',
    inputBorder: '#2D2D2D',
    todoItem: '#1a1a1a',
    accent: '#FF80AB',
    success: '#81C784',
    error: '#FF5252',
    headerBackground: '#1E1E1E',
    modalBackground: '#1E1E1E',
    chipBackground: '#2D2D2D',
    border: '#2D2D2D',
    secondaryText: '#9e9e9e',
    surface: '#1E1E1E',
  },
};
