import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useContext } from "react";
import { useRouter } from "expo-router";
import { useLoader } from "@/hooks/useLoader";
import { login } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/context/ThemeContext";

const Login = () => {
  const router = useRouter();
  const { showLoader, hideLoader, isLoading } = useLoader();

  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const bgMain = isDark ? "bg-gray-900" : "bg-white";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark ? "bg-gray-800" : "bg-white";
  const inputBorder = isDark ? "border-gray-700" : "border-gray-200";
  const iconColor = isDark ? "#9ca3af" : "#6B7280";

  const handleLogin = async () => {
    if (!email || !password || isLoading) {
      Alert.alert("Please enter email and password");
      return;
    }
    try {
      showLoader();
      await login(email, password);
      router.replace("/home");
    } catch (e) {
      console.error(e);
      Alert.alert("Login fail");
    } finally {
      hideLoader();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={`flex-1 ${bgMain}`}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          className="px-6"
        >
          <View className="flex-row items-center mt-12 mb-6">
            <Image
              source={require("../../assets/images/icon.png")}
              className={`w-24 h-24 rounded-full p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}
              resizeMode="contain"
            />
            <Text className={`text-3xl font-bold ${textMain} ml-2`}>Rentail.lk</Text>
          </View>

          <View className="mb-10">
            <Text className={`text-3xl font-bold ${textMain}`}>Welcome Back</Text>
            <Text className={`text-3xl font-bold ${textMain}`}>Ready to hit the road.</Text>
          </View>

          <View className="mb-8">
            <TextInput
              placeholder="Email"
              placeholderTextColor={iconColor}
              className={`p-3 mb-4 rounded-xl border ${inputBg} ${inputBorder} ${textMain}`}
              value={email}
              onChangeText={setEmail}
            />

            <View className="justify-center mb-2">
              <TextInput
                placeholder="Password"
                placeholderTextColor={iconColor}
                className={`p-3 rounded-xl pr-10 border ${inputBg} ${inputBorder} ${textMain}`}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color={iconColor}
                />
              </TouchableOpacity>
            </View>

            <View>
              <Text className={`text-[12px] ${textSub}`}>Forgot Password?</Text>
            </View>
          </View>

          <View className="flex-col gap-4 mb-8">
            <Pressable
              onPress={handleLogin}
              className={`px-6 py-3 rounded-3xl ${isDark ? "bg-emerald-600" : "bg-black"}`}
            >
              <Text className="text-white text-lg text-center font-bold">Login</Text>
            </Pressable>

            <Pressable
              className={`px-6 py-3 rounded-3xl border ${inputBorder}`}
              onPress={() => router.push("/(auth)/register")}
            >
              <Text className={`text-center font-bold ${textSub}`}>Sign Up</Text>
            </Pressable>
          </View>

          <View className="flex-row items-center justify-center mb-6 gap-6">
            <View className={`w-24 h-[1px] ${isDark ? "bg-gray-700" : "bg-black"}`}></View>
            <Text className={`text-center text-sm px-4 ${textSub}`}>Or</Text>
            <View className={`w-24 h-[1px] ${isDark ? "bg-gray-700" : "bg-black"}`}></View>
          </View>

          <View className="mb-6">
            <Pressable className={`mb-4 px-6 py-3 rounded-3xl border ${inputBg} ${inputBorder}`}>
              <Text className={`text-center text-sm ${textSub}`}>Continue with Google</Text>
            </Pressable>
            <Pressable className={`px-6 py-3 rounded-3xl border ${inputBg} ${inputBorder}`}>
              <Text className={`text-center text-sm ${textSub}`}>Continue with Facebook</Text>
            </Pressable>
          </View>

          <View className="flex justify-center items-center mt-auto">
            <View className={`w-24 h-1 rounded-2xl ${isDark ? "bg-gray-700" : "bg-black"}`}></View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;