import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";

interface VehicleCardProps {
  item: any;
  width?: number | string;
  showDistance?: boolean;
  isFullWidth?: boolean;
  isDark: boolean;
  borderCol?: string;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  item,
  width = 280,
  showDistance = false,
  isFullWidth = false,
  isDark,
  isOwner = false,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isOwner) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [scaleAnim, isOwner]);

  const cardBg = isDark
    ? (["#1f2937", "#111827"] as const)
    : (["#ffffff", "#f9fafb"] as const);
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subTextColor = isDark ? "text-gray-400" : "text-gray-500";
  const pillBg = isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-gray-100 border-gray-200";

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => {
        if (isOwner && onEdit) {
          onEdit();
        } else {
          router.push({ pathname: "/add/[id]", params: { id: item.id } });
        }
      }}
      className={`rounded-[24px] shadow-lg mb-8 ${isFullWidth ? "w-full" : ""}`}
      style={
        {
          width: isFullWidth
            ? "100%"
            : typeof width === "number"
              ? width
              : width,
          elevation: 8,
          backgroundColor: isDark ? "#1f2937" : "white",
        } as any
      }
    >
      <View className="h-[200px] w-full relative">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-full rounded-t-[24px]"
          resizeMode="cover"
        />

        {showDistance && item.distance !== undefined && (
          <View className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-full border border-white/20 flex-row items-center backdrop-blur-md">
            <Ionicons name="location" size={10} color="#4ade80" />
            <Text className="text-white text-[10px] ml-1 font-bold">
              {item.distance < 1 ? "Nearby" : `${item.distance.toFixed(1)} km`}
            </Text>
          </View>
        )}

        {isOwner ? (
          <View className="absolute top-3 right-3 flex-row gap-2">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onEdit && onEdit();
              }}
              className="bg-black/50 p-2 rounded-full backdrop-blur-md border border-white/20"
            >
              <MaterialIcons name="edit" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete && onDelete();
              }}
              className="bg-red-500/80 p-2 rounded-full backdrop-blur-md border border-white/20"
            >
              <MaterialIcons name="delete-outline" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="absolute top-3 right-3 bg-white/30 p-2 rounded-full backdrop-blur-md">
            <Ionicons name="heart-outline" size={18} color="white" />
          </View>
        )}
      </View>

      <LinearGradient
        colors={cardBg}
        className="p-4 rounded-b-[24px] border-x border-b"
        style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase mb-0.5">
              {item.vehicleBrand}
            </Text>
            <Text
              className={`${textColor} text-xl font-extrabold shadow-sm`}
              numberOfLines={1}
            >
              {item.vehicleModel}
            </Text>
          </View>

          <View className="flex-row items-center bg-yellow-500/10 px-2 py-1 rounded-lg">
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text className="text-yellow-600 text-xs font-bold ml-1">4.8</Text>
          </View>
        </View>

        <View className="flex-row gap-2 mb-4 mt-1">
          <View
            className={`flex-row items-center px-2.5 py-1 rounded-lg border ${pillBg}`}
          >
            <MaterialIcons
              name="event-seat"
              size={12}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
            <Text className={`${subTextColor} text-[10px] ml-1 font-semibold`}>
              {item.seats} Seats
            </Text>
          </View>
          <View
            className={`flex-row items-center px-2.5 py-1 rounded-lg border ${pillBg}`}
          >
            <FontAwesome5
              name="car"
              size={10}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
            <Text
              className={`${subTextColor} text-[10px] ml-1.5 font-semibold`}
            >
              {item.vehicleCategory}
            </Text>
          </View>
        </View>

        <View
          className={`h-[1px] w-full mb-3 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
        />

        <View className="flex-row justify-between items-center">
          <View>
            <Text className={`${subTextColor} text-[10px] font-bold uppercase`}>
              Per Day
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-emerald-500 text-xs font-bold mr-0.5">
                Rs.
              </Text>
              <Text className={`${textColor} text-xl font-extrabold`}>
                {item.price}
              </Text>
            </View>
          </View>

          {isOwner ? (
            <View
              className={`px-3 py-1.5 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
            >
              <Text
                className={`${subTextColor} text-[10px] font-bold uppercase`}
              >
                My Vehicle
              </Text>
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/booking/[id]",
                    params: { id: item.id },
                  })
                }
                className="bg-emerald-500 flex-row items-center px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/30"
              >
                <Image
                  source={require("@/assets/app_image/appointment.png")}
                  className="w-4 h-4 mr-1.5"
                  resizeMode="contain"
                  style={{ tintColor: "white" }}
                />
                <Text className="text-white font-bold text-xs uppercase tracking-wide">
                  Booking
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default VehicleCard;
