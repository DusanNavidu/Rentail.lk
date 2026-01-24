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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useLoader } from "@/hooks/useLoader";
import { login } from "@/services/authService";
// Icons සඳහා (Expo වල default එනවා)
import { Feather } from "@expo/vector-icons";

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Password පෙන්වන්න/හංගන්න

  const { showLoader, hideLoader, isLoading } = useLoader();

  const handleLogin = async () => {
    if (!email || !password || isLoading) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    try {
      showLoader();
      await login(email, password);
      // router.replace("/home"); 
    } catch (e: any) {
      console.error(e);
      Alert.alert("Login Failed", e.message);
    } finally {
      hideLoader();
    }
  };

  return (
    // 1. Keyboard එක එනකොට UI එක උඩට ගන්න කොටස
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="bg-slate-50"
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-6 justify-center items-center">
            
            {/* 2. App Logo & Header */}
            <View className="items-center mb-8">
              <Image
                // ඔයාගේ path එක අනුව වෙනස් කරගන්න
                source={require("../../assets/images/icon.png")} 
                className="w-24 h-24 rounded-2xl mb-4 shadow-sm"
                resizeMode="contain"
              />
              <Text className="text-3xl font-extrabold text-slate-800">
                Welcome Back!
              </Text>
              <Text className="text-slate-500 mt-2 text-base">
                Sign in to Rentail.lk
              </Text>
            </View>

            {/* 3. Form Container */}
            <View className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              
              {/* Email Input */}
              <Text className="text-slate-700 font-medium mb-2 ml-1">Email</Text>
              <View className="flex-row items-center border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 mb-4 focus:border-blue-500">
                <Feather name="mail" size={20} color="#64748b" />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-3 text-slate-700 text-base"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password Input */}
              <Text className="text-slate-700 font-medium mb-2 ml-1">Password</Text>
              <View className="flex-row items-center border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 mb-6 focus:border-blue-500">
                <Feather name="lock" size={20} color="#64748b" />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-3 text-slate-700 text-base"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                className="bg-blue-600 active:bg-blue-700 py-4 rounded-xl shadow-md shadow-blue-200"
              >
                <Text className="text-white text-lg font-bold text-center">
                  Login
                </Text>
              </Pressable>

              {/* Forgot Password */}
              <TouchableOpacity className="mt-4 items-center">
                <Text className="text-slate-500 text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-600">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text className="text-blue-600 font-bold ml-1">
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;