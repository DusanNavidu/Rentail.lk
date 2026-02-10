import { 
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, Image, StatusBar, Modal, Dimensions, AppState 
} from "react-native";
import React, { useEffect, useState, useLayoutEffect, useContext, useRef } from "react";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5, Entypo, Feather } from "@expo/vector-icons";
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

import { auth, db } from "@/services/firebase";
import { 
    initializeChat, sendMessage, subscribeToMessages, getUserDetails, uploadToCloudinary, 
    startVoiceCall, endVoiceCall, listenForIncomingCalls, sendCallLog 
} from "@/services/chatService";
import { ThemeContext } from "@/context/ThemeContext";

const { width } = Dimensions.get('window');

// --- Helper: Format Time ---
const formatDuration = (millis: number | null) => {
    if (!millis) return "0:00";
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
};

// --- 🎧 Audio Player Component ---
const AudioMessage = ({ uri, isMe, isDark }: { uri: string, isMe: boolean, isDark: boolean }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState<number | null>(null);
    const [position, setPosition] = useState<number | null>(null);

    const playSound = async () => {
        try {
            if (sound) {
                await sound.replayAsync();
                setIsPlaying(true);
            } else {
                const { sound: newSound, status } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true, isLooping: false } // ✅ Loop නොවී එක පාරක් play වෙන්න
                );
                setSound(newSound);
                setIsPlaying(true);
                if(status.isLoaded) setDuration(status.durationMillis || 0);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded) {
                        setPosition(status.positionMillis || 0);
                        setDuration(status.durationMillis || 0);
                        if (status.didJustFinish) {
                            setIsPlaying(false);
                            setPosition(status.durationMillis || 0); 
                            newSound.stopAsync(); // ඉවර වුනාම නවතින්න
                        }
                    }
                });
            }
        } catch (error) { console.log("Error playing sound", error); }
    };

    const stopSound = async () => {
        if (sound) { await sound.pauseAsync(); setIsPlaying(false); }
    };

    useEffect(() => { 
        return () => { if (sound) sound.unloadAsync(); }; 
    }, [sound]);

    const progressPercent = position && duration ? (position / duration) * 100 : 0;
    const iconColor = isMe ? (isDark ? "#dcfce7" : "#54656f") : (isDark ? "#8696a0" : "#54656f");
    const trackColor = isMe ? (isDark ? "#2a3942" : "#b3d9b3") : (isDark ? "#2a3942" : "#d1d7db");
    const progressColor = isMe ? (isDark ? "#00a884" : "#005c4b") : "#34b7f1";

    return (
        <View className="flex-row items-center gap-3 min-w-[200px] py-2 px-2">
            <TouchableOpacity onPress={isPlaying ? stopSound : playSound}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={28} color={iconColor} />
            </TouchableOpacity>
            <View className="flex-1 justify-center">
                <View style={{ height: 3, backgroundColor: trackColor, borderRadius: 2, width: '100%' }}>
                    <View style={{ width: `${progressPercent}%`, height: 3, backgroundColor: progressColor, borderRadius: 2 }} />
                </View>
                <Text style={{ fontSize: 10, color: iconColor, marginTop: 4 }}>
                    {isPlaying ? formatDuration(position) : formatDuration(duration || 0)}
                </Text>
            </View>
            <View className="absolute -bottom-1 -left-1">
                 <MaterialIcons name="mic" size={14} color={iconColor} />
            </View>
        </View>
    );
};

