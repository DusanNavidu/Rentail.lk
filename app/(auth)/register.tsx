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
} from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { registerUser } from "@/services/authService"
import { useLoader } from "@/hooks/useLoader"

const Register = () => {
  const router = useRouter()

  const { showLoader, hideLoader, isLoading } = useLoader()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [conPassword, setConPassword] = useState("")

  const handleRegister = async () => {
    if (isLoading) {
      return
    }
    if (!name || !email || !password) {
      Alert.alert("Please fill all fields...!")
      return
    }
    if (password !== conPassword) {
      Alert.alert("Password do not match...!")
      return
    }
    try {
      showLoader()
      await registerUser(name, email, password)
      Alert.alert("Account created...!")
      router.replace("/login")
    } catch (err) {
      Alert.alert("Registraion fail..!")
    } finally {
      hideLoader()
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between px-6 bg-white">
            <View className="flex-row items-center">
              <Image
                  source={require("../../assets/images/icon.png")}
                  className="w-24 h-24 bg-white rounded-full p-4"
                  resizeMode="contain"
                />
                <Text className="text-3xl font-bold">Rentail.lk</Text>
            </View>
            <View>
              <Text className="text-3xl font-bold">Welcome Back</Text>
              <Text className="text-3xl font-bold">Ready to hit the road.</Text>
            </View>
            <View>
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor="#6B7280"
                className="bg-white p-3 mb-4 rounded-xl"
                style={{ borderWidth: 1, borderColor: 'secondary', borderStyle: 'solid' }}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#6B7280"
                className="bg-white p-3 mb-4 rounded-xl"
                style={{ borderWidth: 1, borderColor: 'secondary', borderStyle: 'solid' }}
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#6B7280"
                className="bg-white p-3 mb-4 rounded-xl"
                style={{ borderWidth: 1, borderColor: 'secondary', borderStyle: 'solid' }}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                placeholder="confirm password"
                placeholderTextColor="#6B7280"
                className="bg-white p-3 mb-4 rounded-xl"
                style={{ borderWidth: 1, borderColor: 'secondary', borderStyle: 'solid' }}
                value={conPassword}
                onChangeText={setConPassword}
                secureTextEntry
              />
              <View>
                <Text className="text-[8px] text-secondary">Forgot Password?</Text>
              </View>
            </View>
            
            <View className="flex-col gap-4 mb-10">
              <Pressable
                onPress={handleRegister}
                className="bg-black px-6 py-3 rounded-3xl"
              >
                <Text className="text-white text-lg text-center font-bold">Register</Text>
              </Pressable>
              <Pressable 
                className="px-6 py-3 rounded-3xl"
                style={{ borderWidth: 1, borderColor: 'secondary', borderStyle: 'solid' }}
                onPress={() => router.back()}
              >
                <Text className="text-center text-secondary font-bold">
                  Login
                </Text>
              </Pressable>
            </View>
            <View className="flex-row items-center justify-center mb-6 gap-6">
              <View className="w-24 bg-black" style={{ height: 1 }}></View>
              <Text className="text-center text-secondary text-sm px-4">
                Or
              </Text>
              <View className="w-24 bg-black" style={{ height: 1 }}></View>
            </View>
            <View>
              <Pressable className="bg-white mb-4 px-6 py-3 rounded-3xl border border-secondary" style={{ borderWidth: 1, borderColor: 'secondary', borderStyle: 'solid' }}>
                <Text className="text-center text-secondary text-sm">
                  Continue with Google
                </Text>
              </Pressable>
              <Pressable className="bg-white px-6 py-3 rounded-3xl border border-secondary" style={{ borderWidth: 1, borderColor: 'secondary', borderStyle: 'solid' }}>
                <Text className="text-center text-secondary text-sm">
                  Continue with FaceBook
                </Text>
              </Pressable>
            </View>
            <View className="flex justify-center items-center mb-2">
              <View className="bg-black w-24 h-1 rounded-2xl flex justify-center"></View>
            </View>
          </View>
        </TouchableWithoutFeedback>
  )
}

export default Register
