import { View, Text } from "react-native"
import React from "react"
import { Slot } from "expo-router"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { LoaderProvider } from "@/context/LoaderContext"
import { AuthProvider } from "@/context/AuthContext"
import Toast from 'react-native-toast-message'

// Like App.tsx
const RootLayout = () => {
  const insets = useSafeAreaInsets()
  // / device safe area values (top, left, right, and bottom)
  console.log(insets)
  return (
    <LoaderProvider>
      <AuthProvider>
        <View className="flex-1" style={{ marginTop: insets.top }}>
          {/* Slot renders the currently active screen */}
          <Slot />
        </View>
        <Toast />
      </AuthProvider>
    </LoaderProvider>
    // <SafeAreaView className="flex-1">
    // {/* Slot renders the currently active screen */}
    // <Slot />
    // </SafeAreaView>
  )
}

export default RootLayout
