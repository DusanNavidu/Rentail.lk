import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { deleteBooking } from '@/services/bookingService';
import { useRouter } from 'expo-router';

interface BookingCardProps {
  item: any;
  isDark: boolean;
  onUpdate: () => void;
}

const BookingCard = ({ item, isDark, onUpdate }: BookingCardProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking", 
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteBooking(item.id);
              onUpdate();
            } catch (error) {
              Alert.alert("Error", "Failed to cancel booking.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    router.push({
        pathname: "/booking/[id]",
        params: { id: item.vehicleId, bookingId: item.id }
    });
  };

  const isPending = item.status === 'pending';

  return (
    <View className={`mb-4 rounded-2xl p-4 ${cardBg} shadow-sm`}>
      <View className="flex-row">
        <Image
          source={{ uri: item.vehicleImage }}
          className="w-20 h-20 rounded-xl bg-gray-300"
          resizeMode="cover"
        />
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
              {item.startDate} ➔ {item.endDate}
            </Text>
          </View>
          <Text className="text-emerald-500 font-extrabold text-base">
            Rs. {item.totalPrice}
          </Text>
        </View>
      </View>

      {isPending && (
        <View className="flex-row gap-3 mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 justify-end">
            
            <TouchableOpacity 
                onPress={handleEdit}
                className="flex-row items-center bg-blue-100 px-3 py-2 rounded-lg"
            >
                <Feather name="edit-2" size={14} color="#2563eb" />
                <Text className="text-blue-600 font-bold text-xs ml-1">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={handleCancel}
                disabled={loading}
                className="flex-row items-center bg-red-100 px-3 py-2 rounded-lg"
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                    <>
                        <Feather name="trash-2" size={14} color="#dc2626" />
                        <Text className="text-red-600 font-bold text-xs ml-1">Cancel</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default BookingCard;