import React, { useRef } from 'react';
import { View, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

// --- DATA ---
const CATEGORIES = [
  { id: 'All', name: 'All', logo: null },
  { id: 'Car', name: 'Car', logo: require('../../assets/vehicle_category/car.png') }, 
  { id: 'Van', name: 'Van', logo: require('../../assets/vehicle_category/van.png') },
  { id: 'Jeep', name: 'Jeep', logo: require('../../assets/vehicle_category/jeep.png') }, 
  { id: 'Bike', name: 'Bike', logo: require('../../assets/vehicle_category/bike.png') },
  { id: 'Tuk', name: 'Tuk', logo: require('../../assets/vehicle_category/tuk.png') },
  { id: 'Truck', name: 'Truck', logo: require('../../assets/vehicle_category/truck.png') },
  { id: 'Bus', name: 'Bus', logo: require('../../assets/vehicle_category/bus.png') },
];

interface CategorySelectorProps {
    selectedCategory: string;
    onSelectCategory: (id: string) => void;
    isDark: boolean;
}

const CategoryItem = ({ item, isActive, onPress, isDark }: any) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.90, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
        onPress(item.id);
    };

    const containerBg = isActive 
        ? 'bg-emerald-500 border-emerald-500' 
        : (isDark ? 'bg-blue-100 border-gray-700' : 'bg-white border-gray-200');

    const iconColor = isActive 
        ? 'white' 
        : (isDark ? '#9ca3af' : 'black');

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={{ marginRight: 12, paddingVertical: 5 }} 
        >
            <Animated.View 
                style={{ 
                    transform: [{ scale: scaleAnim }],
                    shadowColor: isActive ? "#10b981" : "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isActive ? 0.4 : 0.1,
                    shadowRadius: 6,
                    elevation: isActive ? 6 : 2,
                }}
                className={`w-[60px] h-[40px] items-center justify-center rounded-2xl border ${containerBg}`}
            >
                {item.logo ? (
                    <Image 
                        source={item.logo} 
                        className="w-12 h-12"
                        resizeMode="contain"
                        style={{ tintColor: isActive ? 'white' : undefined }}
                    />
                ) : (
                    <MaterialCommunityIcons 
                        name="apps" 
                        size={24} 
                        color={iconColor} 
                    />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategory, onSelectCategory, isDark }) => {
  return (
    <View className='mt-4'>
       <FlatList 
          horizontal 
          data={CATEGORIES} 
          keyExtractor={i => i.id} 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 24 }} 
          renderItem={({ item }) => (
            <CategoryItem 
                item={item} 
                isActive={selectedCategory === item.id} 
                onPress={onSelectCategory} 
                isDark={isDark} 
            />
          )}
      />
    </View>
  );
};

export default CategorySelector;