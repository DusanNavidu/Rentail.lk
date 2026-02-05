import { View, Text } from "react-native"
import React from "react"
import { Slot } from "expo-router"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { LoaderProvider } from "@/context/LoaderContext"
import { AuthProvider } from "@/context/AuthContext"
import Toast from 'react-native-toast-message'
import { ThemeProvider } from "@/context/ThemeContext"

const RootLayout = () => {
  const insets = useSafeAreaInsets()
  console.log(insets)
  return (
    <LoaderProvider>
      <AuthProvider>
        <ThemeProvider>
            <View style={{ flex: 1, marginTop: insets.top }}>
              <Slot />
            </View>
            <Toast />
        </ThemeProvider>
      </AuthProvider>
    </LoaderProvider>
  )
}

export default RootLayout
