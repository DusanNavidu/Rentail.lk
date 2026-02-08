import React, { useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated } from 'react-native';

// --- DATA ---
const CATEGORIES = [
  { id: 'All', name: 'All' },
  { id: 'Car', name: 'Car' },
  { id: 'Van', name: 'Van' },
  { id: 'Jeep', name: 'Jeep' }, 
  { id: 'Bike', name: 'Bike' },
  { id: 'Tuk', name: 'Tuk' },
  { id: 'Truck', name: 'Truck' },
  { id: 'Bus', name: 'Bus' },
];

interface CategorySelectorProps {
    selectedCategory: string;
    onSelectCategory: (id: string) => void;
    isDark: boolean;
}

// 🔥 MODERN FILLED CHIP COMPONENT 🔥
const CategoryItem = ({ item, isActive, onPress, isDark }: any) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
        onPress(item.id);
    };

    // --- Dynamic Styles ---
    // Active: Green Background
    // Inactive: Light Gray (Light Mode) or Dark Gray (Dark Mode) Background
    const containerBg = isActive 
        ? 'bg-emerald-500' 
        : (isDark ? 'bg-gray-800' : 'bg-gray-100');

    // Text Color logic
    const textColor = isActive 
        ? 'text-white' 
        : (isDark ? 'text-gray-400' : 'text-gray-600');

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={{ marginRight: 8, paddingVertical: 5 }} 
        >
            <Animated.View 
                style={{ 
                    transform: [{ scale: scaleAnim }],
                    // Add subtle shadow only when active
                    shadowColor: isActive ? "#10b981" : "transparent",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isActive ? 0.4 : 0,
                    shadowRadius: 6,
                    elevation: isActive ? 6 : 0,
                }}
                className={`px-6 h-[40px] items-center justify-center rounded-full ${containerBg}`}
            >
                <Text 
                    className={`text-[13px] font-bold tracking-wide ${textColor}`}
                >
                    {item.name}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategory, onSelectCategory, isDark }) => {
  return (
    <View className='mt-6'>
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