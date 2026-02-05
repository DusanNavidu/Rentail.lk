import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  RefreshControl,
  ImageBackground
} from 'react-native';
import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { Ionicons, EvilIcons, MaterialIcons, FontAwesome5, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { getAllVehicles } from '@/services/vehicleService';
import { AuthContext } from '@/context/AuthContext';
import { ThemeContext } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';

const CATEGORIES = [
  { id: 'All', name: 'All', iconName: 'grid-outline', Library: Ionicons },
  { id: 'Car', name: 'Car', iconName: 'car-sport', Library: Ionicons },
  { id: 'Van', name: 'Van', iconName: 'shuttle-van', Library: FontAwesome5 },
  { id: 'Jeep', name: 'Jeep', iconName: 'car-estate', Library: MaterialCommunityIcons }, 
  { id: 'Bike', name: 'Bike', iconName: 'motorcycle', Library: FontAwesome5 },
  { id: 'Three Wheel', name: 'Tuk', iconName: 'rickshaw', Library: MaterialCommunityIcons },
  { id: 'Truck', name: 'Truck', iconName: 'truck', Library: Feather },
  { id: 'Bus', name: 'Bus', iconName: 'bus', Library: FontAwesome5 },
];

const BRANDS = [
  { id: 'All', name: 'All' }, { id: 'Toyota', name: 'Toyota' }, { id: 'Nissan', name: 'Nissan' },
  { id: 'Honda', name: 'Honda' }, { id: 'Suzuki', name: 'Suzuki' }, { id: 'Mitsubishi', name: 'Mitsubishi' },
  { id: 'BMW', name: 'BMW' }, { id: 'Benz', name: 'Benz' }, { id: 'Audi', name: 'Audi' },
  { id: 'Land Rover', name: 'Land Rover' }, { id: 'Kia', name: 'Kia' },
];

const SEAT_OPTIONS = [2, 4, 5, 7, 10, 15];

const Home = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext); 
  const isDark = theme === 'dark';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // --- Dynamic Colors ---
  const bgMain = isDark ? "bg-gray-900" : "bg-white";
  const bgCard = isDark ? "bg-gray-800" : "bg-white";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const borderCol = isDark ? "border-gray-700" : "border-gray-200";
  const inputBg = isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200";
  const iconColor = isDark ? "white" : "black";
  const placeholderColor = isDark ? "#9ca3af" : "#6b7280";

  // Data States
  const [allData, setAllData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [nearbyVehicles, setNearbyVehicles] = useState<any[]>([]);
  const [bestCars, setBestCars] = useState<any[]>([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  
  // Modal & Loading
  const [modalVisible, setModalVisible] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await fetchLocationAndData();
    setLoading(false);
  };

  const fetchLocationAndData = async () => {
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);
        }
    } catch (error) { console.log("Location Error:", error); }

    try {
      const data = await getAllVehicles();
      setAllData(data);
    } catch (e) { console.log("Fetch Error:", e); } 
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLocationAndData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let result = allData;
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(v => v.vehicleBrand?.toLowerCase().includes(q) || v.vehicleModel?.toLowerCase().includes(q));
    }
    if (selectedBrand !== 'All') result = result.filter(v => v.vehicleBrand === selectedBrand);
    if (selectedCategory !== 'All') result = result.filter(v => v.vehicleCategory === selectedCategory);
    if (priceMin) result = result.filter(v => Number(v.price) >= Number(priceMin));
    if (priceMax) result = result.filter(v => Number(v.price) <= Number(priceMax));
    if (selectedSeats) result = result.filter(v => Number(v.seats) === selectedSeats);
    setFilteredData(result);
  }, [allData, searchQuery, selectedBrand, selectedCategory, priceMin, priceMax, selectedSeats]);

  useEffect(() => {
    if (userLocation && allData.length > 0) {
        const nearby = allData.map((v) => {
            if (!v.latitude || !v.longitude) return null; 
            const dist = getDistanceFromLatLonInKm(userLocation.coords.latitude, userLocation.coords.longitude, v.latitude, v.longitude);
            return { ...v, distance: dist };
        }).filter((v) => v !== null && v.distance <= 20).sort((a, b) => a!.distance - b!.distance); 
        setNearbyVehicles(nearby as any[]);
    } else { setNearbyVehicles([]); }

    const best = allData.filter(v => v.vehicleCategory === 'Car' && (Number(v.price) > 15000 || v.vehicleType === 'Sports' || v.vehicleType === 'Luxury'));
    setBestCars(best.slice(0, 5));
  }, [filteredData, userLocation, allData]);

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; var dLat = deg2rad(lat2 - lat1); var dLon = deg2rad(lon2 - lon1); 
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; 
  }
  function deg2rad(deg: number) { return deg * (Math.PI / 180) }

  const resetFilters = () => { setPriceMin(''); setPriceMax(''); setSelectedSeats(null); setModalVisible(false); }

  const VehicleCard = ({ item, width = 280, showDistance = false, isFullWidth = false }: any) => (
    <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: "/add/[id]", params: { id: item.id } })}
        className={`rounded-3xl shadow-sm border ${borderCol} overflow-hidden mb-6 ${isFullWidth ? 'w-full' : ''}`}
        style={{ width: isFullWidth ? '100%' : width, backgroundColor: isDark ? '#1f2937' : '#ffffff' }}
    >
        <ImageBackground source={{ uri: item.imageUrl }} className="w-full h-64 justify-end" resizeMode="cover">
            
            <LinearGradient
                colors={['transparent', isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)']}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' }}
            />

            <View className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-full shadow-md">
                <Text className="text-black font-extrabold text-sm">Rs.{item.price}<Text className="text-xs font-normal">/day</Text></Text>
            </View>

            <View className="p-5">
                <View className="flex-row justify-between items-end mb-2">
                    <View>
                        <Text className="text-white text-2xl font-extrabold shadow-sm" numberOfLines={1}>{item.vehicleBrand} {item.vehicleModel}</Text>
                        <Text className="text-gray-300 text-xs font-bold uppercase tracking-widest mt-1">{item.vehicleCategory} • {item.seats} Seats</Text>
                    </View>
                    
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity 
                            onPress={() => router.push({ pathname: "/add/[id]", params: { id: item.id } })}
                            className="bg-green-600/40 flex-row items-center px-5 py-2.5 rounded-full shadow-lg shadow-green-900/30 border border-white/20"
                        >
                            <Image 
                                source={require("../../assets/app_image/appointment.png")}
                                className="w-6 h-6 mr-2"
                                resizeMode="contain"
                                style={{ tintColor: 'white' }}
                            />
                            
                            {/* Text */}
                            <Text className="text-white font-extrabold text-sm uppercase shadow-sm">
                                Booking
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {showDistance && item.distance !== undefined && (
                    <View className="flex-row items-center mt-1 bg-black/40 self-start px-2 py-1 rounded-lg border border-white/20">
                        <Ionicons name="location" size={12} color="#4ade80" />
                        <Text className="text-white text-xs ml-1 font-bold">
                            {item.distance < 1 ? "Nearby" : `${item.distance.toFixed(1)} km`}
                        </Text>
                    </View>
                )}
            </View>
        </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className={`flex-1 ${bgMain}`}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={iconColor} />}>
        
        {/* HEADER */}
        <View className='px-6 flex flex-row mt-4 justify-between items-center'>
          <View className='flex flex-row items-center gap-2'>
            <Image source={require("../../assets/images/icon.png")} className={`w-10 h-10 bg-white rounded-full p-4 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} resizeMode="contain" />
            <Text className={`text-2xl font-extrabold tracking-tight ${textMain}`}>Rentail<Text className="text-red-600">.</Text>lk</Text>
          </View>
          <TouchableOpacity className={`p-2 rounded-full border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
             <Ionicons name="notifications-outline" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        <View className='px-6 mt-6 flex-row justify-between items-center'>
          <View className="flex-1 mr-4">
             <Text className={`${textSub} font-medium text-sm`}>Hello, <Text className={`font-bold ${textMain}`}>{user?.displayName || "Guest"} 👋</Text></Text>
             <Text className={`text-3xl font-extrabold mt-1 leading-tight ${textMain}`}>Find your dream car</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)} className={`w-14 h-14 rounded-2xl items-center justify-center shadow-lg ${isDark ? 'bg-gray-800' : 'bg-black'}`}>
             <Ionicons name="options-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* BRANDS */}
        <View className='mt-6'>
          <FlatList horizontal data={BRANDS} keyExtractor={i => i.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedBrand(item.id)} className={`items-center px-4 py-2 rounded-full border ${selectedBrand === item.id ? (isDark ? 'bg-white border-white' : 'bg-black border-black') : (isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}`}>
                <Text className={`font-semibold ${selectedBrand === item.id ? (isDark ? 'text-black' : 'text-white') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* CATEGORIES */}
        <View className='mt-6'>
            <FlatList horizontal data={CATEGORIES} keyExtractor={i => i.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 15 }}
                renderItem={({ item }) => {
                    const IconLibrary = item.Library;
                    return (
                        <TouchableOpacity onPress={() => setSelectedCategory(item.id)} className="items-center">
                            <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 ${selectedCategory === item.id ? (isDark ? 'bg-white' : 'bg-black') : (isDark ? 'bg-gray-900' : 'bg-gray-100')}`}>
                                <IconLibrary name={item.iconName} size={24} color={selectedCategory === item.id ? (isDark ? 'black' : 'white') : (isDark ? 'white' : 'gray')} />
                            </View>
                            <Text className={`text-xs font-medium ${selectedCategory === item.id ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-gray-500' : 'text-gray-500')}`}>{item.name}</Text>
                        </TouchableOpacity>
                    )
                }}
            />
        </View>

        {/* LOADING & CONTENT */}
        {loading ? <ActivityIndicator size="large" color={iconColor} className="mt-10" /> : (
            <>
                {/* 1. BEST CARS */}
                {bestCars.length > 0 && (
                    <View className='mt-8'>
                        <View className="px-6 flex-row justify-between items-center mb-4"><Text className={`text-xl font-bold ${textMain}`}>Best Cars 🔥</Text><Text className={`${textSub} text-xs font-bold`}>See All</Text></View>
                        <FlatList horizontal data={bestCars} keyExtractor={i => i.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }} renderItem={({ item }) => <VehicleCard item={item} width={300} />} />
                    </View>
                )}

                {/* 2. NEARBY */}
                {nearbyVehicles.length > 0 && (
                    <View className='mt-6'>
                        <View className="px-6 flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center"><Text className={`text-xl font-bold ${textMain}`}>Nearby</Text><View className="bg-green-100 px-2 py-0.5 rounded ml-2"><Text className="text-green-700 text-[10px] font-bold">Within 20km</Text></View></View>
                            <Text className={`${textSub} text-xs font-bold`}>See All</Text>
                        </View>
                        <FlatList horizontal data={nearbyVehicles} keyExtractor={i => i.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }} renderItem={({ item }) => <VehicleCard item={item} width={280} showDistance={true} />} />
                    </View>
                )}

                {/* 3. ALL VEHICLES (Vertical List) */}
                <View className='mt-6 px-6'>
                    <Text className={`text-xl font-bold mb-4 ${textMain}`}>All Vehicles ({filteredData.length})</Text>
                    {filteredData.slice(0, 12).map((item) => (
                        <VehicleCard key={item.id} item={item} isFullWidth={true} />
                    ))}
                    <TouchableOpacity className={`py-4 rounded-xl items-center mt-2 mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}><Text className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>View All Vehicles</Text></TouchableOpacity>
                </View>
            </>
        )}
      </ScrollView>

      {/* FILTER MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/50">
            <View className={`${bgCard} rounded-t-[30px] p-6 h-[500px]`}>
                {/* ... (Same Filter Modal Code) ... */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className={`text-xl font-bold ${textMain}`}>Filter Options</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={iconColor} /></TouchableOpacity>
                </View>
                <Text className={`text-base font-bold mb-3 ${textMain}`}>Price Range (Rs/Day)</Text>
                <View className="flex-row gap-4 mb-6">
                    <TextInput className={`flex-1 border p-4 rounded-xl ${inputBg} ${textMain}`} placeholder="Min" placeholderTextColor={placeholderColor} keyboardType="numeric" value={priceMin} onChangeText={setPriceMin} />
                    <TextInput className={`flex-1 border p-4 rounded-xl ${inputBg} ${textMain}`} placeholder="Max" placeholderTextColor={placeholderColor} keyboardType="numeric" value={priceMax} onChangeText={setPriceMax} />
                </View>
                <Text className={`text-base font-bold mb-3 ${textMain}`}>Seats</Text>
                <View className="flex-row flex-wrap gap-3 mb-8">
                    {SEAT_OPTIONS.map(seat => (
                        <TouchableOpacity key={seat} onPress={() => setSelectedSeats(selectedSeats === seat ? null : seat)} 
                            className={`px-5 py-3 rounded-xl border ${selectedSeats === seat ? (isDark ? 'bg-white border-white' : 'bg-black border-black') : (isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')}`}>
                            <Text className={selectedSeats === seat ? (isDark ? 'text-black font-bold' : 'text-white font-bold') : (isDark ? 'text-gray-300' : 'text-gray-600')}>{seat} Seats</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View className="mt-auto flex-row gap-4">
                    <TouchableOpacity onPress={resetFilters} className={`flex-1 py-4 rounded-2xl items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}><Text className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Reset</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className={`flex-2 py-4 rounded-2xl items-center px-10 ${isDark ? 'bg-white' : 'bg-black'}`}><Text className={`font-bold ${isDark ? 'text-black' : 'text-white'}`}>Apply Filters</Text></TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default Home;