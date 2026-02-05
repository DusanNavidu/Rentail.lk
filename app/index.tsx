import { View, Text, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import "../global.css";
import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useNetInfo } from "@react-native-community/netinfo";
import { MaterialIcons } from "@expo/vector-icons";

const NoConnection = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <View className="flex-1 justify-center items-center bg-white px-8">
      
      <Image 
        source={require("../assets/images/Patreon.gif")} 
        className="w-80 h-80 mb-4"
        resizeMode="contain"
      />

      <Text className="text-2xl font-extrabold text-gray-900 text-center mb-2">
        Ooops! No Connection
      </Text>

      <Text className="text-base text-gray-500 text-center mb-10 leading-6">
        It seems you are offline. Please check your internet connection and try again.
      </Text>

      <TouchableOpacity 
        onPress={onRetry}
        activeOpacity={0.8}
        className="bg-black w-full py-4 rounded-2xl flex-row justify-center items-center shadow-lg"
      >
        <MaterialIcons name="refresh" size={22} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white font-bold text-lg">Try Again</Text>
      </TouchableOpacity>

    </View>
  );
};

const LoadingScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="black" />
      <Text className="text-gray-400 text-sm mt-4 font-medium">Checking status...</Text>
    </View>
  );
};

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const netInfo = useNetInfo();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
    }, 1500);
  };

  if (authLoading || netInfo.isConnected === null || isRetrying) {
    return <LoadingScreen />;
  }

  if (netInfo.isConnected === false) {
    return <NoConnection onRetry={handleRetry} />;
  }

  if (user) {
    return <Redirect href="/home" />;
  } else {
    return <Redirect href="/getStartPage" />;
  }
};

export default Index;