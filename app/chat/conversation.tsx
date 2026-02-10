import { 
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, Image 
} from "react-native";
import React, { useEffect, useState, useLayoutEffect, useContext } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { auth } from "@/services/firebase";
import { initializeChat, sendMessage, subscribeToMessages, getUserDetails } from "@/services/chatService";
import { ThemeContext } from "@/context/ThemeContext";

const Conversation = () => {
  const { receiverId, userName } = useLocalSearchParams();
  const router = useRouter();
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [receiverData, setReceiverData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  // WhatsApp Colors
  const bgMain = isDark ? "bg-[#121212]" : "bg-[#efe7dd]"; // WhatsApp Wallpaper Color (Light)
  const textMain = isDark ? "text-white" : "text-black";
  const inputBg = isDark ? "bg-[#1f2c34]" : "bg-white";
  
  // Message Bubbles
  const myMsgBg = isDark ? "bg-[#005c4b]" : "bg-[#d9fdd3]"; // WhatsApp Green
  const otherMsgBg = isDark ? "bg-[#1f2c34]" : "bg-white";

  useEffect(() => {
    const fetchReceiver = async () => {
        if (receiverId) {
            const data = await getUserDetails(receiverId as string);
            setReceiverData(data);
        }
    };
    fetchReceiver();
  }, [receiverId]);

  useEffect(() => {
    const setupChat = async () => {
      if (currentUser && receiverId) {
        const id = await initializeChat(currentUser.uid, receiverId as string);
        setChatId(id);
        setLoading(false);
      }
    };
    setupChat();
  }, [currentUser, receiverId]);

  useLayoutEffect(() => {
    if (!chatId) return;
    const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (inputText.trim() === "" || !chatId || !currentUser) return;
    const textToSend = inputText;
    setInputText(""); 
    try {
      await sendMessage(chatId, textToSend, currentUser.uid);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === currentUser?.uid;
    return (
      <View className={`flex-row ${isMe ? "justify-end" : "justify-start"} mb-2 px-3`}>
        <View className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm ${isMe ? myMsgBg : otherMsgBg}`}>
          <Text className={`${isMe ? (isDark ? "text-white" : "text-black") : textMain} text-[15px]`}>
            {item.text}
          </Text>
          <Text className={`text-[10px] mt-1 ${isMe ? (isDark ? "text-gray-300" : "text-gray-500") : "text-gray-400"} text-right`}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-[#121212]" : "bg-[#f0f2f5]"}`}>
      {/* --- WhatsApp Style Header --- */}
      <View className={`flex-row items-center p-3 border-b ${isDark ? "bg-[#1f2c34] border-gray-800" : "bg-[#075e54] border-none"}`}>
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mr-2">
            <MaterialIcons name="arrow-back" size={24} color="white" />
            <View className="w-9 h-9 rounded-full bg-gray-300 ml-1 justify-center items-center overflow-hidden border border-white/20">
                {receiverData?.photoUrl ? (
                    <Image source={{ uri: receiverData.photoUrl }} className="w-full h-full" />
                ) : (
                    <Text className="font-bold text-gray-600">{receiverData?.name?.charAt(0) || "?"}</Text>
                )}
            </View>
        </TouchableOpacity>

        <View className="flex-1 ml-2">
            <Text className="font-bold text-lg text-white" numberOfLines={1}>
                {receiverData?.name || userName || "User"}
            </Text>
            {/* Online Status (Static for now) */}
            <Text className="text-xs text-gray-200">Online</Text>
        </View>

        <View className="flex-row gap-4 mr-2">
            <Ionicons name="videocam" size={22} color="white" />
            <Ionicons name="call" size={20} color="white" />
        </View>
      </View>
      {/* ----------------------------- */}

      {/* Body */}
      <View className={`flex-1 ${bgMain}`}> 
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#25D366" />
            </View>
          ) : (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
              <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item._id}
                inverted
                contentContainerStyle={{ paddingVertical: 10 }}
              />

              {/* Input Area */}
              <View className={`p-2 flex-row items-center ${isDark ? "bg-[#1f2c34]" : "bg-[#f0f2f5]"} mb-1`}>
                <View className={`flex-1 flex-row items-center rounded-full px-4 py-2 mr-2 ${inputBg}`}>
                    <Ionicons name="happy-outline" size={24} color="gray" style={{marginRight: 8}}/>
                    <TextInput
                      className={`flex-1 text-base ${textMain} max-h-24`}
                      placeholder="Message"
                      placeholderTextColor="gray"
                      value={inputText}
                      onChangeText={setInputText}
                      multiline
                    />
                    <Ionicons name="camera" size={24} color="gray" style={{marginLeft: 8}}/>
                </View>
                
                <TouchableOpacity onPress={handleSend} className="bg-[#00a884] w-12 h-12 rounded-full justify-center items-center shadow-md">
                  <Ionicons name={inputText ? "send" : "mic"} size={24} color="white" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}
      </View>
    </SafeAreaView>
  );
};

export default Conversation;