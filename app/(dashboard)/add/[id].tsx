import { View, Text, ScrollView, Image, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialIcons, Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { getVehicleById } from "@/services/vehicleService";
import MapView, { Marker } from "react-native-maps";
import Toast from 'react-native-toast-message';

const VehicleDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Vehicle Data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const data = await getVehicleById(id as string);
        setVehicle(data);
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Vehicle not found' });
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  if (loading) {
    return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="black" /></View>;
  }

  if (!vehicle) return null;

  const openDialer = () => {
      if(vehicle.ownerContact) Linking.openURL(`tel:${vehicle.ownerContact}`);
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image */}
        <View className="relative">
          <Image source={{ uri: vehicle.imageUrl }} className="w-full h-80 bg-gray-200" resizeMode="cover" />
          
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="absolute top-12 left-5 bg-white/90 p-3 rounded-full shadow-sm"
          >
            <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity 
            onPress={() => router.push({ pathname: "/add/form", params: { editId: vehicle.id } })}
            className="absolute top-12 right-5 bg-white/90 p-3 rounded-full shadow-sm"
          >
            <Feather name="edit-2" size={22} color="black" />
          </TouchableOpacity>
        </View>

        <View className="p-6 -mt-10 bg-white rounded-t-[40px] shadow-lg flex-1">
          {/* Title & Price */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-extrabold text-gray-900">{vehicle.vehicleBrand}</Text>
              <Text className="text-xl text-gray-500 font-medium mt-1">{vehicle.vehicleModel}</Text>
              <View className="flex-row items-center mt-2">
                 <View className="bg-yellow-400 px-3 py-1 rounded-md border border-black">
                     <Text className="font-bold text-xs">{vehicle.numberPlate}</Text>
                 </View>
              </View>
            </View>
            <View className="bg-black px-4 py-3 rounded-2xl items-center">
              <Text className="text-white font-bold text-lg">Rs.{vehicle.price}</Text>
              <Text className="text-gray-400 text-xs">/Day</Text>
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View className="flex-row justify-between bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-100">
            <View className="items-center flex-1 border-r border-gray-200">
              <MaterialIcons name="event-seat" size={24} color="#4b5563" />
              <Text className="text-xs text-gray-500 mt-1 font-medium">{vehicle.seats} Seats</Text>
            </View>
            <View className="items-center flex-1 border-r border-gray-200">
              <FontAwesome5 name="car" size={20} color="#4b5563" />
              <Text className="text-xs text-gray-500 mt-1 font-medium">{vehicle.vehicleCategory}</Text>
            </View>
            <View className="items-center flex-1">
               <MaterialIcons name="settings" size={24} color="#4b5563" />
               <Text className="text-xs text-gray-500 mt-1 font-medium">{vehicle.vehicleType}</Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-lg font-bold mb-3 text-black">Vehicle Details</Text>
          <Text className="text-gray-600 leading-6 mb-8 text-base bg-gray-50 p-4 rounded-xl">
             {vehicle.description}
          </Text>

          {/* Technical Details (Collapsed view style) */}
          <View className="bg-gray-100 p-4 rounded-xl mb-8">
              <Text className="font-bold mb-2">Technical Info</Text>
              <Text className="text-xs text-gray-500">Engine No: {vehicle.engineNumber}</Text>
              <Text className="text-xs text-gray-500">Chassis No: {vehicle.chassisNumber}</Text>
          </View>

          {/* Location Map */}
          <Text className="text-lg font-bold mb-3 text-black">Pickup Location</Text>
          <Text className="text-gray-500 text-sm mb-3 ml-1"><Ionicons name="location" size={14} /> {vehicle.locationName}</Text>
          
          <View className="h-48 w-full rounded-3xl overflow-hidden mb-8 border border-gray-200 shadow-sm">
            <MapView 
              style={{ flex: 1 }}
              initialRegion={{
                latitude: vehicle.latitude || 6.9271,
                longitude: vehicle.longitude || 79.8612,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false} // Disable scrolling inside scrollview
            >
              <Marker coordinate={{ latitude: vehicle.latitude || 6.9271, longitude: vehicle.longitude || 79.8612 }} />
            </MapView>
          </View>
          <View className="h-[100px]"></View>
        </View>
      </ScrollView>

      {/* Floating Owner Contact Bar */}
      <View className="absolute bottom-[110px] left-6 right-6 bg-gray-900 p-4 rounded-[25px] flex-row items-center justify-between shadow-xl">
         <View className="flex-row items-center flex-1 mr-4">
            <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-lg">{vehicle.ownerName?.charAt(0)}</Text>
            </View>
            <View>
                <Text className="text-gray-400 text-xs">Vehicle Owner</Text>
                <Text className="text-white text-base font-bold" numberOfLines={1}>{vehicle.ownerName}</Text>
            </View>
         </View>
         <TouchableOpacity onPress={openDialer} className="bg-green-500 w-12 h-12 rounded-full items-center justify-center shadow-lg active:bg-green-600">
            <Ionicons name="call" size={24} color="white" />
         </TouchableOpacity>
      </View>
    </View>
  );
};

export default VehicleDetails;