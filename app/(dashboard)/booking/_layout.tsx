import { Stack } from "expo-router";
import React from "react";

const BookingLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Booking List" }} />
      <Stack.Screen name="[id]" options={{ title: "Booking Form" }} />
    </Stack>
  );
};

export default BookingLayout;