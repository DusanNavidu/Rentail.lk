import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getVehicleById } from '@/services/vehicleService';
import { createBooking } from '@/services/bookingService';
import { ThemeContext } from '@/context/ThemeContext';
import DateInput from '@/components/ui/DateInput';

const BookingForm = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // --- Colors ---
  const bgMain = isDark ? "bg-gray-900" : "bg-white";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200";

  // --- State ---
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Date States
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');
  
  // Calculation States
  const [totalPrice, setTotalPrice] = useState(0);
  const [days, setDays] = useState(0);

  // --- 1. Fetch Vehicle Data ---
  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
        if (typeof id === 'string') {
            const data = await getVehicleById(id);
            setVehicle(data);
        }
    } catch (error) {
        Alert.alert("Error", "Vehicle not found");
        router.back();
    } finally {
        setLoading(false);
    }
  };

  // --- 2. Calculate Totals Logic ---
  useEffect(() => {
    if (startDate && endDate && vehicle) {
      calculateTotal();
    }
  }, [startDate, endDate]);

  const calculateTotal = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid and End is after Start
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

  // --- 3. Handle Booking Submission ---
  const handleBooking = async () => {
    if (!startDate || !endDate) {
        Alert.alert("Missing Info", "Please select start and end dates.");
        return;
    }
    
    // Logic check: End date must be after start date
    if (new Date(endDate) <= new Date(startDate)) {
        Alert.alert("Invalid Dates", "End date must be after start date.");
        return;
    }

    setSubmitting(true);
    try {
        await createBooking(
            vehicle.id,
            vehicle,
            startDate,
            endDate,
            totalPrice
        );
        Alert.alert("Success! 🎉", "Your booking has been placed successfully.", [
            { text: "View Bookings", onPress: () => router.replace("/booking") }
        ]);
    } catch (error: any) {
        Alert.alert("Booking Failed", error.message);
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
    return (
        <View className={`flex-1 justify-center items-center ${bgMain}`}>
            <ActivityIndicator color="#10b981" size="large"/>
        </View>
    );
  }

  if (!vehicle) return null; // Safety check

  return (
    <View className={`flex-1 ${bgMain}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Vehicle Image Header */}
        <View className="relative">
            <Image source={{ uri: vehicle.imageUrl }} className="w-full h-64" resizeMode="cover" />
            <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-4 bg-black/50 p-2 rounded-full">
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
        </View>

        <View className="p-6">
            {/* Title & Price Per Day */}
            <Text className={`text-2xl font-extrabold ${textMain}`}>{vehicle.vehicleBrand} {vehicle.vehicleModel}</Text>
            <Text className="text-emerald-500 font-bold text-lg mt-1">Rs. {vehicle.price} / Day</Text>

            {/* Date Selection Section */}
            <View className={`mt-8 p-5 rounded-2xl border ${inputBg}`}>
                <Text className={`font-bold mb-4 text-lg ${textMain}`}>Select Dates</Text>
                
                {/* ✅ 1. Start Date Component */}
                <DateInput 
                    label="START DATE"
                    value={startDate}
                    onChange={setStartDate}
                    iconColor="#10b981" // Green
                    isDark={isDark}
                />

                {/* ✅ 2. End Date Component */}
                <DateInput 
                    label="END DATE"
                    value={endDate}
                    onChange={setEndDate}
                    iconColor="#ef4444" // Red
                    isDark={isDark}
                />
            </View>

            {/* Price Summary - ✅ SAFE RENDER */}
            {days > 0 ? (
                <View className="mt-6 flex-row justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <View>
                        <Text className="text-emerald-700 font-bold text-xs uppercase">Total Cost</Text>
                        <Text className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-black'}`}>
                            Rs. {totalPrice.toLocaleString()}
                        </Text>
                    </View>
                    <View className="bg-white px-3 py-1 rounded-lg">
                        <Text className="text-black font-bold">{days} Days</Text>
                    </View>
                </View>
            ) : null}

        </View>
      </ScrollView>

      {/* Footer Button - Fixed Position */}
      <View className={`absolute bottom-0 w-full p-4 border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <TouchableOpacity 
            onPress={handleBooking}
            disabled={submitting || days === 0}
            className={`w-full py-4 rounded-2xl items-center ${submitting || days === 0 ? 'bg-gray-500' : 'bg-emerald-500 shadow-lg shadow-emerald-500/30'}`}
        >
            {submitting ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white font-bold text-lg">Confirm Booking</Text>
            )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default BookingForm;