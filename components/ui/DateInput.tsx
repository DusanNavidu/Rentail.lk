import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Feather } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateInputProps {
    label: string;
    value: string; // Ensure this is always passed as a string (YYYY-MM-DD)
    onChange: (date: string) => void;
    iconColor?: string;
    isDark: boolean;
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange, iconColor = "#10b981", isDark }) => {
    const [show, setShow] = useState(false);
    
    // Safely create Date object for the picker
    const dateValue = value ? new Date(value) : new Date();

    const textMain = isDark ? "text-white" : "text-black";
    const textSub = isDark ? "text-gray-400" : "text-gray-500";
    const inputBg = isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200";

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShow(false); // Close picker first
        if (event.type === "set" && selectedDate) {
            // Force YYYY-MM-DD format string
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
                
                {/* 🔴 CRITICAL FIX: Ensure 'value' is rendered as a string explicitly */}
                <Text className={`flex-1 ml-3 ${value ? textMain : 'text-[#9ca3af]'}`}>
                    {value ? String(value) : "Select Date"}
                </Text>
            </TouchableOpacity>

            {/* Render DatePicker only when show is true */}
            {show ? (
                <DateTimePicker
                    value={dateValue}
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