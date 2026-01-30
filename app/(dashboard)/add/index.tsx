import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl, // ✅ Pull-to-refresh සඳහා
} from "react-native";
import React, { useCallback, useState } from "react";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useLoader } from "@/hooks/useLoader";
// ඔයාගේ Service path එක හරිද බලන්න
import { deleteVehicle, getAllVehicles } from "@/services/vehicleService";

const VehicleList = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false); // ✅ Refresh State
  const [loadingData, setLoadingData] = useState(true); // ✅ Initial Loading State

  // Data Fetching Function
  const fetchVehicles = async () => {
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (error) {
      console.log("Error fetching vehicles:", error);
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  // Screen එකට එන හැම වෙලේම Data update වෙනවා
  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [])
  );

  // පහළට අදිනකොට Refresh වෙන්න
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVehicles();
  }, []);

  // Delete Function
  const handleDelete = (id: string) => {
    Alert.alert("Delete Vehicle", "Are you sure you want to remove this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          showLoader();
          try {
            await deleteVehicle(id);
            // List එකෙන් අයින් කරන්න ආයේ fetch නොකර (Optimistic update)
            setVehicles((prev) => prev.filter((item) => item.id !== id));
            Alert.alert("Deleted", "Vehicle removed successfully");
          } catch {
            Alert.alert("Error", "Could not delete");
          } finally {
            hideLoader();
          }
        },
      },
    ]);
  };

  // Card UI Component
  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-2xl mb-5 shadow-sm border border-gray-100 overflow-hidden">
      {/* Vehicle Image (Cloudinary URL) */}
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/300" }}
        className="w-full h-48 bg-gray-200"
        resizeMode="cover"
      />
      
      {/* Price Badge */}
      <View className="absolute top-3 right-3 bg-black/80 px-3 py-1 rounded-full">
        <Text className="text-white font-bold text-xs">Rs. {item.price}/Day</Text>
      </View>

      <View className="p-4">
        {/* Title & Delete */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {item.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="gray" />
              <Text className="text-gray-500 text-xs ml-1">{item.location}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => handleDelete(item.id)} 
            className="p-2 bg-red-50 rounded-full"
          >
            <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Features Row */}
        <View className="flex-row gap-3 mt-2 border-t border-gray-100 pt-3">
            <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <MaterialIcons name="event-seat" size={14} color="#4b5563" />
                <Text className="text-xs text-gray-600 ml-1.5 font-medium">{item.seats} Seats</Text>
            </View>
            <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <FontAwesome5 name="car" size={12} color="#4b5563" />
                <Text className="text-xs text-gray-600 ml-2 font-medium">Vehicle</Text>
            </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-4 pt-14 pb-4 border-b border-gray-200 flex-row justify-between items-center shadow-sm z-10">
         <Text className="text-2xl font-extrabold text-gray-900">My Vehicles</Text>
         <TouchableOpacity 
            onPress={() => {
                setLoadingData(true);
                fetchVehicles();
            }}
            className="bg-gray-100 p-2 rounded-full"
         >
            <Ionicons name="reload" size={20} color="black" />
         </TouchableOpacity>
      </View>

      {/* List Area */}
      {loadingData ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="black" />
            <Text className="text-gray-400 mt-2 text-sm">Loading vehicles...</Text>
        </View>
      ) : (
        <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={ // ✅ Pull to Refresh Component
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
                <View className="items-center justify-center mt-20 opacity-50">
                    <View className="bg-gray-200 p-6 rounded-full mb-4">
                        <FontAwesome5 name="car-side" size={40} color="#9ca3af" />
                    </View>
                    <Text className="text-gray-500 font-semibold text-lg">No vehicles found</Text>
                    <Text className="text-gray-400 text-sm mt-1">Add a new vehicle to get started</Text>
                </View>
            }
        />
      )}

      {/* Floating Action Button (Add) */}
      <TouchableOpacity
        className="bg-black rounded-full shadow-xl absolute bottom-[110px] right-6 w-16 h-16 justify-center items-center z-50 border-2 border-white"
        onPress={() => router.push("/add/form")} // පරණ path එකම තියලා තියෙන්නේ
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default VehicleList;