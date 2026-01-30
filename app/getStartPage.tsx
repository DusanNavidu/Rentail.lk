import React from "react";
import "../global.css";
import { View, Text, Image, Platform, TouchableOpacity, StatusBar, KeyboardAvoidingView } from "react-native";
import { useRouter } from "expo-router";
// Icons ඕන නම් විතරක් දාගන්න
import { MaterialCommunityIcons } from "@expo/vector-icons"; 

const GetStartPage = () => {
  const router = useRouter();

  return (
    <KeyboardAvoidingView className="flex-1 bg-slate-900 relative"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <Image
        source={require("../assets/app_image/front-view-black-sedan-sport-car-bridge.jpg")}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black opacity-50" />
      <View className="flex-1 justify-between px-6 bottom-14 pt-14">
        <View className="mt-14 items-start">
          <Image
            source={require("../assets/images/icon.png")}
            className="w-24 h-24 mb-6 bg-white rounded-full p-4"
            resizeMode="contain"
          />
          <Text className="text-4xl font-bold text-white mb-4 text-center">
            Welcome to Rentail.lk
          </Text>
          <Text className="text-lg text-gray-300 mb-8 text-center">
            Your ultimate car management companion.
          </Text>
        </View>
        <TouchableOpacity
          className="bg-gray-300 px-6 py-3 rounded-full bottom-10 items-center self-center w-full"
          onPress={() => router.push("/getStartSecondPage")}
        >
          <Text className="text-gray-800 text-2xl font-bold">Get Started</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default GetStartPage;