import { View, Text, ActivityIndicator } from "react-native"

const NoConnection = () => {
    return (
        <View className="flex-1 justify-center items-center bg-gray-50">
            <Text className="text-lg text-gray-500">No Internet Connection</Text>
        </View>
    )
}