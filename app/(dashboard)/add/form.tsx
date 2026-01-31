import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker"; 
import { useLoader } from "@/hooks/useLoader";
import { addVehicle } from "@/services/vehicleService"; 
import Toast from 'react-native-toast-message';

const VehicleForm = () => {
  const router = useRouter();
  const { showLoader, hideLoader, isLoading } = useLoader();

  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, 
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    if (!title || !price || !seats || !location) {
      Toast.show({
        type: 'error',
        text1: 'Missing Details ⚠️',
        text2: 'Please fill in all the required fields!',
      });
      return;
    }

    if (!image) {
        Toast.show({
            type: 'info',
            text1: 'No Image Selected 📸',
            text2: 'Please pick a photo of your vehicle.',
        });
        return;
    }

    showLoader();
    try {
      await addVehicle(image, title, price, seats, location, description);
      
      Toast.show({
        type: 'success',
        text1: 'Published! 🎉',
        text2: 'Vehicle added successfully to the market.',
        visibilityTime: 3000,
      });

      setTimeout(() => {
        router.back();
      }, 3000);

    } catch (err: any) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed ❌',
        text2: 'Check your internet connection and try again.',
      });
    } finally {
      hideLoader();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-row items-center p-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <MaterialIcons name="arrow-back-ios" size={20} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2">Add New Vehicle</Text>
        </View>

        <View className="p-6">
          <TouchableOpacity
            onPress={pickImage}
            className="w-full h-52 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 justify-center items-center mb-6 overflow-hidden"
          >
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Feather name="camera" size={40} color="#9ca3af" />
                <Text className="text-gray-400 mt-2 font-medium">
                  Tap to upload car image
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text className="text-gray-700 font-semibold mb-2 ml-1">Vehicle Name / Model</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4 text-gray-800"
            placeholder="Ex: Toyota Premion 2018"
            value={title}
            onChangeText={setTitle}
          />

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Price (Per Day)</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4 text-gray-800"
                placeholder="5000"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">Seats</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4 text-gray-800"
                placeholder="4"
                keyboardType="numeric"
                value={seats}
                onChangeText={setSeats}
              />
            </View>
          </View>

          <Text className="text-gray-700 font-semibold mb-2 ml-1">Location</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4 text-gray-800"
            placeholder="Ex: Colombo, Kandy"
            value={location}
            onChangeText={setLocation}
          />

          <Text className="text-gray-700 font-semibold mb-2 ml-1">Description</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4 text-gray-800 h-24 text-top pt-3"
            placeholder="More details about the vehicle..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            style={{ textAlignVertical: 'top' }}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-black py-4 rounded-2xl mt-4 shadow-md"
          >
            <Text className="text-white text-center font-bold text-lg">
              {isLoading ? "Uploading..." : "Publish Vehicle"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="h-[100px]"></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VehicleForm;