// --- 💬 Main Chat Screen ---
const Conversation = () => {
  const { receiverId, userName } = useLocalSearchParams();
  const router = useRouter();
  const currentUser = auth.currentUser;
  const flatListRef = useRef<FlatList>(null);

  // States
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [receiverData, setReceiverData] = useState<any>(null);
  const [isReceiverOnline, setIsReceiverOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Media States
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Call States
  const [isCalling, setIsCalling] = useState(false); // Outgoing
  const [incomingCall, setIncomingCall] = useState<any>(null); // Incoming

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  // WhatsApp Colors
  const headerColor = isDark ? "#1f2c34" : "#008069";
  const bgWallpaper = isDark ? "#0b141a" : "#efe7dd"; 
  const inputBg = isDark ? "#1f2c34" : "#ffffff";
  const myMsgBg = isDark ? "#005c4b" : "#e7ffdb";
  const otherMsgBg = isDark ? "#1f2c34" : "#ffffff";
  const textColor = isDark ? "#e9edef" : "#111b21";
  const subTextColor = isDark ? "#8696a0" : "#667781";

  // 1. Receiver Online Status Listener
  useEffect(() => {
    if (receiverId) {
        const unsubscribe = onSnapshot(doc(db, "users", receiverId as string), (doc) => {
            if (doc.exists()) {
                setReceiverData(doc.data());
                setIsReceiverOnline(doc.data()?.isOnline || false);
            }
        });
        return () => unsubscribe();
    }
  }, [receiverId]);

  // 2. Chat Init, My Online Status & Incoming Calls
  useEffect(() => {
      const init = async () => {
        if (currentUser && receiverId) {
            const id = await initializeChat(currentUser.uid, receiverId as string);
            setChatId(id);
            setLoading(false);
            
            // Set Me Online
            updateDoc(doc(db, "users", currentUser.uid), { isOnline: true });
        }
      };
      init();

      // App State Change (Set Offline when app closes)
      if (currentUser) {
          const subscription = AppState.addEventListener("change", (nextAppState) => {
              const status = nextAppState === "active";
              updateDoc(doc(db, "users", currentUser.uid), { isOnline: status });
          });

          // Incoming Call Listener
          const unsubscribeCall = listenForIncomingCalls(currentUser.uid, (call) => {
              setIncomingCall(call);
          });

          return () => {
              updateDoc(doc(db, "users", currentUser.uid), { isOnline: false });
              subscription.remove();
              unsubscribeCall();
          };
      }
  }, [currentUser, receiverId]);

  useLayoutEffect(() => {
    if (!chatId) return;
    const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, [chatId]);

  // --- Handlers ---
  const handleSendText = async () => {
    if (inputText.trim() === "" || !chatId || !currentUser) return;
    const textToSend = inputText;
    setInputText(""); 
    try { await sendMessage(chatId, textToSend, currentUser.uid, 'text'); } catch(e){}
  };

  const handleSendImage = async () => {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
        if (!result.canceled && chatId && currentUser) {
            setUploading(true);
            const imageUrl = await uploadToCloudinary(result.assets[0].uri);
            if (imageUrl) await sendMessage(chatId, imageUrl, currentUser.uid, 'image');
            setUploading(false);
        }
    } catch (e) { setUploading(false); }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (e) {}
  };

  const stopRecordingAndSend = async () => {
    if (!recording || !chatId || !currentUser) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    setRecording(null);
    if (uri) {
        setUploading(true);
        const audioUrl = await uploadToCloudinary(uri, 'auto'); 
        if (audioUrl) await sendMessage(chatId, audioUrl, currentUser.uid, 'audio');
        setUploading(false);
    }
  };

  // --- Call Logic ---
  const startCall = async () => {
      if (!currentUser || !receiverId) return;
      setIsCalling(true);
      // Start call signal
      await startVoiceCall(currentUser.uid, receiverId as string, currentUser.displayName || "User", currentUser.photoURL || "");
  };

  const endCall = async () => {
      setIsCalling(false);
      setIncomingCall(null);
      if (currentUser && receiverId && chatId) {
          await endVoiceCall(currentUser.uid, receiverId as string);
          // Log missed call
          await sendCallLog(chatId, currentUser.uid, "Missed Call");
      }
  };

  const answerCall = () => {
      setIncomingCall(null); // Close modal
      if(chatId && currentUser) {
          // Log answered call
          sendCallLog(chatId, currentUser.uid, "Voice Call");
      }
  };

  // --- Message Renderer ---
  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === currentUser?.uid;
    const isImage = item.type === 'image';
    const isAudio = item.type === 'audio';
    const isCall = item.type === 'call';

    // ✅ Call Log Message (Center)
    if (isCall) {
        return (
            <View className="items-center my-2">
                <View className={`px-4 py-1 rounded-full bg-gray-400/20 flex-row items-center gap-2`}>
                    <Ionicons name="call" size={14} color={isDark ? "white" : "black"} />
                    <Text className={`${isDark ? "text-white" : "text-black"} text-xs font-bold`}>{item.text}</Text>
                    <Text className="text-gray-500 text-[10px]">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
            </View>
        );
    }

    return (
      <View className={`flex-row ${isMe ? "justify-end" : "justify-start"} mb-1 px-2`}>
        <View 
            style={{ 
                backgroundColor: isMe ? myMsgBg : otherMsgBg,
                borderRadius: 12, borderTopRightRadius: isMe ? 0 : 12, borderTopLeftRadius: isMe ? 12 : 0,
                padding: isImage ? 3 : 8, maxWidth: '85%', minWidth: isAudio ? 180 : 'auto',
                shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1
            }}
        >
          {isImage ? (
             <TouchableOpacity onPress={() => setSelectedImage(item.text)} activeOpacity={0.9}>
                 <Image source={{ uri: item.text }} style={{ width: 240, height: 240, borderRadius: 8 }} resizeMode="cover" />
                 {/* Time Overlay */}
                 <View className="absolute bottom-1 right-2 bg-black/30 px-1 rounded flex-row items-center">
                    <Text style={{ color: 'white', fontSize: 10, marginRight: 2 }}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isMe && <Ionicons name="checkmark-done" size={12} color="#53bdeb" />}
                 </View>
             </TouchableOpacity>
          ) : isAudio ? (
             <AudioMessage uri={item.text} isMe={isMe} isDark={isDark} />
          ) : (
             <Text style={{ color: textColor, fontSize: 16, lineHeight: 22, paddingHorizontal: 4 }}>{item.text}</Text>
          )}

          {!isImage && (
              <View className="flex-row justify-end items-center gap-1 mt-1">
                 <Text style={{ color: subTextColor, fontSize: 10 }}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </Text>
                 {isMe && <Ionicons name="checkmark-done" size={15} color={isDark ? "#53bdeb" : "#53bdeb"} />}
              </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: headerColor }}> 
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={headerColor} />

      {/* --- Header --- */}
      <SafeAreaView style={{ backgroundColor: headerColor }}>
        <View className="flex-row items-center px-2 py-2" style={{ height: 60 }}>
            <TouchableOpacity onPress={() => router.back()} className="flex-row items-center rounded-full mr-1">
                <MaterialIcons name="arrow-back" size={24} color="white" />
                <Image 
                    source={receiverData?.photoUrl ? { uri: receiverData.photoUrl } : require("@/assets/images/icon.png")} 
                    style={{ width: 36, height: 36, borderRadius: 18, marginLeft: 4 }} 
                />
            </TouchableOpacity>

            <View className="flex-1 ml-2">
                <Text className="font-bold text-white text-lg" numberOfLines={1}>{receiverData?.name || userName || "User"}</Text>
                {/* Online Indicator */}
                <Text className="text-xs text-gray-200">{uploading ? "Sending..." : (isReceiverOnline ? "Online" : "Offline")}</Text>
            </View>

            <View className="flex-row gap-5 mr-2">
                <TouchableOpacity onPress={startCall}><Ionicons name="call" size={22} color="white" /></TouchableOpacity>
                <Entypo name="dots-three-vertical" size={18} color="white" />
            </View>
        </View>
      </SafeAreaView>

      {/* --- Body --- */}
      <View style={{ flex: 1, backgroundColor: bgWallpaper }}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : undefined} 
            keyboardVerticalOffset={0}
          >
            {loading ? (
                <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#008069" /></View>
            ) : (
                <>
                    <FlatList
                        ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={(item) => item._id}
                        inverted contentContainerStyle={{ paddingVertical: 10, paddingBottom: 10 }}
                    />
                    {/* Input Bar */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', padding: 6, paddingBottom: 10 }}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 24, paddingHorizontal: 12, paddingVertical: 8, marginRight: 6, minHeight: 48, elevation: 1 }}>
                            <TouchableOpacity><FontAwesome5 name="smile" size={24} color={subTextColor} /></TouchableOpacity>
                            <TextInput
                                style={{ flex: 1, marginHorizontal: 10, color: textColor, fontSize: 16, maxHeight: 100 }}
                                placeholder={isRecording ? "Recording..." : "Message"} placeholderTextColor={subTextColor}
                                value={inputText} onChangeText={setInputText} multiline editable={!isRecording}
                            />
                            <View className="flex-row gap-4">
                                <TouchableOpacity onPress={handleSendImage}><Entypo name="attachment" size={20} color={subTextColor} /></TouchableOpacity>
                                {!inputText && <TouchableOpacity onPress={handleSendImage}><Ionicons name="camera" size={24} color={subTextColor} /></TouchableOpacity>}
                            </View>
                        </View>
                        <TouchableOpacity onPress={inputText ? handleSendText : (isRecording ? stopRecordingAndSend : startRecording)} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isRecording ? "#ef4444" : "#00a884", justifyContent: 'center', alignItems: 'center', elevation: 2 }}>
                            {inputText ? <Ionicons name="send" size={20} color="white" style={{ marginLeft: 2 }} /> : <MaterialIcons name={isRecording ? "stop" : "mic"} size={24} color="white" />}
                        </TouchableOpacity>
                    </View>
                </>
            )}
          </KeyboardAvoidingView>
      </View>

      {/* --- Image Modal (Full Screen) --- */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
          <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setSelectedImage(null)} style={{ position: 'absolute', top: 40, left: 20, zIndex: 10, padding: 10 }}>
                  <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              {selectedImage && <Image source={{ uri: selectedImage }} style={{ width: width, height: '100%' }} resizeMode="contain" />}
          </View>
      </Modal>

      {/* --- 🟢 OUTGOING CALL SCREEN --- */}
      <Modal visible={isCalling} animationType="slide" onRequestClose={endCall}>
          <View style={{ flex: 1, backgroundColor: '#0f1c24', alignItems: 'center', paddingTop: 80 }}>
              <View className="items-center mb-10">
                  <Image source={receiverData?.photoUrl ? { uri: receiverData.photoUrl } : require("@/assets/images/icon.png")} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20 }} />
                  <Text className="text-white text-3xl font-bold">{receiverData?.name || "User"}</Text>
                  <Text className="text-gray-400 text-lg mt-2">Calling...</Text>
              </View>
              <View style={{ position: 'absolute', bottom: 50, width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity onPress={endCall} className="p-6 bg-red-600 rounded-full elevation-5">
                      <MaterialIcons name="call-end" size={40} color="white" />
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

      {/* --- 🔴 INCOMING CALL SCREEN --- */}
      <Modal visible={!!incomingCall} animationType="slide" onRequestClose={() => {}}>
          <View style={{ flex: 1, backgroundColor: '#0f1c24', alignItems: 'center', paddingTop: 80 }}>
              <View className="items-center mb-10">
                  <Image source={incomingCall?.callerPhoto ? { uri: incomingCall.callerPhoto } : require("@/assets/images/icon.png")} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20 }} />
                  <Text className="text-white text-3xl font-bold">{incomingCall?.callerName || "Unknown"}</Text>
                  <Text className="text-gray-400 text-lg mt-2">Incoming Voice Call...</Text>
              </View>
              <View style={{ position: 'absolute', bottom: 80, width: '100%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => { endVoiceCall(incomingCall.callerId, currentUser!.uid); setIncomingCall(null); }} className="p-5 bg-red-600 rounded-full">
                      <MaterialIcons name="call-end" size={35} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={answerCall} className="p-5 bg-green-500 rounded-full">
                      <MaterialIcons name="call" size={35} color="white" />
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </View>
  );
};

export default Conversation;