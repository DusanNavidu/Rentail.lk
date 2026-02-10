import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { getUserBookings, getOwnerBookings } from '@/services/bookingService';
import { ThemeContext } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BookingCard from '@/components/ui/BookingCard';
import IncomingBookingCard from '@/components/ui/IncomingBookingCard';

const BookingList = () => {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // --- States ---
  const [activeTab, setActiveTab] = useState<'my_trips' | 'incoming'>('my_trips');
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [incomingBookings, setIncomingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Colors ---
  const bgMain = isDark ? "bg-gray-900" : "bg-gray-50";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";

  const fetchAllData = async () => {
    setLoading(true);
    const [userData, ownerData] = await Promise.all([
      getUserBookings(),
      getOwnerBookings()
    ]);
    
    setMyBookings(userData);
    setIncomingBookings(ownerData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, []);

  const TabButton = ({ title, id }: { title: string, id: 'my_trips' | 'incoming' }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(id)}
      className={`flex-1 py-3 items-center border-b-2 ${
        activeTab === id 
          ? 'border-emerald-500' 
          : 'border-transparent'
      }`}
    >
      <Text className={`font-bold ${
        activeTab === id 
          ? 'text-emerald-500' 
          : textSub
      }`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 ${bgMain} pt-12`}>
      <View className="px-4 mb-2 flex-row justify-between items-center">
        <Text className={`text-2xl font-extrabold ${textMain}`}>Bookings</Text>
        <TouchableOpacity onPress={fetchAllData}>
          <Ionicons name="refresh" size={24} color={isDark ? "white" : "black"} />
        </TouchableOpacity>
      </View>

      <View className={`flex-row mb-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <TabButton title="My Trips" id="my_trips" />
        <TabButton title="My Car Requests" id="incoming" />
      </View>

      <View className="flex-1 px-4">
        {loading ? (
          <ActivityIndicator size="large" color="#10b981" className="mt-10" />
        ) : (
          <FlatList
            data={activeTab === 'my_trips' ? myBookings : incomingBookings}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center mt-20">
                <Text className={textSub}>
                  {activeTab === 'my_trips' 
                    ? "You haven't booked any cars yet." 
                    : "No booking requests for your cars yet."}
                </Text>
                {activeTab === 'my_trips' && (
                  <TouchableOpacity onPress={() => router.push("/home")} className="mt-4">
                    <Text className="text-emerald-500 font-bold">Find a car</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            renderItem={({ item }) => (
              activeTab === 'my_trips' ? (
                <BookingCard 
                    item={item} 
                    isDark={isDark} 
                    onUpdate={fetchAllData} 
                />
              ) : (
                <IncomingBookingCard 
                  item={item} 
                  isDark={isDark} 
                  onUpdate={fetchAllData} 
                />
              )
            )}
          />
        )}
      </View>
    </View>
  );
};

export default BookingList;