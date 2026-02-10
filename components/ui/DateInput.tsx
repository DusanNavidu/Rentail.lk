import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Feather } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateInputProps {
    label: string;
    value: string; // YYYY-MM-DD string
    onChange: (date: string) => void;
    iconColor?: string;
    isDark: boolean;
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange, iconColor = "#10b981", isDark }) => {
    const [show, setShow] = useState(false);
    
    // Theme Colors
    const textMain = isDark ? "text-white" : "text-black";
    const textSub = isDark ? "text-gray-400" : "text-gray-500";
    const inputBg = isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200";

    const handleDateChange = (event: any, selectedDate?: Date) => {
        // Android requires checking for 'set' action and closing modal
        setShow(false);
        
        if (event.type === "set" && selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            onChange(formattedDate);
        }
    };

    return (
        <View className="mb-4">
            <Text className={`text-xs mb-2 font-bold ${textSub}`}>{label}</Text>
            
            <TouchableOpacity 
                onPress={() => setShow(true)}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 h-12 rounded-xl border ${inputBg}`}
            >
                <Feather name="calendar" size={18} color={iconColor} />
                
                {/* Text Component එක ඇතුලෙම ලියන්න */}
                <Text className={`flex-1 ml-3 ${value ? textMain : 'text-[#9ca3af]'}`}>
                    {value ? value : "Select Date"}
                </Text>
            </TouchableOpacity>

            {/* Conditional Rendering එක ආරක්ෂිතව */}
            {show ? (
                <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()} 
                />
            ) : null}
        </View>
    );
};

export default DateInput;