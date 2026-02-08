import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, Animated, Image, Dimensions } from "react-native";
import React, { useCallback, useState, useContext, useRef, useEffect } from "react";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useLoader } from "@/hooks/useLoader";
import { deleteVehicle, getAllVehicles } from "@/services/vehicleService";
import Toast from 'react-native-toast-message';
import { ThemeContext } from "@/context/ThemeContext";
import { LinearGradient } from 'expo-linear-gradient';
import VehicleCard from '@/components/ui/vehicleCard'; 

const VehicleList = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // --- 🔥 ANIMATION LOGIC FOR ADD BUTTON (SUBTLE PULSE) ---
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // --- Dynamic Colors ---
  const bgMain = isDark ? "#111827" : "#F3F4F6"; // Darker background for premium feel
  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";

  useEffect(() => {
    // Smooth Pulse Animation
    Animated.loop(
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
    ).start();
  }, []);

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
            Toast.show({ type: 'success', text1: 'Deleted Successfully!' }); 
          }
          catch { Toast.show({ type: 'error', text1: 'Failed to delete' }); }
          finally { hideLoader(); }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <VehicleCard 
        item={item} 
        isDark={isDark} 
        isFullWidth={true}
        borderCol={isDark ? "border-gray-700" : "border-gray-200"}
        isOwner={true} 
        onEdit={() => router.push({ pathname: "/add/form", params: { editId: item.id } })}
        onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: bgMain }}>
      
      {/* --- PREMIUM HEADER --- */}
      <View className="mb-4">
          <LinearGradient
            colors={isDark ? ['#1f2937', '#111827'] : ['#ffffff', '#e5e7eb']}
            style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}
          >
            <View style={{ position: 'absolute', right: -30, top: 20, opacity: 0.05 }}>
                <MaterialCommunityIcons name="car-sports" size={180} color={isDark ? "white" : "black"} />
            </View>

            <View className="flex-row justify-between items-center">
                <View>
                    <Text className={`text-3xl font-extrabold ${textMain}`}>My Garage 🚗</Text>
                    <Text className={`text-sm ${textSub} mt-1 font-medium`}>Manage your fleet</Text>
                </View>
                <TouchableOpacity onPress={() => fetchVehicles(true)} className={`p-3 rounded-full ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <Ionicons name="reload" size={20} color={isDark ? "#34d399" : "#059669"} />
                </TouchableOpacity>
            </View>

            {/* --- 🔥 NEW PREMIUM ADD BUTTON 🔥 --- */}
            <Animated.View 
              style={{
                marginTop: 20,
                transform: [{ scale: scaleAnim }]
              }}
            >
              <TouchableOpacity 
                  onPress={() => router.push("/add/form")} 
                  activeOpacity={0.9}
                  style={{ 
                      shadowColor: isDark ? "#000" : "#059669",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.4,
                      shadowRadius: 10,
                      elevation: 10
                  }}
              >
                  <LinearGradient
                      colors={['#10b981', '#047857']} // Beautiful Green Gradient
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      className="h-16 px-8 rounded-full flex-row items-center justify-center border-t border-white/20"
                  >
                      <View className="bg-white/20 p-1.5 rounded-full mr-3">
                          <Ionicons name="add" size={24} color="white" />
                      </View>
                      <Text className="text-white font-extrabold text-base tracking-wider uppercase">
                          Add New Vehicle
                      </Text>
                  </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
      </View>
      
      {/* --- CONTENT LIST --- */}
      {loadingData ? (
          <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={isDark ? "#10b981" : "#059669"} />
              <Text className={`mt-4 text-xs font-medium ${textSub}`}>Loading your garage...</Text>
          </View>
      ) : (
          <FlatList 
            data={vehicles} 
            keyExtractor={i => i.id} 
            renderItem={renderItem} 
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150 }} 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "white" : "black"} />} 
            ListEmptyComponent={
                <View className="mt-16 items-center justify-center">
                    <View className={`p-6 rounded-full mb-4 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                        <MaterialCommunityIcons name="car-off" size={60} color={isDark ? "#4b5563" : "#d1d5db"} />
                    </View>
                    <Text className={`text-xl font-bold ${textMain}`}>No Vehicles Found</Text>
                    <Text className={`text-sm text-center px-10 mt-2 leading-5 ${textSub}`}>
                        You haven't listed any vehicles yet. Tap the button below to start earning!
                    </Text>
                </View>
            }
          />
      )}
      
    </View>
  );
};

export default VehicleList;