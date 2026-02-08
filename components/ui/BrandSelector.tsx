import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

// --- ⚠️ වැදගත්: Local Images වලට අනිවාර්යයෙන්ම 'require' පාවිච්චි කරන්න ---
// ඔයාගේ folder structure එක අනුව path එක හරියටම දෙන්න.
const BRANDS = [
  { id: 'All', name: 'All', logo: null },
  { id: 'Toyota', name: 'Toyota', logo: require('../../assets/VehicleLogo/toyota.png') }, 
  { id: 'Nissan', name: 'Nissan', logo: require('../../assets/VehicleLogo/nissan.png') },
  { id: 'Honda', name: 'Honda', logo: require('@/assets/Vehicle logo/download (1)-Photoroom.png') }, 
  { id: 'Suzuki', name: 'Suzuki', logo: require('@/assets/Vehicle logo/download (8)-Photoroom (1).png') }, 
  { id: 'Mitsubishi', name: 'Mitsubishi', logo: '../../assets/Vehicle logo/download (2)-Photoroom.png' },
  { id: 'BMW', name: 'BMW', logo: 'assets/Vehicle logo/download (3)-Photoroom.png' },
  { id: 'Benz', name: 'Benz', logo: 'assets/Vehicle logo/mercedes-benz-brand-logo-symbol-with-name-black-design-german-car-automobile-illustration-free-vector-Photoroom.png' },
  { id: 'Audi', name: 'Audi', logo: '../../assets/Vehicle logo/audi-logo-editorial-illustrative-white-background-eps-download-vector-jpeg-banner-ios-audi-logo-editorial-illustrative-white-208329149-Photoroom.png' },
  { id: 'Kia', name: 'Kia', logo: 'assets/Vehicle logo/download (4)-Photoroom.png' },
  { id: 'Land Rover', name: 'Land Rover', logo: 'assets/Vehicle logo/download (9)-Photoroom (1).png' },
  { id: 'Tata', name: 'Tata', logo: 'assets/Vehicle logo/download (8)-Photoroom.png' },
  { id: 'Ford', name: 'Ford', logo: 'assets/Vehicle logo/ford-black-logo-download-png-701751694714012hqvdflamdo-Photoroom.png' },
  { id: 'Hero', name: 'Hero', logo: 'assets/Vehicle logo/Hero-logo-Photoroom.png' },
  { id: 'Yamaha', name: 'Yamaha', logo: 'assets/Vehicle logo/sticker-yamaha-logo-nouveau-2-carbone.png' },
];

// (Testing සඳහා මම උඩ එකේ පින්තූර path එක @/assets/... ලෙස දැම්මා. ඔයාගේ Project එකේ විදිහට '../../' දාන්න අවශ්‍ය නම් වෙනස් කරගන්න)

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
                style={{ height: 44, elevation: isActive ? 4 : 1 }} // Add shadow only when active
              >
                {/* Brand Logo Circle */}
                <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-2 overflow-hidden shadow-sm">
                    {item.logo ? (
                        <Image 
                            source={item.logo} // ✅ Correct usage for require()
                            className="w-5 h-5" 
                            resizeMode="contain" 
                        />
                    ) : (
                        // Fallback Icon for 'All' or missing logos
                        <MaterialCommunityIcons 
                            name="apps" 
                            size={18} 
                            color="black" 
                        />
                    )}
                </View>

                {/* Brand Name */}
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