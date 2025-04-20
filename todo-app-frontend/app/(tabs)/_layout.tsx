import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { ThemeProvider } from '@/app/context/theme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabLayout() {
  const paperTheme = useTheme();

  return (
    <ThemeProvider>
      <ThemedView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: paperTheme.colors.background,
            },
            contentStyle: {
              backgroundColor: paperTheme.colors.background,
            },
            headerTitleStyle: {
              color: paperTheme.colors.onBackground,
              fontSize: 20,
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen
            name="index"
            options={{
              headerTitle: () => (
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>
                  My Tasks
                </ThemedText>
              ),
            }}
          />
        </Stack>
      </ThemedView>
    </ThemeProvider>
  );
}
