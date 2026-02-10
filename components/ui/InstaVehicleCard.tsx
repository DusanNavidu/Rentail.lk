import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / 3; 

interface InstaCardProps {
  item: any;
  isDark?: boolean;
}

const InstaVehicleCard: React.FC<InstaCardProps> = ({ item, isDark }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: "/add/[id]", params: { id: item.id } })}
      style={{ 
        width: ITEM_SIZE, 
        height: ITEM_SIZE,
        borderWidth: 0.5, 
        borderColor: isDark ? '#000' : '#fff' 
      }}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        className="w-full h-full bg-gray-300"
        resizeMode="cover"
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', justifyContent: 'flex-end', padding: 6 }}
      >
        <View className="absolute top-2 right-2 bg-black/50 px-1.5 py-0.5 rounded">
            <Text className="text-white text-[10px] font-bold">Rs.{item.price}</Text>
        </View>

        <Text className="text-white text-[10px] font-bold" numberOfLines={1}>
          {item.vehicleModel}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default InstaVehicleCard;