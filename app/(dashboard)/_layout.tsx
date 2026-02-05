import React, { useContext } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "@/context/ThemeContext";

const tabs = [
  { name: "home", title: "Home", icon: "home" },
  { name: "search", title: "Search", icon: "search" },
  { name: "add", title: "Add", icon: "add" },
  { name: "news", title: "News", icon: "notifications" },
  { name: "profile", title: "Profile", icon: "person" }
] as const;

const DashboardLayout = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const tabBarBackgroundColor = isDark ? "#1f2937" : "#000000";
  const activeTintColor = "#ffffff"; 
  const inactiveTintColor = "#9ca3af";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          borderTopWidth: 0,    
          height: 60,     
          paddingBottom: 8,   
          position: "absolute", 
          bottom: 40,
          marginHorizontal: 10,
          borderRadius: 30,   
          paddingTop: 8,
          borderWidth: 0,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 5 },
          elevation: 5,
        },

        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
      }}
    >
      {tabs.map(({ name, title, icon }: any) => {
        const isAdd = name === "add";

        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: title,
              tabBarIcon: ({ color, size }) => {
                
                if (isAdd) {
                  return (
                    <View style={{
                        width: 60,
                        height: 60, 
                        borderRadius: 30,
                        backgroundColor: "white",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 40,
                        shadowColor: "#000",
                        shadowOpacity: 0.3,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 5,
                          borderWidth: 4,
                          borderColor: isDark ? "#121212" : "#f2f2f2"
                    }}>
                      <MaterialIcons name={icon} color="black" size={32} /> 
                    </View>
                  );
                }

                return <MaterialIcons name={icon} color={color} size={size} />;
              },
            }}
          />
        );
      })}
    </Tabs>
  );
};

export default DashboardLayout;