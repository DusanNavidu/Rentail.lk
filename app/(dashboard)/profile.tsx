import { View, Text, TouchableOpacity, Image, Switch, ScrollView, Alert } from "react-native";
import React, { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { logout } from "@/services/authService"; // Make sure to import your logout function

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const router = useRouter();
  const isDark = theme === 'dark';

  // Styles based on theme
  const bgMain = isDark ? "bg-black" : "bg-white";
  const bgCard = isDark ? "bg-gray-900" : "bg-gray-50";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const borderCol = isDark ? "border-gray-800" : "border-gray-100";

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
            await logout();
            router.replace("/login"); // or wherever your login is
        } 
      }
    ]);
  };

  const SettingItem = ({ icon, title, isSwitch = false, value = false, onPress }: any) => (
    <TouchableOpacity 
        disabled={isSwitch} 
        onPress={onPress}
        className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl ${bgCard}`}
    >
        <View className="flex-row items-center gap-3">
            <View className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                {icon}
            </View>
            <Text className={`text-base font-medium ${textMain}`}>{title}</Text>
        </View>
        {isSwitch ? (
            <Switch 
                value={value} 
                onValueChange={toggleTheme} 
                trackColor={{ false: "#767577", true: "#ef4444" }} // Red for active
            />
        ) : (
            <Ionicons name="chevron-forward" size={20} color={isDark ? "gray" : "black"} />
        )}
    </TouchableOpacity>
  );

  return (
    <ScrollView className={`flex-1 ${bgMain}`} contentContainerStyle={{ padding: 24 }}>
      
      {/* Header */}
      <Text className={`text-3xl font-extrabold ${textMain} mb-8`}>Profile</Text>

      {/* Profile Card */}
      <View className={`flex-row items-center p-4 rounded-3xl mb-8 ${bgCard} border ${borderCol}`}>
        <View className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-4">
             <Image 
                source={{ uri: user?.photoURL || "https://randomuser.me/api/portraits/men/32.jpg" }} 
                className="w-full h-full" 
                resizeMode="cover"
             />
        </View>
        <View>
            <Text className={`text-xl font-bold ${textMain}`}>{user?.displayName || "Guest User"}</Text>
            <Text className={`${textSub}`}>{user?.email || "No Email"}</Text>
        </View>
      </View>

      {/* Settings Section */}
      <Text className={`text-lg font-bold mb-4 ${textMain}`}>Settings</Text>
      
      <SettingItem 
        icon={<Ionicons name="moon-outline" size={22} color={isDark ? "white" : "black"} />} 
        title="Dark Mode" 
        isSwitch 
        value={isDark} 
      />
      
      <SettingItem 
        icon={<Ionicons name="person-outline" size={22} color={isDark ? "white" : "black"} />} 
        title="Edit Profile" 
        onPress={() => console.log("Edit Profile")}
      />

      <SettingItem 
        icon={<Ionicons name="notifications-outline" size={22} color={isDark ? "white" : "black"} />} 
        title="Notifications" 
        onPress={() => console.log("Notifications")}
      />

      <SettingItem 
        icon={<MaterialIcons name="security" size={22} color={isDark ? "white" : "black"} />} 
        title="Privacy & Security" 
        onPress={() => console.log("Privacy")}
      />

      {/* Logout Button */}
      <TouchableOpacity 
        onPress={handleLogout}
        className="flex-row items-center justify-center p-4 mt-8 rounded-2xl bg-red-50 border border-red-100"
      >
        <Feather name="log-out" size={20} color="#ef4444" />
        <Text className="text-red-500 font-bold ml-2">Log Out</Text>
      </TouchableOpacity>

      <Text className={`text-center mt-10 text-xs ${textSub}`}>Version 1.0.0</Text>
      <View className="h-[120px]"></View>
    </ScrollView>
  );
};

export default Profile;