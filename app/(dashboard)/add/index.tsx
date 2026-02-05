import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, RefreshControl } from "react-native";
import React, { useCallback, useState, useContext } from "react";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useLoader } from "@/hooks/useLoader";
import { deleteVehicle, getAllVehicles } from "@/services/vehicleService";
import Toast from 'react-native-toast-message';
import { ThemeContext } from "@/context/ThemeContext";

const VehicleList = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // --- Dynamic Colors ---
  const bgMain = isDark ? "bg-gray-900" : "bg-gray-50";
  const bgCard = isDark ? "bg-gray-800" : "bg-white";
  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-gray-400" : "text-gray-600";
  const borderCol = isDark ? "border-gray-700" : "border-gray-100";
  const iconColor = isDark ? "#9ca3af" : "#4b5563";
  const headerBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  const fetchVehicles = async (isRefreshing = false) => {
    if (!isRefreshing) setLoadingData(true); 
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

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVehicles(true);
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          showLoader();
          try { 
            await deleteVehicle(id); 
            setVehicles(prev => prev.filter(i => i.id !== id)); 
            Toast.show({ type: 'success', text1: 'Deleted!' }); 
          }
          catch { Toast.show({ type: 'error', text1: 'Failed to delete' }); }
          finally { hideLoader(); }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => router.push({ pathname: "/add/[id]", params: { id: item.id } })} 
      className={`${bgCard} rounded-2xl mb-5 shadow-sm border ${borderCol} overflow-hidden`}
    >
      <Image source={{ uri: item.imageUrl }} className="w-full h-48 bg-gray-200" resizeMode="cover" />
      <View className="absolute top-3 right-3 bg-black/80 px-3 py-1 rounded-full"><Text className="text-white font-bold text-xs">Rs. {item.price}/Day</Text></View>
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-2">
                <Text className={`text-lg font-bold ${textMain}`} numberOfLines={1}>{item.vehicleBrand} {item.vehicleModel}</Text>
                <View className="flex-row items-center mt-1"><Ionicons name="location-outline" size={14} color={isDark ? "#9ca3af" : "gray"} /><Text className={`text-xs ml-1 ${textSub}`}>{item.locationName}</Text></View>
            </View>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDelete(item.id); }} className={`p-2 rounded-full ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
        <View className={`flex-row gap-3 mt-2 border-t pt-3 ${borderCol}`}>
             <View className={`flex-row items-center px-3 py-1.5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <MaterialIcons name="event-seat" size={14} color={iconColor} />
                <Text className={`text-xs ml-1.5 ${textSub}`}>{item.seats} Seats</Text>
             </View>
             <View className={`flex-row items-center px-3 py-1.5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <FontAwesome5 name="car" size={12} color={iconColor} />
                <Text className={`text-xs ml-2 ${textSub}`}>{item.vehicleCategory}</Text>
             </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 ${bgMain}`}>
      <View className={`p-4 pt-14 pb-4 border-b flex-row justify-between items-center shadow-sm z-10 ${headerBg}`}>
         <Text className={`text-2xl font-extrabold ${textMain}`}>My Vehicles</Text>
         <TouchableOpacity onPress={() => fetchVehicles(true)} className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Ionicons name="reload" size={20} color={isDark ? "white" : "black"} />
         </TouchableOpacity>
      </View>
      
      {loadingData ? (
          <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={isDark ? "white" : "black"} />
          </View>
      ) : (
          <FlatList 
            data={vehicles} 
            keyExtractor={i => i.id} 
            renderItem={renderItem} 
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }} 
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "white" : "black"} />} 
            ListEmptyComponent={
                <View className="mt-10 items-center">
                    <Text className={textSub}>No vehicles found.</Text>
                </View>
            }
          />
      )}
      
      <TouchableOpacity 
        onPress={() => router.push("/add/form")} 
        className={`rounded-[20px] shadow-xl absolute bottom-[130px] right-6 w-24 h-10 justify-center items-center z-50 border-2 ${isDark ? 'bg-white border-black' : 'bg-black border-white'}`}
      >
        <Text className="font-bold text-lg ${isDark ? 'border border-gray-200' : 'border border-gray-700'}`">Add +</Text>
      </TouchableOpacity>
    </View>
  );
};
export default VehicleList;