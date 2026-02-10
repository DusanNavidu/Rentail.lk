import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BRANDS = [
  { id: 'All', name: 'All', logo: null },
  { id: 'Toyota', name: 'Toyota', logo: require('../../assets/VehicleLogo/toyota.png') }, 
  { id: 'Nissan', name: 'Nissan', logo: require('../../assets/VehicleLogo/nissan.png') },
  { id: 'Honda', name: 'Honda', logo: require('../../assets/VehicleLogo/honda.png') }, 
  { id: 'Suzuki', name: 'Suzuki', logo: require('../../assets/VehicleLogo/susuki.png') }, 
  { id: 'Mitsubishi', name: 'Mitsubishi', logo: require('../../assets/VehicleLogo/mitsubishi.png') },
  { id: 'BMW', name: 'BMW', logo: require('../../assets/VehicleLogo/bmw.png') },
  { id: 'Benz', name: 'Benz', logo: require('../../assets/VehicleLogo/benz.png') },
  { id: 'Audi', name: 'Audi', logo: require('../../assets/VehicleLogo/audi.png') },
  { id: 'Kia', name: 'Kia', logo: require('../../assets/VehicleLogo/kia.png') },
  { id: 'Land Rover', name: 'Land Rover', logo: require('../../assets/VehicleLogo/land_rover.png') },
  { id: 'Tata', name: 'Tata', logo: require('../../assets/VehicleLogo/tata.png') },
  { id: 'Ford', name: 'Ford', logo: require('../../assets/VehicleLogo/ford.png') },
  { id: 'Hero', name: 'Hero', logo: require('../../assets/VehicleLogo/hero.png') },
  { id: 'Yamaha', name: 'Yamaha', logo: require('../../assets/VehicleLogo/yamaha.png') },
];

interface BrandSelectorProps {
    selectedBrand: string;
    onSelectBrand: (id: string) => void;
    isDark: boolean;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({ selectedBrand, onSelectBrand, isDark }) => {

  return (
    <View className='mt-6'>
      <FlatList 
        horizontal 
        data={BRANDS} 
        keyExtractor={i => i.id} 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
        renderItem={({ item }) => {
            const isActive = selectedBrand === item.id;
            
            const containerStyle = isActive 
                ? 'bg-emerald-500 border-emerald-500' 
                : (isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200');

            const textStyle = isActive 
                ? 'text-white' 
                : (isDark ? 'text-gray-300' : 'text-gray-700');

            return (
              <TouchableOpacity 
                onPress={() => onSelectBrand(item.id)} 
                activeOpacity={0.8}
                className={`flex-row items-center px-2 pr-4 py-1.5 rounded-full border ${containerStyle}`}
                style={{ height: 44, elevation: isActive ? 4 : 1 }}
              >
                <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-2 overflow-hidden shadow-sm">
                    {item.logo ? (
                        <Image 
                            source={item.logo}
                            className="w-8 h-8" 
                            resizeMode="contain" 
                        />
                    ) : (
                        <MaterialCommunityIcons 
                            name="apps" 
                            size={18} 
                            color="black" 
                        />
                    )}
                </View>

                <Text className={`font-bold text-[13px] tracking-wide ${textStyle}`}>
                    {item.name}
                </Text>
              </TouchableOpacity>
            )
        }}
      />
    </View>
  );
};

export default BrandSelector;