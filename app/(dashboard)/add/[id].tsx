import { View, Text, ScrollView, Image, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { MaterialIcons, Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { getVehicleById } from "@/services/vehicleService";
import MapView, { Marker } from "react-native-maps";
import Toast from 'react-native-toast-message';
import { ThemeContext } from "@/context/ThemeContext";

const VehicleDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const bgMain = isDark ? "bg-black" : "bg-white";
  const bgCard = isDark ? "bg-gray-900" : "bg-white";
  const bgSecondary = isDark ? "bg-gray-800" : "bg-gray-50";
  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const borderCol = isDark ? "border-gray-700" : "border-gray-200";
  const iconColor = isDark ? "#9ca3af" : "#4b5563";

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
    return <View className={`flex-1 justify-center items-center ${bgMain}`}><ActivityIndicator size="large" color={isDark ? "white" : "black"} /></View>;
  }

  if (!vehicle) return null;

  const openDialer = () => {
      if(vehicle.ownerContact) Linking.openURL(`tel:${vehicle.ownerContact}`);
  };

  return (
    <View className={`flex-1 ${bgMain}`}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="relative">
          <Image source={{ uri: vehicle.imageUrl }} className="w-full h-80 bg-gray-200" resizeMode="cover" />
          
          <TouchableOpacity 
            onPress={() => router.back()} 
            className={`absolute top-12 left-5 p-3 rounded-full shadow-sm ${isDark ? 'bg-black/50' : 'bg-white/90'}`}
          >
            <MaterialIcons name="arrow-back" size={24} color={isDark ? "white" : "black"} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push({ pathname: "/add/form", params: { editId: vehicle.id } })}
            className={`absolute top-12 right-5 p-3 rounded-full shadow-sm ${isDark ? 'bg-black/50' : 'bg-white/90'}`}
          >
            <Feather name="edit-2" size={22} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
        </View>

        <View className={`p-6 -mt-10 rounded-t-[40px] shadow-lg flex-1 ${bgCard}`}>
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 mr-4">
              <Text className={`text-3xl font-extrabold ${textMain}`}>{vehicle.vehicleBrand}</Text>
              <Text className={`text-xl font-medium mt-1 ${textSub}`}>{vehicle.vehicleModel}</Text>
              <View className="flex-row items-center mt-2">
                 <View className={`px-3 py-1 rounded-md border ${isDark ? 'bg-yellow-600 border-yellow-800' : 'bg-yellow-400 border-black'}`}>
                     <Text className={`font-bold text-xs ${isDark ? 'text-white' : 'text-black'}`}>{vehicle.numberPlate}</Text>
                 </View>
              </View>
            </View>
            <View className={`px-4 py-3 rounded-2xl items-center ${isDark ? 'bg-gray-800' : 'bg-black'}`}>
              <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-white'}`}>Rs.{vehicle.price}</Text>
              <Text className="text-gray-400 text-xs">/Day</Text>
            </View>
          </View>

          

          <View className={`flex-row justify-between p-4 rounded-2xl mb-8 border ${bgSecondary} ${borderCol}`}>
            <View className={`items-center flex-1 border-r ${borderCol}`}>
              <MaterialIcons name="event-seat" size={24} color={iconColor} />
              <Text className={`text-xs mt-1 font-medium ${textSub}`}>{vehicle.seats} Seats</Text>
            </View>
            <View className={`items-center flex-1 border-r ${borderCol}`}>
              <FontAwesome5 name="car" size={20} color={iconColor} />
              <Text className={`text-xs mt-1 font-medium ${textSub}`}>{vehicle.vehicleCategory}</Text>
            </View>
            <View className="items-center flex-1">
               <MaterialIcons name="settings" size={24} color={iconColor} />
               <Text className={`text-xs mt-1 font-medium ${textSub}`}>{vehicle.vehicleType}</Text>
            </View>
          </View>

          <Text className={`text-lg font-bold mb-3 ${textMain}`}>Vehicle Details</Text>
          <Text className={`leading-6 mb-8 text-base p-4 rounded-xl ${bgSecondary} ${textSub}`}>
             {vehicle.description}
          </Text>

          <View className={`p-4 rounded-xl mb-8 ${bgSecondary}`}>
              <Text className={`font-bold mb-2 ${textMain}`}>Technical Info</Text>
              <Text className={`text-xs ${textSub}`}>Engine No: {vehicle.engineNumber}</Text>
              <Text className={`text-xs ${textSub}`}>Chassis No: {vehicle.chassisNumber}</Text>
          </View>

          <Text className={`text-lg font-bold mb-3 ${textMain}`}>Pickup Location</Text>
          <Text className={`text-sm mb-3 ml-1 ${textSub}`}><Ionicons name="location" size={14} /> {vehicle.locationName}</Text>
          
          <View className={`h-48 w-full rounded-3xl overflow-hidden mb-8 border shadow-sm ${borderCol}`}>
            <MapView 
              style={{ flex: 1 }}
              initialRegion={{
                latitude: vehicle.latitude || 6.9271,
                longitude: vehicle.longitude || 79.8612,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
            >
              <Marker coordinate={{ latitude: vehicle.latitude || 6.9271, longitude: vehicle.longitude || 79.8612 }} />
            </MapView>
          </View>
          <View className="h-[100px]"></View>
        </View>
      </ScrollView>

      <View className={`absolute bottom-[110px] left-6 right-6 p-4 rounded-[25px] flex-row items-center justify-between shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-900'}`}>
         <View className="flex-row items-center flex-1 mr-4">
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isDark ? 'bg-gray-700' : 'bg-gray-700'}`}>
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