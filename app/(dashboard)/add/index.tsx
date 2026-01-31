import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, RefreshControl } from "react-native";
import React, { useCallback, useState } from "react";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useLoader } from "@/hooks/useLoader";
import { deleteVehicle, getAllVehicles } from "@/services/vehicleService";
import Toast from 'react-native-toast-message';

const VehicleList = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const fetchVehicles = async () => {
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load vehicles' });
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchVehicles(); }, []));
  const onRefresh = useCallback(() => { setRefreshing(true); fetchVehicles(); }, []);

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          showLoader();
          try { await deleteVehicle(id); setVehicles(prev => prev.filter(i => i.id !== id)); Toast.show({ type: 'success', text1: 'Deleted!' }); }
          catch { Toast.show({ type: 'error', text1: 'Failed to delete' }); }
          finally { hideLoader(); }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => router.push({ pathname: "/add/[id]", params: { id: item.id } })} // ✅ View Page Link
      className="bg-white rounded-2xl mb-5 shadow-sm border border-gray-100 overflow-hidden"
    >
      <Image source={{ uri: item.imageUrl }} className="w-full h-48 bg-gray-200" resizeMode="cover" />
      <View className="absolute top-3 right-3 bg-black/80 px-3 py-1 rounded-full"><Text className="text-white font-bold text-xs">Rs. {item.price}/Day</Text></View>
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-2">
                <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>{item.vehicleBrand} {item.vehicleModel}</Text>
                <View className="flex-row items-center mt-1"><Ionicons name="location-outline" size={14} color="gray" /><Text className="text-gray-500 text-xs ml-1">{item.locationName}</Text></View>
            </View>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 bg-red-50 rounded-full">
                <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
        <View className="flex-row gap-3 mt-2 border-t border-gray-100 pt-3">
             <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-lg"><MaterialIcons name="event-seat" size={14} color="#4b5563" /><Text className="text-xs text-gray-600 ml-1.5">{item.seats} Seats</Text></View>
             <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-lg"><FontAwesome5 name="car" size={12} color="#4b5563" /><Text className="text-xs text-gray-600 ml-2">{item.vehicleCategory}</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 pt-14 pb-4 border-b border-gray-200 flex-row justify-between items-center shadow-sm z-10">
         <Text className="text-2xl font-extrabold text-gray-900">My Vehicles</Text>
         <TouchableOpacity onPress={onRefresh} className="bg-gray-100 p-2 rounded-full"><Ionicons name="reload" size={20} color="black" /></TouchableOpacity>
      </View>
      {loadingData ? <ActivityIndicator size="large" color="black" className="mt-10" /> : <FlatList data={vehicles} keyExtractor={i => i.id} renderItem={renderItem} contentContainerStyle={{ padding: 20 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} />}
      <TouchableOpacity onPress={() => router.push("/add/form")} className="bg-black rounded-full shadow-xl absolute bottom-[110px] right-6 w-16 h-16 justify-center items-center z-50 border-2 border-white"><MaterialIcons name="add" size={32} color="#fff" /></TouchableOpacity>
    </View>
  );
};
export default VehicleList;