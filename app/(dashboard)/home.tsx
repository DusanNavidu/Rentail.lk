import { View, Text, Image, TextInput, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons, EvilIcons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { getAllVehicles } from '@/services/vehicleService'
// import { useLoader } from '@/hooks/useLoader'
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

const CATEGORIES = [
  { id: 'All', name: 'All', icon: 'grid-outline' },
  { id: 'Car', name: 'Car', icon: 'car-sport-outline' },
  { id: 'Van', name: 'Van', icon: 'bus-outline' },
  { id: 'Jeep', name: 'Jeep', icon: 'jeep' },
  { id: 'Bike', name: 'Bike', icon: 'bicycle-outline' },
  { id: 'Three Wheel', name: 'Tuk', icon: 'alert-circle-outline' },
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
  
  // Data States
  const [allData, setAllData] = useState<any[]>([]); 
  const [filteredData, setFilteredData] = useState<any[]>([]); 
  
  // Derived Lists
  const [nearbyVehicles, setNearbyVehicles] = useState<any[]>([]);
  const [bestCars, setBestCars] = useState<any[]>([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  
  // Modal Filter States
  const [modalVisible, setModalVisible] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<number | null>(null);

  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    }
    try {
      const data = await getAllVehicles();
      setAllData(data);
    } catch (e) { console.log(e); } 
    finally { setLoading(false); }
  };

  // 2. MASTER FILTER LOGIC
  useEffect(() => {
    let result = allData;

    // A. Search
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(v => 
            v.vehicleBrand?.toLowerCase().includes(q) || 
            v.vehicleModel?.toLowerCase().includes(q)
        );
    }

    if (selectedBrand !== 'All') {
        result = result.filter(v => v.vehicleBrand === selectedBrand);
    }

    if (selectedCategory !== 'All') {
        result = result.filter(v => v.vehicleCategory === selectedCategory);
    }

    if (priceMin) result = result.filter(v => Number(v.price) >= Number(priceMin));
    if (priceMax) result = result.filter(v => Number(v.price) <= Number(priceMax));

    if (selectedSeats) {
        result = result.filter(v => Number(v.seats) === selectedSeats);
    }

    setFilteredData(result);

  }, [allData, searchQuery, selectedBrand, selectedCategory, priceMin, priceMax, selectedSeats]);

  useEffect(() => {
    // --- Nearby Logic ---
    if (userLocation) {
        const sorted = [...filteredData].map((v) => {
            if (!v.latitude || !v.longitude) return { ...v, distance: 99999 };
            const dist = getDistanceFromLatLonInKm(
                userLocation.coords.latitude, userLocation.coords.longitude,
                v.latitude, v.longitude
            );
            return { ...v, distance: dist };
        }).sort((a, b) => a.distance - b.distance);
        setNearbyVehicles(sorted.slice(0, 8)); 
    } else {
        setNearbyVehicles(filteredData.slice(0, 8));
    }

    // (Cars ONLY + High price or Luxury type)
    const best = allData.filter(v => 
        v.vehicleCategory === 'Car' && ( // Must be a Car
            Number(v.price) > 15000 || 
            v.vehicleType === 'Sports' || 
            v.vehicleType === 'Luxury'
        )
    );
    setBestCars(best.slice(0, 5));

  }, [filteredData, userLocation, allData]);


  // --- HELPER: Distance Calc ---
  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; var dLat = deg2rad(lat2 - lat1); var dLon = deg2rad(lon2 - lon1); 
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; 
  }
  function deg2rad(deg: number) { return deg * (Math.PI / 180) }

  // --- COMPONENT: Vehicle Card ---
  const VehicleCard = ({ item, width = 200, showDistance = false }: any) => (
    <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: "/add/[id]", params: { id: item.id } })}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mr-4 mb-4"
        style={{ width: width }}
    >
        <Image source={{ uri: item.imageUrl }} className="w-full h-40 bg-gray-200" resizeMode="cover" />
        <View className="p-3">
            <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded uppercase">{item.vehicleBrand}</Text>
                <View className="flex-row items-center"><Ionicons name="star" size={10} color="#fbbf24" /><Text className="text-xs text-gray-500 ml-1">4.5</Text></View>
            </View>
            <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>{item.vehicleBrand} {item.vehicleModel}</Text>
            
            {showDistance && item.distance && (
                <View className="flex-row items-center mt-1">
                    <Ionicons name="location-outline" size={12} color="#ef4444" />
                    <Text className="text-xs text-gray-500 ml-1">{item.distance < 1 ? "Nearby" : `${item.distance.toFixed(1)} km`}</Text>
                </View>
            )}

            <View className="flex-row justify-between items-center mt-2">
                <Text className="text-sm font-bold text-black">Rs.{item.price}<Text className="text-gray-400 text-[10px] font-normal">/day</Text></Text>
                <View className="bg-black w-7 h-7 rounded-full items-center justify-center"><MaterialIcons name="arrow-forward" size={14} color="white" /></View>
            </View>
        </View>
    </TouchableOpacity>
  );

  const resetFilters = () => {
      setPriceMin(''); setPriceMax(''); setSelectedSeats(null); setModalVisible(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER */}
        <View className='px-6 flex flex-row mt-2 justify-between items-center'>
          <View className='flex flex-row items-center gap-2'>
            <Image
              source={require("../../assets/images/icon.png")}
              className="w-10 h-10 bg-white rounded-xl p-4"
              resizeMode="contain"
            />
            <Text className="text-2xl font-extrabold tracking-tight">Rentail<Text className="text-red-600">.</Text>lk</Text>
          </View>
          <TouchableOpacity className="bg-gray-50 p-2 rounded-full border border-gray-200"><Ionicons name="notifications-outline" size={24} color="black" /></TouchableOpacity>
        </View>

        <View className='px-6 mt-6 flex-row justify-between items-center'>
          {/* Text Section */}
          <View className="flex-1 mr-4">
             <Text className="text-gray-500 font-medium text-sm">Hello, <Text>{user?.displayName || "Guest"} 👋</Text></Text>
             <Text className="text-3xl font-extrabold text-black mt-1 leading-tight">
                Find your dream car
             </Text>
          </View>

          {/* Filter Button */}
          <TouchableOpacity 
             onPress={() => setModalVisible(true)} 
             className="bg-black w-14 h-14 rounded-2xl items-center justify-center shadow-lg"
          >
             <Ionicons name="options-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* BRANDS LIST */}
        <View className='mt-6'>
          <FlatList horizontal data={BRANDS} keyExtractor={i => i.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedBrand(item.id)} className={`items-center px-4 py-2 rounded-full border ${selectedBrand === item.id ? 'bg-black border-black' : 'bg-white border-gray-200'}`}>
                <Text className={`font-semibold ${selectedBrand === item.id ? 'text-white' : 'text-gray-700'}`}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* CATEGORIES BAR */}
        <View className='mt-6'>
          <FlatList horizontal data={CATEGORIES} keyExtractor={i => i.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 15 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedCategory(item.id)} className="items-center">
                <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 ${selectedCategory === item.id ? 'bg-black' : 'bg-gray-100'}`}>
                  {item.id === 'Jeep' ? <FontAwesome5 name="shuttle-van" size={20} color={selectedCategory === item.id ? 'white' : 'gray'} /> : <Ionicons name={item.icon as any} size={24} color={selectedCategory === item.id ? 'white' : 'gray'} />}
                </View>
                <Text className={`text-xs font-medium ${selectedCategory === item.id ? 'text-black' : 'text-gray-500'}`}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* LOADING & CONTENT */}
        {loading ? <ActivityIndicator size="large" color="black" className="mt-10" /> : (
            <>
                {/* 1. BEST CARS (ONLY CARS) */}
                {bestCars.length > 0 && (
                    <View className='mt-8'>
                        <View className="px-6 flex-row justify-between items-center mb-4"><Text className='text-xl font-bold'>Best Cars 🔥</Text><Text className="text-gray-500 text-xs font-bold">See All</Text></View>
                        <FlatList horizontal data={bestCars} keyExtractor={i => i.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }} renderItem={({ item }) => <VehicleCard item={item} width={260} />} />
                    </View>
                )}

                {/* 2. NEARBY */}
                <View className='mt-6'>
                    <View className="px-6 flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center"><Text className='text-xl font-bold'>Nearby</Text><View className="bg-green-100 px-2 py-0.5 rounded ml-2"><Text className="text-green-700 text-[10px] font-bold">Closest First</Text></View></View>
                        <Text className="text-gray-500 text-xs font-bold">See All</Text>
                    </View>
                    <FlatList horizontal data={nearbyVehicles} keyExtractor={i => i.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }} renderItem={({ item }) => <VehicleCard item={item} width={220} showDistance={true} />} />
                </View>

                {/* 3. ALL VEHICLES */}
                <View className='mt-6 px-6'>
                    <Text className='text-xl font-bold mb-4'>All Vehicles ({filteredData.length})</Text>
                    {filteredData.slice(0, 12).map((item) => (
                        <TouchableOpacity key={item.id} activeOpacity={0.9} onPress={() => router.push({ pathname: "/add/[id]", params: { id: item.id } })} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 flex-row h-32">
                            <Image source={{ uri: item.imageUrl }} className="w-32 h-full bg-gray-200" resizeMode="cover" />
                            <View className="flex-1 p-3 justify-between">
                                <View>
                                    <View className="flex-row justify-between items-start">
                                        <Text className="text-base font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>{item.vehicleBrand} {item.vehicleModel}</Text>
                                        {item.vehicleType === 'Luxury' && <MaterialIcons name="verified" size={16} color="#fbbf24" />}
                                    </View>
                                    <Text className="text-gray-500 text-xs mt-1">{item.vehicleCategory} • {item.seats} Seats</Text>
                                </View>
                                <View className="flex-row justify-between items-end">
                                    <Text className="text-sm font-bold text-black">Rs.{item.price}<Text className="text-gray-400 text-xs font-normal">/day</Text></Text>
                                    <View className="bg-gray-50 px-2 py-1 rounded border border-gray-200"><Text className="text-[10px] text-gray-600 font-bold">Book Now</Text></View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity className="bg-gray-100 py-4 rounded-xl items-center mt-2 mb-6"><Text className="font-bold text-gray-600">View All Vehicles</Text></TouchableOpacity>
                </View>
            </>
        )}
      </ScrollView>

      {/* --- FILTER MODAL --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-[30px] p-6 h-[500px]">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xl font-bold">Filter Options</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color="black" /></TouchableOpacity>
                </View>

                {/* Price Range */}
                <Text className="text-base font-bold mb-3">Price Range (Rs/Day)</Text>
                <View className="flex-row gap-4 mb-6">
                    <TextInput className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-xl" placeholder="Min" keyboardType="numeric" value={priceMin} onChangeText={setPriceMin} />
                    <TextInput className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-xl" placeholder="Max" keyboardType="numeric" value={priceMax} onChangeText={setPriceMax} />
                </View>

                {/* Seat Count */}
                <Text className="text-base font-bold mb-3">Seats</Text>
                <View className="flex-row flex-wrap gap-3 mb-8">
                    {SEAT_OPTIONS.map(seat => (
                        <TouchableOpacity key={seat} onPress={() => setSelectedSeats(selectedSeats === seat ? null : seat)} 
                            className={`px-5 py-3 rounded-xl border ${selectedSeats === seat ? 'bg-black border-black' : 'bg-white border-gray-200'}`}>
                            <Text className={selectedSeats === seat ? 'text-white font-bold' : 'text-gray-600'}>{seat} Seats</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="mt-auto flex-row gap-4">
                    <TouchableOpacity onPress={resetFilters} className="flex-1 bg-gray-100 py-4 rounded-2xl items-center"><Text className="font-bold text-gray-600">Reset</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-2 bg-black py-4 rounded-2xl items-center px-10"><Text className="font-bold text-white">Apply Filters</Text></TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

export default Home