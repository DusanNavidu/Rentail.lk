import { Stack } from "expo-router";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { View, Text } from "react-native";

export default function ChatLayout() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#121212' : '#ffffff', // WhatsApp Dark/Light
        },
        headerTintColor: isDark ? '#ffffff' : '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false, // ඉර අයින් කරන්න
      }}
    >
      {/* Inbox Page */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Chats",
          headerLargeTitle: false, 
        }} 
      />

      {/* Conversation Page */}
      <Stack.Screen 
        name="conversation" 
        options={{ 
          headerShown: false, // අපි Custom Header එකක් හදනවා WhatsApp වගේ පේන්න
        }} 
      />
    </Stack>
  );
}