import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { getUserBookings } from '@/services/bookingService';
import { ThemeContext } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BookingList = () => {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // --- Colors ---
  const bgMain = isDark ? "bg-gray-900" : "bg-gray-50";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    const data = await getUserBookings();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, []);

  // Status Badge Helper
  const getStatusColor = (status: string) => {
    switch(status) {
        case 'approved': return 'bg-green-500';
        case 'rejected': return 'bg-red-500';
        default: return 'bg-yellow-500';
    }
  };

  return (
    <View className={`flex-1 ${bgMain} pt-12 px-4`}>
        <View className="flex-row items-center justify-between mb-6">
            <Text className={`text-2xl font-extrabold ${textMain}`}>My Bookings</Text>
            <TouchableOpacity onPress={fetchBookings}>
                <Ionicons name="refresh" size={24} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
        </View>

        {loading ? (
            <ActivityIndicator size="large" color="#10b981" className="mt-10" />
        ) : bookings.length === 0 ? (
            <View className="flex-1 justify-center items-center">
                <Text className={textSub}>No bookings found.</Text>
                <TouchableOpacity onPress={() => router.push("/home")} className="mt-4">
                    <Text className="text-emerald-500 font-bold">Find a car</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <FlatList
                data={bookings}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View className={`mb-4 rounded-2xl p-4 flex-row ${cardBg} shadow-sm`}>
                        {/* Image */}
                        <Image 
                            source={{ uri: item.vehicleImage }} 
                            className="w-20 h-20 rounded-xl bg-gray-300" 
                            resizeMode="cover" 
                        />
                        
                        {/* Details */}
                        <View className="ml-4 flex-1 justify-between">
                            <View>
                                <View className="flex-row justify-between items-start">
                                    <Text className={`font-bold text-lg ${textMain}`} numberOfLines={1}>
                                        {item.vehicleBrand} {item.vehicleModel}
                                    </Text>
                                    <View className={`px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                                        <Text className="text-[10px] font-bold text-white uppercase">{item.status}</Text>
                                    </View>
                                </View>
                                <Text className={`text-xs mt-1 ${textSub}`}>
                                    {item.startDate}  ➔  {item.endDate}
                                </Text>
                            </View>
                            
                            <View className="flex-row justify-between items-end">
                                <Text className="text-emerald-500 font-extrabold text-base">
                                    Rs. {item.totalPrice}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            />
        )}
    </View>
  )
}

export default BookingList;