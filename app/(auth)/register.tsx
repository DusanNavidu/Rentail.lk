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
} from "react-native";
import React, { useState, useContext } from "react";
import { useRouter } from "expo-router";
import { registerUser } from "@/services/authService";
import { useLoader } from "@/hooks/useLoader";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/context/ThemeContext"; // Theme Context import

const Register = () => {
  const router = useRouter();
  const { showLoader, hideLoader, isLoading } = useLoader();

  // 1. Theme Data ලබා ගැනීම
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conPassword, setConPassword] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConPasswordVisible, setIsConPasswordVisible] = useState(false);

  // --- Theme Colors ---
  const bgMain = isDark ? "bg-gray-900" : "bg-white";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark ? "bg-gray-800" : "bg-white";
  const inputBorder = isDark ? "border-gray-700" : "border-gray-200";
  const iconColor = isDark ? "#9ca3af" : "#6B7280";

  const handleRegister = async () => {
    if (isLoading) return;
    
    if (!name || !email || !password) {
      Alert.alert("Please fill all fields...!");
      return;
    }
    if (password !== conPassword) {
      Alert.alert("Password do not match...!");
      return;
    }
    try {
      showLoader();
      await registerUser(name, email, password);
      Alert.alert("Account created...!");
      router.replace("/login");
    } catch (err) {
      Alert.alert("Registration fail..!");
    } finally {
      hideLoader();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className={`flex-1 justify-between px-6 ${bgMain}`}>
        
        {/* Header Section */}
        <View className="flex-row items-center mt-10">
          <Image
            source={require("../../assets/images/icon.png")}
            className={`w-14 h-14 rounded-full p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}
            resizeMode="contain"
          />
          <Text className={`text-3xl font-bold ${textMain} ml-2`}>Rentail.lk</Text>
        </View>

        <View>
          <Text className={`text-3xl font-bold ${textMain}`}>Welcome Back</Text>
          <Text className={`text-3xl font-bold ${textMain}`}>Ready to hit the road.</Text>
        </View>

        {/* Inputs Section */}
        <View>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor={iconColor}
            className={`p-3 mb-4 rounded-xl border ${inputBg} ${inputBorder} ${textMain}`}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor={iconColor}
            className={`p-3 mb-4 rounded-xl border ${inputBg} ${inputBorder} ${textMain}`}
            value={email}
            onChangeText={setEmail}
          />

          {/* Password Input */}
          <View className="justify-center">
            <TextInput
              placeholder="Password"
              placeholderTextColor={iconColor}
              className={`p-3 mb-4 rounded-xl pr-10 border ${inputBg} ${inputBorder} ${textMain}`}
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

          {/* Confirm Password Input */}
          <View className="justify-center">
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor={iconColor}
              className={`p-3 mb-4 rounded-xl pr-10 border ${inputBg} ${inputBorder} ${textMain}`}
              value={conPassword}
              onChangeText={setConPassword}
              secureTextEntry={!isConPasswordVisible}
            />
            <TouchableOpacity
              onPress={() => setIsConPasswordVisible(!isConPasswordVisible)}
              className="absolute right-4 top-3"
            >
              <Ionicons
                name={isConPasswordVisible ? "eye" : "eye-off"}
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
          </View>

          <View>
            <Text className={`text-[12px] ${textSub}`}>Forgot Password?</Text>
          </View>
        </View>

        {/* Buttons Section */}
        <View className="flex-col gap-4 mb-10">
          <Pressable
            onPress={handleRegister}
            className={`px-6 py-3 rounded-3xl ${isDark ? "bg-emerald-600" : "bg-black"}`}
          >
            <Text className="text-white text-lg text-center font-bold">Register</Text>
          </Pressable>
          
          <Pressable
            className={`px-6 py-3 rounded-3xl border ${inputBorder}`}
            onPress={() => router.back()}
          >
            <Text className={`text-center font-bold ${textSub}`}>
              Login
            </Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="flex-row items-center justify-center mb-6 gap-6">
          <View className={`w-24 h-[1px] ${isDark ? "bg-gray-700" : "bg-black"}`}></View>
          <Text className={`text-center text-sm px-4 ${textSub}`}>Or</Text>
          <View className={`w-24 h-[1px] ${isDark ? "bg-gray-700" : "bg-black"}`}></View>
        </View>

        {/* Social Login */}
        <View>
          <Pressable className={`mb-4 px-6 py-3 rounded-3xl border ${inputBg} ${inputBorder}`}>
            <Text className={`text-center text-sm ${textSub}`}>
              Continue with Google
            </Text>
          </Pressable>
          <Pressable className={`px-6 py-3 rounded-3xl border ${inputBg} ${inputBorder}`}>
            <Text className={`text-center text-sm ${textSub}`}>
              Continue with Facebook
            </Text>
          </Pressable>
        </View>

        {/* Bottom Indicator */}
        <View className="flex justify-center items-center mb-8 mt-4">
          <View className={`w-24 h-1 rounded-2xl ${isDark ? "bg-gray-700" : "bg-black"}`}></View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Register;