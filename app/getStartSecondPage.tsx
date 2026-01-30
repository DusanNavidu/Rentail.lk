import React from "react";
import "../global.css";
import { View, Text, Image, Platform, TouchableOpacity, StatusBar, KeyboardAvoidingView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; 
import { LinearGradient } from 'expo-linear-gradient';

const GetStartSecondPage = () => {
  const router = useRouter();

  return (
    <KeyboardAvoidingView className="flex-1 bg-slate-900 relative"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <Image
        source={require("../assets/app_image/front-view-man-working-as-valet.jpg")}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'transparent']}
        className="absolute inset-0 h-1/2" // h-1/2 දැම්මේ බාගයක් දුරට එන්න (නැත්නම් මුළු screen එකම අඳුරු වෙයි)
      />
      <View className="flex-1 justify-between px-6 bottom-14 pt-14">
        <View className="mt-14 items-start">
          <Image
            source={require("../assets/images/icon.png")}
            className="w-24 h-24 mb-6 bg-white rounded-full p-4"
            resizeMode="contain"
          />
          <Text className="text-4xl font-bold text-white text-start">
            Lets Start
          </Text>
          <Text className="text-4xl font-bold text-white text-start">
            A New Experience
          </Text>
          <Text className="text-4xl font-bold text-white text-start">
            With Car rental.
          </Text>
        </View>
        <View className="bottom-10">
            <Text className="text-[15px] italic text-white text-start">
                Discover your next adventure with Rentail.lk. we’re here to 
            </Text>
            <Text className="text-[15px] italic text-white text-start"> 
                provide you with a seamless car rental experience.
            </Text>
            <Text className="text-[15px] italic text-white text-start"> 
                Let’s get started on your journey.
            </Text>
            <View className="flex-row gap-3 mt-4 justify-center">
                <View className="bg-gray-300 w-2 h-2 rounded-full"></View>
                <View className="bg-gray-50 w-7 h-2 rounded-full"></View>
            </View>
            <TouchableOpacity
                className="bg-gray-300 px-6 py-3 mt-6 rounded-full items-center self-center w-full"
                onPress={() => router.push("/login")}
            >
                <Text className="text-gray-800 text-2xl font-bold">Get Started</Text>
            </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default GetStartSecondPage;