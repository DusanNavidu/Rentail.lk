import { 
  View, Text, TextInput, FlatList, TouchableOpacity, 
  ActivityIndicator, Modal, RefreshControl 
} from 'react-native';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Ionicons, Feather } from "@expo/vector-icons";
import { getAllVehiclesRandoms } from '@/services/vehicleService';
import { ThemeContext } from '@/context/ThemeContext';

import InstaVehicleCard from '@/components/ui/InstaVehicleCard';
import VehicleCard from '@/components/ui/vehicleCard';

const Search = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const bgMain = isDark ? "bg-black" : "bg-white"; 
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark ? "bg-gray-900 border-gray-800" : "bg-gray-100 border-gray-200";
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [randomGridData, setRandomGridData] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const [gridVisibleCount, setGridVisibleCount] = useState(15);

  const [modalVisible, setModalVisible] = useState(false);
  const [filterSeats, setFilterSeats] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const data = await getAllVehiclesRandoms();
    
    let shuffled = [...data];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setAllVehicles(data);
    setRandomGridData(shuffled);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (searchText === '') {
        setSearchResults([]);
        return;
    }

    const lowerText = searchText.toLowerCase();
    
    let result = allVehicles.filter(v => 
        (v.vehicleBrand && v.vehicleBrand.toLowerCase().includes(lowerText)) ||
        (v.vehicleModel && v.vehicleModel.toLowerCase().includes(lowerText)) ||
        (v.vehicleCategory && v.vehicleCategory.toLowerCase().includes(lowerText)) ||
        (v.vehicleType && v.vehicleType.toLowerCase().includes(lowerText)) ||
        (v.locationName && v.locationName.toLowerCase().includes(lowerText))
    );

    if (filterSeats) result = result.filter(v => Number(v.seats) === filterSeats);
    if (minPrice) result = result.filter(v => Number(v.price) >= Number(minPrice));
    if (maxPrice) result = result.filter(v => Number(v.price) <= Number(maxPrice));

    setSearchResults(result);

  }, [searchText, filterSeats, minPrice, maxPrice, allVehicles]);

  const handleSeeMoreGrid = () => {
    setGridVisibleCount(prev => prev + 15);
  };

  const clearFilters = () => {
    setFilterSeats(null);
    setMinPrice('');
    setMaxPrice('');
    setModalVisible(false);
  };

  const isSearching = searchText.length > 0;

  return (
    <View className={`flex-1 ${bgMain} pt-12`}>
      
      <View className="px-4 mb-4">
        <Text className={`text-2xl font-extrabold mb-3 ${textMain}`}>Explore</Text>
        
        <View className="flex-row gap-2">
          <View className={`flex-1 flex-row items-center px-4 h-11 rounded-xl border ${inputBg}`}>
            <Feather name="search" size={18} color={isDark ? "#9ca3af" : "#6b7280"} />
            <TextInput 
              placeholder="Search Brand, Model, Type, Location..."
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              className={`flex-1 ml-2 text-sm font-medium ${textMain}`}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={18} color={isDark ? "gray" : "#ccc"} />
                </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className={`w-11 h-11 items-center justify-center rounded-xl border ${inputBg}`}
          >
            <Feather name="sliders" size={18} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <>
            {!isSearching ? (
                <FlatList
                    data={randomGridData.slice(0, gridVisibleCount)}
                    keyExtractor={item => item.id}
                    key={'grid-view'}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "white" : "black"} />}
                    
                    renderItem={({ item }) => (
                        <InstaVehicleCard item={item} isDark={isDark} />
                    )}

                    ListFooterComponent={
                        <View className="py-8 items-center">
                            {randomGridData.length > gridVisibleCount && (
                                <TouchableOpacity 
                                    onPress={handleSeeMoreGrid}
                                    className={`px-8 py-2.5 rounded-full border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}
                                >
                                    <Text className={`font-bold text-xs ${textMain}`}>See More</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={searchResults}
                    keyExtractor={item => item.id}
                    key={'list-view'}
                    numColumns={1}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                    
                    renderItem={({ item }) => (
                        <View className="mb-4">
                            <VehicleCard 
                                item={item} 
                                isDark={isDark} 
                                isFullWidth={true} 
                                borderCol={borderColor}
                                showDistance={false} 
                            />
                        </View>
                    )}

                    ListHeaderComponent={
                        <Text className={`mb-4 text-sm font-bold ${textSub}`}>
                            Found {searchResults.length} results
                        </Text>
                    }

                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Feather name="search" size={50} color="gray" />
                            <Text className={`mt-4 ${textSub}`}>No vehicles found matching "{searchText}"</Text>
                        </View>
                    }
                />
            )}
        </>
      )}

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/70">
            <View className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-t-[30px] p-6 pb-10`}>
                <View className="flex-row justify-between items-center mb-6">
                    <Text className={`text-xl font-bold ${textMain}`}>Filter Options</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color={isDark ? "white" : "black"} />
                    </TouchableOpacity>
                </View>

                <Text className={`font-bold mb-3 text-sm ${textMain}`}>Price Range (Rs/Day)</Text>
                <View className="flex-row gap-4 mb-6">
                    <TextInput 
                        className={`flex-1 p-3.5 rounded-xl border ${inputBg} ${textMain}`} 
                        placeholder="Min" placeholderTextColor="gray" keyboardType="numeric"
                        value={minPrice} onChangeText={setMinPrice}
                    />
                    <TextInput 
                        className={`flex-1 p-3.5 rounded-xl border ${inputBg} ${textMain}`} 
                        placeholder="Max" placeholderTextColor="gray" keyboardType="numeric"
                        value={maxPrice} onChangeText={setMaxPrice}
                    />
                </View>

                <Text className={`font-bold mb-3 text-sm ${textMain}`}>Seats</Text>
                <View className="flex-row flex-wrap gap-2 mb-8">
                    {[2, 4, 5, 7, 10, 15, 25, 40].map(seat => (
                        <TouchableOpacity 
                            key={seat} 
                            onPress={() => setFilterSeats(filterSeats === seat ? null : seat)}
                            className={`px-4 py-2 rounded-lg border ${
                                filterSeats === seat 
                                ? 'bg-emerald-500 border-emerald-500' 
                                : `${inputBg} ${borderColor}`
                            }`}
                        >
                            <Text className={`text-xs font-bold ${filterSeats === seat ? 'text-white' : textSub}`}>
                                {seat} Seats
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="flex-row gap-4">
                    <TouchableOpacity onPress={clearFilters} className={`flex-1 py-3.5 rounded-xl items-center border ${borderColor}`}>
                        <Text className={`font-bold ${textMain}`}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-2 bg-emerald-500 py-3.5 rounded-xl items-center px-10">
                        <Text className="text-white font-bold">Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  )
}

export default Search;