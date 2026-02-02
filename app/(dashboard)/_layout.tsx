import React from "react"
import { Tabs } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

const tabs = [
  { name: "home", title: "Home", icon: "home" },
  { name: "search", title: "Search", icon: "search" },
  { name: "add", title: "Add", icon: "add" },
  { name: "news", title: "News", icon: "notifications" },
  { name: "profile", title: "Profile", icon: "person" }
] as const

const DashboardLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarShowLabel: false,
        
        tabBarStyle: {
          backgroundColor: "black", 
          borderTopWidth: 0,    
          height: 60,
          paddingBottom: 8,   
          position: "absolute", 
          bottom: 40,
          marginHorizontal: 10,
          borderRadius: 30,   
          paddingTop: 8,
        },

        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
      }}
    >
      {tabs.map(({ name, title, icon }: any) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: title,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={icon} color={color} size={size} />
            )
          }}
        />
      ))}
    </Tabs>
  )
}

export default DashboardLayout