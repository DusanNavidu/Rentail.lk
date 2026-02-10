import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  StatusBar
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 
import DateInput from "@/components/ui/DateInput";
import { ThemeContext } from "@/context/ThemeContext";
import { createBooking, getBookingById, updateBooking } from "@/services/bookingService"; // Updated imports
import { getVehicleById } from "@/services/vehicleService";

const BookingForm = () => {
  const router = useRouter();
  
  const { id, bookingId } = useLocalSearchParams();

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [totalPrice, setTotalPrice] = useState(0);
  const [days, setDays] = useState(0);

  const themeContext = useContext(ThemeContext);
  const isDark = (themeContext as any)?.theme === 'dark'; 

  const bgMain = isDark ? "bg-gray-900" : "bg-white";
  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg = isDark ? "bg-gray-800" : "bg-gray-50";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (id && typeof id === 'string') {
            const vData = await getVehicleById(id);
            setVehicle(vData);
        }

        if (bookingId && typeof bookingId === 'string') {
            const bData: any = await getBookingById(bookingId);
            setStartDate(bData.startDate);
            setEndDate(bData.endDate);
        }

      } catch (error) {
        Alert.alert("Error", "Could not load details.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, bookingId]);

  useEffect(() => {
    if (startDate && endDate && vehicle) {
      calculateTotal();
    }
  }, [startDate, endDate, vehicle]);

  const calculateTotal = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setDays(diffDays);
      setTotalPrice(diffDays * Number(vehicle.price));
    } else {
      setDays(0);
      setTotalPrice(0);
    }
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      Alert.alert("Missing Dates", "Please select both start and end dates.");
      return;
    }

    if (days <= 0) {
      Alert.alert("Invalid Dates", "End date must be after start date.");
      return;
    }

    setSubmitting(true);
    try {
      if (bookingId && typeof bookingId === 'string') {
        await updateBooking(
            bookingId,
            startDate,
            endDate,
            totalPrice
        );
        Alert.alert("Updated!", "Booking details updated successfully.", [
            { text: "OK", onPress: () => router.replace("/booking") },
        ]);

      } else {
        await createBooking(
            vehicle.id,
            vehicle,
            startDate,
            endDate,
            totalPrice
        );
        Alert.alert("Success!", "Your booking has been placed.", [
            { text: "View Bookings", onPress: () => router.replace("/booking") },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${bgMain}`}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!vehicle) return null;

  return (
    <View className={`flex-1 ${bgMain}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        <View className="relative w-full h-72">
            <Image 
                source={{ uri: vehicle.imageUrl }} 
                className="w-full h-full"
                resizeMode="cover"
            />
            <TouchableOpacity 
                onPress={() => router.back()} 
                className="absolute top-12 left-4 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full justify-center items-center"
            >
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View className={`absolute bottom-0 w-full h-20 ${isDark ? 'bg-gray-900' : 'bg-white'} opacity-10`} style={{ transform: [{scaleY: -1}] }} />
        </View>

        <View className={`flex-1 px-6 -mt-6 rounded-t-3xl ${bgMain} pt-8`}>
            
            <View className="mb-6">
                <Text className={`text-3xl font-extrabold ${textMain}`}>
                    {vehicle.vehicleBrand} {vehicle.vehicleModel}
                </Text>
                <View className="flex-row items-baseline mt-1">
                    <Text className="text-emerald-500 text-xl font-bold">Rs. {vehicle.price}</Text>
                    <Text className={`text-sm ml-1 ${textSub}`}>/ per day</Text>
                </View>
            </View>

            <View className={`p-5 rounded-2xl border ${cardBg} ${borderColor}`}>
                <Text className={`font-bold mb-4 text-lg ${textMain}`}>
                    {bookingId ? "Edit Trip Dates" : "Trip Dates"}
                </Text>

                <DateInput
                    label="START DATE"
                    value={startDate}
                    onChange={setStartDate}
                    iconColor="#10b981"
                    isDark={isDark}
                />

                <DateInput
                    label="END DATE"
                    value={endDate}
                    onChange={setEndDate}
                    iconColor="#ef4444"
                    isDark={isDark}
                />
            </View>

            {days > 0 && (
                <View className="mt-6 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                    <Text className="font-bold text-lg text-emerald-700 dark:text-emerald-400 mb-3">
                        {bookingId ? "New Summary" : "Payment Summary"}
                    </Text>
                    
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500 dark:text-gray-400">Duration</Text>
                        <Text className={`font-bold ${textMain}`}>{days} Days</Text>
                    </View>
                    
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-500 dark:text-gray-400">Rate</Text>
                        <Text className={`font-bold ${textMain}`}>Rs. {vehicle.price} x {days}</Text>
                    </View>

                    <View className="h-[1px] w-full bg-emerald-200 dark:bg-emerald-800 border-dashed border-b mb-4" />

                    <View className="flex-row justify-between items-center">
                        <Text className={`text-xl font-extrabold ${textMain}`}>Total</Text>
                        <Text className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            Rs. {totalPrice.toLocaleString()}
                        </Text>
                    </View>
                </View>
            )}
            <View className={`w-full p-5 border-t ${bgMain} ${borderColor} pb-8 shadow-2xl`}>
                <TouchableOpacity
                    onPress={handleBooking}
                    disabled={submitting || days <= 0}
                    className={`w-full py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-emerald-500/30 ${
                        submitting || days <= 0 ? "bg-gray-300 dark:bg-gray-700" : "bg-black dark:bg-emerald-500"
                    }`}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg tracking-wide">
                            {days > 0 
                                ? (bookingId ? `Update • Rs. ${totalPrice.toLocaleString()}` : `Confirm • Rs. ${totalPrice.toLocaleString()}`)
                                : "Select Dates"}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default BookingForm;