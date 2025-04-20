import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeContext, ThemeProvider } from "./contexts/ThemeContext";
import HomeScreen from "./screens/HomeScreen";
import { TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const Stack = createStackNavigator();

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerRight: () => <ThemeToggle />,
              headerStyle: {
                backgroundColor: useContext(ThemeContext).theme === "light" ? "#f0f0f0" : "#1a1a1a",
              },
              headerTintColor: useContext(ThemeContext).theme === "light" ? "#000" : "#fff",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <TouchableOpacity onPress={toggleTheme} style={styles.toggleButton}>
      <AntDesign name={theme === "light" ? "moon" : "sun"} size={24} color={theme === "light" ? "#000" : "#fff"} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    marginRight: 15,
  },
});

export default App;