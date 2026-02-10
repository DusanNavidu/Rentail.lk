import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { updateBookingStatus } from '@/services/bookingService';

interface IncomingBookingCardProps {
  item: any;
  isDark: boolean;
  onUpdate: () => void; // Callback to refresh list after update
}

const IncomingBookingCard = ({ item, isDark, onUpdate }: IncomingBookingCardProps) => {
  const [loading, setLoading] = useState(false);
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await updateBookingStatus(item.id, status);
      onUpdate(); // Refresh the list
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isPending = item.status === 'pending';

  return (
    <View className={`mb-4 rounded-2xl p-4 ${cardBg} shadow-sm`}>
      <View className="flex-row">
        <Image
          source={{ uri: item.vehicleImage }}
          className="w-16 h-16 rounded-xl bg-gray-300"
          resizeMode="cover"
        />
        <View className="ml-4 flex-1">
          <Text className={`font-bold text-lg ${textMain}`}>
            {item.vehicleBrand} {item.vehicleModel}
          </Text>
          <Text className={`text-sm ${textSub}`}>
            Booked by: <Text className="font-bold">{item.customerName}</Text>
          </Text>
          <Text className={`text-xs mt-1 ${textSub}`}>
            {item.startDate} ➔ {item.endDate}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        <Text className="text-emerald-500 font-extrabold text-base">
          Earn: Rs. {item.totalPrice}
        </Text>

        {loading ? (
          <ActivityIndicator size="small" color="#10b981" />
        ) : isPending ? (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleStatusUpdate('rejected')}
              className="px-4 py-2 bg-red-100 rounded-lg"
            >
              <Text className="text-red-600 font-bold text-xs">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleStatusUpdate('approved')}
              className="px-4 py-2 bg-emerald-100 rounded-lg"
            >
              <Text className="text-emerald-600 font-bold text-xs">Accept</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className={`px-3 py-1 rounded-full ${item.status === 'approved' ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-bold capitalize ${item.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
              {item.status}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default IncomingBookingCard;