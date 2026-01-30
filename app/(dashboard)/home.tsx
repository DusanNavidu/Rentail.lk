import { View, Text, Image, TextInput, FlatList, ScrollView, Keyboard } from 'react-native'
import React from 'react'
import { Ionicons, EvilIcons, AntDesign } from "@expo/vector-icons"
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {

  // Icons පෙනෙන්න PNG links දැම්මා
  const brands = [
    { id: 1, name: 'Toyota', logo: 'https://img.icons8.com/ios-filled/100/ffffff/toyota.png' },
    { id: 2, name: 'Suzuki', logo: 'https://img.icons8.com/ios-filled/100/ffffff/suzuki.png' },
    { id: 3, name: 'Honda', logo: 'https://img.icons8.com/ios-filled/100/ffffff/honda.png' },
    { id: 4, name: 'Nissan', logo: 'https://img.icons8.com/ios-filled/100/ffffff/nissan.png' },
    { id: 5, name: 'Mitsubishi', logo: 'https://img.icons8.com/ios-filled/100/ffffff/mitsubishi.png' },
    { id: 6, name: 'Mazda', logo: 'https://img.icons8.com/ios-filled/100/ffffff/mazda.png' },
    { id: 7, name: 'Kia', logo: 'https://img.icons8.com/ios-filled/100/ffffff/kia.png' },
    { id: 8, name: 'Hyundai', logo: 'https://img.icons8.com/ios-filled/100/ffffff/hyundai.png' },
    { id: 9, name: 'BMW', logo: 'https://img.icons8.com/ios-filled/100/ffffff/bmw.png' },
    { id: 10, name: 'Benz', logo: 'https://img.icons8.com/ios-filled/100/ffffff/mercedes-benz.png' },
    { id: 11, name: 'Audi', logo: 'https://img.icons8.com/ios-filled/100/ffffff/audi.png' },
    { id: 12, name: 'Land Rover', logo: 'https://img.icons8.com/ios-filled/100/ffffff/land-rover.png' },
    { id: 13, name: 'Ford', logo: 'https://img.icons8.com/ios-filled/100/ffffff/ford.png' },
    { id: 14, name: 'Mahindra', logo: 'https://i.pinimg.com/originals/33/12/35/33123512351235.png' }, 
    { id: 15, name: 'Tata', logo: 'https://img.icons8.com/ios-filled/100/ffffff/tata.png' }, 
    { id: 16, name: 'Others', icon: 'plus' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        <View className='flex flex-row mt-2 justify-between items-center'>
          <View className='flex flex-row items-center gap-3'>
            <Image
              source={require("../../assets/images/icon.png")}
              className="w-10 h-10 bg-white rounded-xl p-4"
              resizeMode="contain"
            />
            <Text className="text-3xl font-bold">Rentail.lk</Text>
          </View>
          <View className='flex-1 flex-row justify-end items-center gap-3'>
            <Ionicons name="notifications-outline" size={28} color="black" />
            <View className="w-10 h-10 bg-gray-200 rounded-full border border-gray-300 overflow-hidden">
                 <Image 
                    source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
                    className="w-full h-full"
                    resizeMode="cover"
                 />
            </View>
          </View>
        </View>

        <View className='mt-4 bg-black h-[1px] w-full'></View>
        
        {/* Search Bar */}
        <View className='relative'>
          <TextInput 
            placeholder='Search your dream car...'
            className='mt-4 rounded-[10px] px-4 py-3 text-base'
            style={{ paddingLeft: 40, borderColor: 'gray', borderWidth: 1 }}
          />
          <EvilIcons name="search" size={28} color="gray" className='absolute top-[22px] left-[10px]' />
        </View>

        <View className='mt-5'> 
          <Text className='text-[20px] font-bold mb-4'>Brands</Text>
          
          <FlatList
            horizontal
            data={brands}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            renderItem={({ item }) => (
              <View className='items-center mr-5'>
                <View className='w-[60px] h-[60px] bg-black rounded-full justify-center items-center shadow-sm'>
                  {item.name === 'Others' ? (
                    <AntDesign name="plus" size={30} color="white" />
                  ) : (
                    <Image 
                      source={{ uri: item.logo }} 
                      className='w-10 h-10'
                      resizeMode='contain'
                    />
                  )}
                </View>
                <Text className='text-xs font-semibold mt-2 text-center text-gray-800'>
                  {item.name}
                </Text>
              </View>
            )}
          />
        </View>

        <Text className='text-[20px] font-bold mt-5'>Best Cars</Text>
        <Text className='text-[20px] font-bold mt-3'>Nearby</Text>

        <View className="h-24"></View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Home