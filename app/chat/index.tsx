import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, SafeAreaView } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "expo-router";
import { auth } from "@/services/firebase";
import { getUserChats, getUserDetails } from "@/services/chatService";
import { ThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const ChatList = () => {
  const router = useRouter();
  const currentUser = auth.currentUser;
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // Colors
  const bgMain = isDark ? "bg-[#121212]" : "bg-white"; // WhatsApp Dark BG
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const itemBg = isDark ? "bg-[#121212]" : "bg-white";
  const borderCol = isDark ? "border-gray-800" : "border-gray-100";

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = getUserChats(currentUser.uid, (data) => {
      setChats(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const ChatItem = ({ item }: { item: any }) => {
    const [otherUser, setOtherUser] = useState<any>(null);
    const otherUserId = item.participants.find((id: string) => id !== currentUser?.uid);

    useEffect(() => {
      const fetchUser = async () => {
        if (otherUserId) {
          const userData = await getUserDetails(otherUserId);
          setOtherUser(userData);
        }
      };
      fetchUser();
    }, [otherUserId]);

    const formatTime = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <TouchableOpacity
        onPress={() => 
            router.push({ 
                pathname: "/chat/conversation", 
                params: { receiverId: otherUserId, userName: otherUser?.name } 
            })
        }
        className={`flex-row items-center px-4 py-3 border-b ${itemBg} ${borderCol}`}
      >
        {/* Profile Pic */}
        <View className={`w-14 h-14 rounded-full mr-4 justify-center items-center overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            {otherUser?.photoUrl ? (
                 <Image source={{ uri: otherUser.photoUrl }} className="w-full h-full" />
            ) : (
                <Text className={`text-xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {otherUser?.name?.charAt(0) || "?"}
                </Text>
            )}
        </View>

        {/* Details */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
             <Text className={`font-bold text-lg ${textMain}`}>
                {otherUser?.name || "User"}
             </Text>
             <Text className={`text-xs ${item.lastMessageTimestamp ? "text-green-500" : textSub}`}>
                {formatTime(item.lastMessageTimestamp)}
             </Text>
          </View>
          
          <Text className={`text-sm ${textSub}`} numberOfLines={1}>
            {item.lastMessage || "Start a conversation"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <View className={`flex-1 justify-center items-center ${bgMain}`}><ActivityIndicator size="large" color="#25D366" /></View>;
  }

  return (
    <View className={`flex-1 ${bgMain}`}>
      {/* List */}
      <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatItem item={item} />}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
                <Ionicons name="chatbubbles-outline" size={64} color={isDark ? "#374151" : "#d1d5db"} />
                <Text className={`mt-4 ${textSub}`}>No chats yet</Text>
            </View>
          }
      />
    </View>
  );
};

export default ChatList;