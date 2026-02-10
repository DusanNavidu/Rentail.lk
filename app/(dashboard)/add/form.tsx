import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { MaterialIcons, Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useLoader } from "@/hooks/useLoader";
import { addVehicle, getVehicleById, updateVehicle } from "@/services/vehicleService";
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ThemeContext } from "@/context/ThemeContext";

const provinces = [
  { label: 'WP (Western)', value: 'WP' },
  { label: 'CP (Central)', value: 'CP' },
  { label: 'SP (Southern)', value: 'SP' },
  { label: 'NP (Northern)', value: 'NP' },
  { label: 'EP (Eastern)', value: 'EP' },
  { label: 'NW (North Western)', value: 'NW' },
  { label: 'NC (North Central)', value: 'NC' },
  { label: 'UP (Uva)', value: 'UP' },
  { label: 'SG (Sabaragamuwa)', value: 'SG' },
];

const brands = [
  { label: 'Toyota', value: 'Toyota' },
  { label: 'Nissan', value: 'Nissan' },
  { label: 'Honda', value: 'Honda' },
  { label: 'Suzuki', value: 'Suzuki' },
  { label: 'Mitsubishi', value: 'Mitsubishi' },
  { label: 'Mazda', value: 'Mazda' },
  { label: 'Daihatsu', value: 'Daihatsu' },
  { label: 'Subaru', value: 'Subaru' },
  { label: 'Isuzu', value: 'Isuzu' },
  { label: 'Micro', value: 'Micro' },
  { label: 'Kia', value: 'Kia' },
  { label: 'Hyundai', value: 'Hyundai' },
  { label: 'BMW', value: 'BMW' },
  { label: 'Mercedes-Benz', value: 'Mercedes-Benz' },
  { label: 'Audi', value: 'Audi' },
  { label: 'Land Rover', value: 'Land Rover' },
  { label: 'Lexus', value: 'Lexus' },
  { label: 'Tata', value: 'Tata' },
  { label: 'Mahindra', value: 'Mahindra' },
  { label: 'Bajaj', value: 'Bajaj' },
  { label: 'TVS', value: 'TVS' },
  { label: 'Yamaha', value: 'Yamaha' },
  { label: 'Hero', value: 'Hero' },
  { label: 'Royal Enfield', value: 'Royal Enfield' },
  { label: 'KTM', value: 'KTM' },
  { label: 'Peugeot', value: 'Peugeot' },
  { label: 'Renault', value: 'Renault' },
  { label: 'MG', value: 'MG' },
  { label: 'DFSK', value: 'DFSK' },
  { label: 'Ford', value: 'Ford' },
  { label: 'Chevrolet', value: 'Chevrolet' },
  { label: 'Jeep', value: 'Jeep' },
  { label: 'Jaguar', value: 'Jaguar' },
  { label: 'Porsche', value: 'Porsche' },
  { label: 'Volvo', value: 'Volvo' },
  { label: 'Mini', value: 'Mini' },
  { label: 'Volkswagen', value: 'Volkswagen' },
  { label: 'SsangYong', value: 'SsangYong' },
  { label: 'Geely', value: 'Geely' },
  { label: 'Chery', value: 'Chery' },
  { label: 'Zotye', value: 'Zotye' },
  { label: 'Changan', value: 'Changan' },
  { label: 'Foton', value: 'Foton' },
  { label: 'Hino', value: 'Hino' },
  { label: 'Lanka Ashok Leyland', value: 'Lanka Ashok Leyland' },
  { label: 'Eicher', value: 'Eicher' },
  { label: 'JMC', value: 'JMC' },
  { label: 'Perodua', value: 'Perodua' },
  { label: 'Proton', value: 'Proton' },
  { label: 'Tesla', value: 'Tesla' },
  { label: 'Other', value: 'Other' },
];

const modelsByBrand: { [key: string]: { label: string; value: string }[] } = {
  Toyota: [
    { label: 'Allion', value: 'Allion' }, { label: 'Premio', value: 'Premio' }, { label: 'Axio', value: 'Axio' },
    { label: 'Corolla', value: 'Corolla' }, { label: 'Vitz', value: 'Vitz' }, { label: 'Yaris', value: 'Yaris' },
    { label: 'Prius', value: 'Prius' }, { label: 'Aqua', value: 'Aqua' }, { label: 'Wigo', value: 'Wigo' },
    { label: 'Passo', value: 'Passo' }, { label: 'Tank', value: 'Tank' }, { label: 'Roomy', value: 'Roomy' },
    { label: 'C-HR', value: 'C-HR' }, { label: 'Raize', value: 'Raize' }, { label: 'Rush', value: 'Rush' },
    { label: 'Harrier', value: 'Harrier' }, { label: 'Prado', value: 'Prado' }, { label: 'Land Cruiser', value: 'Land Cruiser' },
    { label: 'Hilux', value: 'Hilux' }, { label: 'KDH (Hiace)', value: 'KDH' }, { label: 'Noah/Voxy', value: 'Noah' },
    { label: 'Coaster (Bus)', value: 'Coaster' }, { label: 'Dyna (Lorry)', value: 'Dyna' }
  ],
  Nissan: [
    { label: 'Sunny', value: 'Sunny' }, { label: 'Bluebird', value: 'Bluebird' }, { label: 'Leaf', value: 'Leaf' },
    { label: 'March', value: 'March' }, { label: 'Dayz', value: 'Dayz' }, { label: 'X-Trail', value: 'X-Trail' },
    { label: 'Patrol', value: 'Patrol' }, { label: 'Navara', value: 'Navara' }, { label: 'Caravan', value: 'Caravan' },
    { label: 'NV200', value: 'NV200' }, { label: 'Juke', value: 'Juke' }, { label: 'Civilian (Bus)', value: 'Civilian' },
    { label: 'Atlas (Lorry)', value: 'Atlas' }
  ],
  Honda: [
    { label: 'Civic', value: 'Civic' }, { label: 'Fit / Jazz', value: 'Fit' }, { label: 'Vezel', value: 'Vezel' },
    { label: 'Grace', value: 'Grace' }, { label: 'Insight', value: 'Insight' }, { label: 'CR-V', value: 'CR-V' },
    { label: 'Accord', value: 'Accord' }, { label: 'Freed', value: 'Freed' }, { label: 'N-WGN', value: 'N-WGN' },
    { label: 'Dio (Bike)', value: 'Dio' }, { label: 'Hornet (Bike)', value: 'Hornet' }, { label: 'CBR (Bike)', value: 'CBR' }
  ],
  Suzuki: [
    { label: 'Alto', value: 'Alto' }, { label: 'Wagon R', value: 'Wagon R' }, { label: 'Swift', value: 'Swift' },
    { label: 'Celerio', value: 'Celerio' }, { label: 'Baleno', value: 'Baleno' }, { label: 'Spacia', value: 'Spacia' },
    { label: 'Hustler', value: 'Hustler' }, { label: 'Every', value: 'Every' }, { label: 'Vitara', value: 'Vitara' },
    { label: 'Jimny', value: 'Jimny' }, { label: 'Maruti', value: 'Maruti' }, { label: 'GN125 (Bike)', value: 'GN125' }
  ],
  Mitsubishi: [
    { label: 'Lancer', value: 'Lancer' }, { label: 'Montero', value: 'Montero' }, { label: 'Pajero', value: 'Pajero' },
    { label: 'Outlander', value: 'Outlander' }, { label: 'L200 / Triton', value: 'L200' }, { label: 'Xpander', value: 'Xpander' },
    { label: 'Eclipse Cross', value: 'Eclipse Cross' }, { label: 'Mirage', value: 'Mirage' }, { label: 'Rosa (Bus)', value: 'Rosa' },
    { label: 'Canter (Lorry)', value: 'Canter' }
  ],
  Mazda: [
    { label: 'Axela (3)', value: 'Axela' }, { label: 'Demio (2)', value: 'Demio' }, { label: 'Atenza (6)', value: 'Atenza' },
    { label: 'CX-5', value: 'CX-5' }, { label: 'CX-3', value: 'CX-3' }, { label: 'Flair', value: 'Flair' },
    { label: 'Bongo', value: 'Bongo' }, { label: 'Titan (Lorry)', value: 'Titan' }
  ],
  Daihatsu: [
    { label: 'Mira', value: 'Mira' }, { label: 'Hijet', value: 'Hijet' }, { label: 'Terios', value: 'Terios' },
    { label: 'Charade', value: 'Charade' }, { label: 'Rocky', value: 'Rocky' }, { label: 'Delta (Lorry)', value: 'Delta' }
  ],
  Subaru: [
    { label: 'Impreza', value: 'Impreza' }, { label: 'Forester', value: 'Forester' }, { label: 'XV', value: 'XV' },
    { label: 'Legacy', value: 'Legacy' }, { label: 'WRX', value: 'WRX' }
  ],
  Isuzu: [
    { label: 'Elf (Lorry)', value: 'Elf' }, { label: 'N-Series', value: 'N-Series' }, { label: 'D-Max', value: 'D-Max' },
    { label: 'MU-X', value: 'MU-X' }, { label: 'Journey (Bus)', value: 'Journey' }
  ],
  Micro: [
    { label: 'Panda', value: 'Panda' }, { label: 'Panda Cross', value: 'Panda Cross' }, { label: 'Tivoli', value: 'Tivoli' },
    { label: 'Rexton', value: 'Rexton' }, { label: 'Kyron', value: 'Kyron' }, { label: 'Korando', value: 'Korando' },
    { label: 'Actyon', value: 'Actyon' }, { label: 'Emgrand', value: 'Emgrand' }, { label: 'Glory', value: 'Glory' }
  ],
  Kia: [
    { label: 'Sorento', value: 'Sorento' }, { label: 'Sportage', value: 'Sportage' }, { label: 'Picanto', value: 'Picanto' },
    { label: 'Rio', value: 'Rio' }, { label: 'Carnival', value: 'Carnival' }, { label: 'Stonic', value: 'Stonic' }
  ],
  Hyundai: [
    { label: 'Tucson', value: 'Tucson' }, { label: 'Santa Fe', value: 'Santa Fe' }, { label: 'Elantra', value: 'Elantra' },
    { label: 'Grand i10', value: 'Grand i10' }, { label: 'Sonata', value: 'Sonata' }, { label: 'Kona', value: 'Kona' },
    { label: 'Porter (Lorry)', value: 'Porter' }
  ],
  BMW: [
    { label: '3 Series', value: '3 Series' }, { label: '5 Series', value: '5 Series' }, { label: '7 Series', value: '7 Series' },
    { label: 'X1', value: 'X1' }, { label: 'X3', value: 'X3' }, { label: 'X5', value: 'X5' }, { label: 'i8', value: 'i8' }
  ],
  'Mercedes-Benz': [
    { label: 'C-Class', value: 'C-Class' }, { label: 'E-Class', value: 'E-Class' }, { label: 'S-Class', value: 'S-Class' },
    { label: 'CLA', value: 'CLA' }, { label: 'GLA', value: 'GLA' }, { label: 'Vito', value: 'Vito' }
  ],
  Audi: [
    { label: 'A3', value: 'A3' }, { label: 'A4', value: 'A4' }, { label: 'A6', value: 'A6' },
    { label: 'Q2', value: 'Q2' }, { label: 'Q3', value: 'Q3' }, { label: 'Q5', value: 'Q5' }, { label: 'Q7', value: 'Q7' }
  ],
  'Land Rover': [
    { label: 'Defender', value: 'Defender' }, { label: 'Range Rover', value: 'Range Rover' },
    { label: 'Range Rover Sport', value: 'Range Rover Sport' }, { label: 'Evoque', value: 'Evoque' },
    { label: 'Discovery', value: 'Discovery' }
  ],
  Lexus: [
    { label: 'NX', value: 'NX' }, { label: 'RX', value: 'RX' }, { label: 'LX', value: 'LX' }, { label: 'CT200h', value: 'CT200h' }
  ],
  Tata: [
    { label: 'Nano', value: 'Nano' }, { label: 'Indica', value: 'Indica' }, { label: 'Indigo', value: 'Indigo' },
    { label: 'Nexon', value: 'Nexon' }, { label: 'Tiago', value: 'Tiago' }, { label: 'Ace (Batta)', value: 'Ace' },
    { label: 'Xenon', value: 'Xenon' }, { label: 'LPK (Lorry)', value: 'LPK' }, { label: 'Marcopolo (Bus)', value: 'Marcopolo' }
  ],
  Mahindra: [
    { label: 'Bolero', value: 'Bolero' }, { label: 'Scorpio', value: 'Scorpio' }, { label: 'KUV100', value: 'KUV100' },
    { label: 'XUV500', value: 'XUV500' }, { label: 'Maxximo', value: 'Maxximo' }, { label: 'e2o', value: 'e2o' }
  ],
  Bajaj: [
    { label: 'RE 205 (Three Wheel)', value: 'RE 205' }, { label: 'RE 4S', value: 'RE 4S' }, { label: 'Qute', value: 'Qute' },
    { label: 'Pulsar', value: 'Pulsar' }, { label: 'CT 100', value: 'CT 100' }, { label: 'Platina', value: 'Platina' },
    { label: 'Discover', value: 'Discover' }, { label: 'Boxer', value: 'Boxer' }
  ],
  TVS: [
    { label: 'King (Three Wheel)', value: 'King' }, { label: 'Apache', value: 'Apache' }, { label: 'Scooty Pep', value: 'Scooty Pep' },
    { label: 'Ntorq', value: 'Ntorq' }, { label: 'Wego', value: 'Wego' }, { label: 'Jupiter', value: 'Jupiter' }, { label: 'HLX', value: 'HLX' }
  ],
  Yamaha: [
    { label: 'FZ', value: 'FZ' }, { label: 'R15', value: 'R15' }, { label: 'MT-15', value: 'MT-15' }, { label: 'Ray ZR', value: 'Ray ZR' },
    { label: 'Fascino', value: 'Fascino' }, { label: 'TW', value: 'TW' }, { label: 'Outboard Motor (Boat)', value: 'Outboard' }
  ],
  Hero: [
    { label: 'Splendor', value: 'Splendor' }, { label: 'Passion', value: 'Passion' }, { label: 'HF Deluxe', value: 'HF Deluxe' },
    { label: 'Hunk', value: 'Hunk' }, { label: 'Xpulse', value: 'Xpulse' }, { label: 'Pleasure', value: 'Pleasure' }
  ],
  'Royal Enfield': [
    { label: 'Classic 350', value: 'Classic 350' }, { label: 'Bullet', value: 'Bullet' }, { label: 'Himalayan', value: 'Himalayan' },
    { label: 'Meteor', value: 'Meteor' }
  ],
  KTM: [
    { label: 'Duke 125', value: 'Duke 125' }, { label: 'Duke 200', value: 'Duke 200' }, { label: 'RC 125', value: 'RC 125' }, { label: 'RC 200', value: 'RC 200' }
  ],
  Peugeot: [
    { label: '406', value: '406' }, { label: '3008', value: '3008' }, { label: '5008', value: '5008' }, { label: '2008', value: '2008' }
  ],
  Renault: [
    { label: 'Kwid', value: 'Kwid' }, { label: 'Duster', value: 'Duster' }
  ],
  MG: [
    { label: 'ZS', value: 'ZS' }, { label: 'HS', value: 'HS' }, { label: 'Hector', value: 'Hector' }
  ],
  DFSK: [
    { label: 'Glory 580', value: 'Glory 580' }, { label: 'Glory i-Auto', value: 'Glory i-Auto' }, { label: 'V21 (Lorry)', value: 'V21' }
  ],
  Ford: [
    { label: 'Ranger', value: 'Ranger' }, { label: 'Everest', value: 'Everest' }, { label: 'Fiesta', value: 'Fiesta' }, { label: 'Laser', value: 'Laser' }
  ],
  Chevrolet: [
    { label: 'Cruze', value: 'Cruze' }, { label: 'Beat', value: 'Beat' }
  ],
  Jeep: [
    { label: 'Wrangler', value: 'Wrangler' }, { label: 'Cherokee', value: 'Cherokee' }
  ],
  Jaguar: [
    { label: 'XF', value: 'XF' }, { label: 'XJ', value: 'XJ' }, { label: 'F-Pace', value: 'F-Pace' }
  ],
  Porsche: [
    { label: 'Cayenne', value: 'Cayenne' }, { label: 'Macan', value: 'Macan' }, { label: 'Panamera', value: 'Panamera' }
  ],
  Volvo: [
    { label: 'XC90', value: 'XC90' }, { label: 'XC60', value: 'XC60' }, { label: 'S40', value: 'S40' }
  ],
  Mini: [
    { label: 'Cooper', value: 'Cooper' }, { label: 'Countryman', value: 'Countryman' }
  ],
  Volkswagen: [
    { label: 'Beetle', value: 'Beetle' }, { label: 'Golf', value: 'Golf' }, { label: 'Polo', value: 'Polo' }
  ],
  SsangYong: [
    { label: 'Tivoli', value: 'Tivoli' }, { label: 'Rexton', value: 'Rexton' }, { label: 'Kyron', value: 'Kyron' }, { label: 'Korando', value: 'Korando' }
  ],
  Geely: [
    { label: 'MX7', value: 'MX7' }, { label: 'Panda', value: 'Panda' }
  ],
  Chery: [
    { label: 'QQ', value: 'QQ' }, { label: 'Tiggo', value: 'Tiggo' }
  ],
  Zotye: [
    { label: 'Nomad', value: 'Nomad' }, { label: 'Extreme', value: 'Extreme' }
  ],
  Changan: [
    { label: 'Star', value: 'Star' }, { label: 'CS15', value: 'CS15' }
  ],
  Foton: [
    { label: 'Tunland', value: 'Tunland' }, { label: 'View', value: 'View' }, { label: 'Aumark (Lorry)', value: 'Aumark' }
  ],
  Hino: [
    { label: 'Dutro (Lorry)', value: 'Dutro' }, { label: 'Ranger (Lorry)', value: 'Ranger' }, { label: 'Liesse (Bus)', value: 'Liesse' }
  ],
  'Lanka Ashok Leyland': [
    { label: 'Viking (Bus)', value: 'Viking' }, { label: 'Cheetah (Bus)', value: 'Cheetah' }, { label: 'Ecomet (Lorry)', value: 'Ecomet' },
    { label: 'Dost (Lorry)', value: 'Dost' }
  ],
  Eicher: [
    { label: 'Pro 1000', value: 'Pro 1000' }, { label: 'Skyline (Bus)', value: 'Skyline' }
  ],
  JMC: [
    { label: 'Touring', value: 'Touring' }, { label: 'Light Truck', value: 'Light Truck' }
  ],
  Perodua: [
    { label: 'Axia', value: 'Axia' }, { label: 'Bezza', value: 'Bezza' }, { label: 'Viva', value: 'Viva' }
  ],
  Proton: [
    { label: 'Wira', value: 'Wira' }, { label: 'Saga', value: 'Saga' }, { label: 'Exora', value: 'Exora' }
  ],
  Tesla: [
    { label: 'Model S', value: 'Model S' }, { label: 'Model 3', value: 'Model 3' }, { label: 'Model X', value: 'Model X' }
  ],
  Other: [
    { label: 'Other', value: 'Other' }
  ]
};

const categories = [
  { label: 'Car', value: 'Car' },
  { label: 'Van', value: 'Van' },
  { label: 'SUV / Jeep', value: 'SUV' },
  { label: 'Motorbike', value: 'Bike' },
  { label: 'Three Wheel (Tuk Tuk)', value: 'ThreeWheel' },
  { label: 'Bus', value: 'Bus' },
  { label: 'Lorry / Truck', value: 'Lorry' },
  { label: 'Pickup / Crew Cab', value: 'Pickup' },
  { label: 'Heavy Vehicle', value: 'Heavy' },
  { label: 'Boat / Marine', value: 'Boat' },
  { label: 'Other', value: 'Other' },
];

const types = [
  // Cars & SUVs
  { label: 'Sedan', value: 'Sedan' },
  { label: 'Hatchback', value: 'Hatchback' },
  { label: 'Station Wagon', value: 'Wagon' },
  { label: 'Convertible / Coupe', value: 'Coupe' },
  { label: 'SUV / 4x4', value: 'SUV' },
  { label: 'Crossover', value: 'Crossover' },
  { label: 'Luxury / Limousine', value: 'Luxury' },

  // Vans & Buses
  { label: 'Mini Van / MPV', value: 'MPV' },
  { label: 'High Roof Van', value: 'HighRoof' },
  { label: 'Mini Bus / Coach', value: 'MiniBus' },
  { label: 'Large Bus', value: 'LargeBus' },

  // Bikes
  { label: 'Scooter', value: 'Scooter' },
  { label: 'Sport Bike', value: 'SportBike' },
  { label: 'Street / Standard', value: 'StreetBike' },
  { label: 'Cruiser', value: 'Cruiser' },
  { label: 'Off-road / Dirt', value: 'OffRoad' },

  // Heavy & Utility
  { label: 'Double Cab / Crew Cab', value: 'CrewCab' },
  { label: 'Single Cab', value: 'SingleCab' },
  { label: 'Light Truck (Canter)', value: 'LightTruck' },
  { label: 'Heavy Truck / Tipper', value: 'HeavyTruck' },
  { label: 'Freezer Truck', value: 'Freezer' },
  { label: 'Three Wheel (Passenger)', value: 'TukPassenger' },
  { label: 'Three Wheel (Cargo)', value: 'TukCargo' },

  // Marine
  { label: 'Speed Boat', value: 'SpeedBoat' },
  { label: 'Fishing Boat', value: 'FishingBoat' },

  { label: 'Other', value: 'Other' },
];


const CustomInput = ({ isDark, className, ...props }: any) => {
  const bg = isDark ? "bg-gray-800" : "bg-gray-50";
  const border = isDark ? "border-gray-700" : "border-gray-200";
  const text = isDark ? "text-white" : "text-gray-900";
  const placeholder = isDark ? "#9ca3af" : "#6b7280";

  return (
    <TextInput 
        placeholderTextColor={placeholder}
        className={`h-12 px-4 border rounded-xl mb-0 ${bg} ${border} ${text} ${className || ''}`}
        {...props}
    />
  );
};

const Label = ({ isDark, children }: { isDark: boolean, children: string }) => {
  const textColor = isDark ? "text-gray-400" : "text-gray-500";
  return (
    <Text className={`text-sm font-semibold mb-2 ${textColor}`}>{children}</Text>
  );
};

const VehicleForm = () => {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const { showLoader, hideLoader, isLoading } = useLoader();
  
  // Theme Handling
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === 'dark';

  // --- Theme Colors ---
  const bgMain = isDark ? "bg-gray-900" : "bg-white";
  const bgCard = isDark ? "bg-gray-800" : "bg-gray-50";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark ? "bg-gray-800" : "bg-gray-50";
  const inputBorder = isDark ? "border-gray-700" : "border-gray-200";
  const placeholderColor = isDark ? "#9ca3af" : "#6b7280";
  
  // Dropdown Styles
  const dropdownBg = isDark ? '#1f2937' : '#f9fafb';
  const dropdownBorder = isDark ? '#374151' : '#e5e7eb';
  const dropdownText = isDark ? 'white' : '#111827';

  const [loadingData, setLoadingData] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [image, setImage] = useState<string | null>(null);
  
  // Identity
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [modelOptions, setModelOptions] = useState<{ label: string; value: string }[]>([]); 
  const [vehicleCategory, setVehicleCategory] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  
  // --- PLATE DETAILS ---
  const [plateType, setPlateType] = useState<'new' | 'old'>('new');
  const [plateProv, setPlateProv] = useState("");
  const [plateLetters, setPlateLetters] = useState("");
  const [plateNumbers, setPlateNumbers] = useState("");
  
  const [engineNumber, setEngineNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");

  // Rental
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [descFeatures, setDescFeatures] = useState("");
  const [descDetails, setDescDetails] = useState("");
  const [descInfo, setDescInfo] = useState("");
  
  // Location
  const [mapVisible, setMapVisible] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [selectedCoords, setSelectedCoords] = useState({ latitude: 6.9271, longitude: 79.8612 });

  // Owner
  const [ownerName, setOwnerName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");

  useEffect(() => {
    if (editId) {
        setLoadingData(true);
        getVehicleById(editId as string).then((data: any) => {
            setImage(data.imageUrl || null);
            setVehicleBrand(data.vehicleBrand || "");
            const brandModels = modelsByBrand[data.vehicleBrand] || [{ label: 'Other', value: 'Other' }];
            setModelOptions(brandModels);
            setVehicleModel(data.vehicleModel || "");
            setVehicleCategory(data.vehicleCategory || "");
            setVehicleType(data.vehicleType || "");
            
            const plateStr = data.numberPlate || "";
            const parts = plateStr.split('-');
            
            if(parts.length === 3) {
                setPlateType('new');
                setPlateProv(parts[0]); 
                setPlateLetters(parts[1]); 
                setPlateNumbers(parts[2]);
            } else if (parts.length === 2) {
                setPlateType('old');
                setPlateLetters(parts[0]);
                setPlateNumbers(parts[1]);
            } else {
                setPlateType('old');
                setPlateLetters(plateStr);
            }

            setEngineNumber(data.engineNumber || "");
            setChassisNumber(data.chassisNumber || "");
            setPrice(data.price ? data.price.toString() : "");
            setSeats(data.seats ? data.seats.toString() : "");
            setDescDetails(data.description || ""); 
            setLocationName(data.locationName || "");
            if(data.latitude && data.longitude) {
                setSelectedCoords({ latitude: data.latitude, longitude: data.longitude });
            }
            setOwnerName(data.ownerName || "");
            setOwnerId(data.ownerId || "");
            setOwnerContact(data.ownerContact || "");
            setOwnerEmail(data.ownerEmail || "");
            setOwnerAddress(data.ownerAddress || "");
        }).catch((err) => {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load details' });
            router.back();
        }).finally(() => {
            setLoadingData(false);
        });
    }
  }, [editId]);

  const handleBrandChange = (item: { label: string; value: string }) => {
    setVehicleBrand(item.value);
    setVehicleModel("");
    const newModels = modelsByBrand[item.value] || [{ label: 'Other', value: 'Other' }];
    setModelOptions(newModels);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true, aspect: [4, 3], quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Allow location access.' });
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setSelectedCoords({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    setMapVisible(true);
  };

  const handleNext = () => {
    if (currentStep === 1) {
        if (!image) return Toast.show({ type: 'error', text1: 'Image Required 📸', text2: 'Please upload a photo first.' });
    } else if (currentStep === 2) {
        let isPlateValid = false;
        if (plateType === 'new') {
            isPlateValid = !!(plateProv && plateLetters && plateNumbers);
        } else {
            isPlateValid = !!(plateLetters && plateNumbers);
        }

        if (!vehicleBrand || !vehicleModel || !vehicleCategory || !vehicleType || !isPlateValid) {
            return Toast.show({ type: 'error', text1: 'Missing Details ⚠️', text2: 'Please fill identity fields & number plate.' });
        }
    } else if (currentStep === 3) {
        if (!price || !seats || !locationName) {
            return Toast.show({ type: 'error', text1: 'Missing Details ⚠️', text2: 'Price, Seats & Location required.' });
        }
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else router.back();
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    if (!ownerName || !ownerContact) return Toast.show({ type: 'error', text1: 'Owner Details ⚠️', text2: 'Name & Contact required.' });

    showLoader();
    try {
      let fullPlate = "";
      if (plateType === 'new') {
          fullPlate = `${plateProv}-${plateLetters}-${plateNumbers}`.toUpperCase();
      } else {
          fullPlate = `${plateLetters}-${plateNumbers}`.toUpperCase();
      }

      let fullDescription = descDetails;
      if (descFeatures || descInfo) {
          fullDescription = `Features: ${descFeatures}\nDetails: ${descDetails}\nInfo: ${descInfo}`;
      }
      const locData = { address: locationName, latitude: selectedCoords.latitude, longitude: selectedCoords.longitude };
      
      const vehicleData = {
        vehicleBrand, vehicleModel, vehicleCategory, vehicleType, numberPlate: fullPlate,
        engineNumber, chassisNumber, price: Number(price), seats: Number(seats),
        locationName: locationName, latitude: selectedCoords.latitude, longitude: selectedCoords.longitude,
        description: fullDescription, ownerName, ownerId, ownerContact, ownerEmail, ownerAddress
      };

      if (editId) {
          await updateVehicle(editId as string, vehicleData, image!);
          Toast.show({ type: 'success', text1: 'Updated! 🎉' });
      } else {
          await addVehicle(image!, vehicleBrand, vehicleModel, vehicleCategory, vehicleType, fullPlate, engineNumber, chassisNumber, price, seats, locData, fullDescription, ownerName, ownerId, ownerContact, ownerEmail, ownerAddress);
          Toast.show({ type: 'success', text1: 'Published! 🎉' });
      }
      setTimeout(() => {
          if (editId) router.replace(`/(dashboard)/add/${editId}`); 
          else router.back(); 
      }, 1500);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error ❌', text2: 'Failed to save.' });
    } finally {
      hideLoader();
    }
  };

  const renderStep2 = () => (
    <View>
        <Text className={`text-xl font-bold mb-6 ${textMain}`}>Vehicle Identity</Text>
        
        <Label isDark={isDark}>Brand</Label>
        <Dropdown 
            style={[styles.dropdown, { backgroundColor: dropdownBg, borderColor: dropdownBorder }]} 
            placeholderStyle={{ color: placeholderColor }} 
            selectedTextStyle={{ color: dropdownText }}
            inputSearchStyle={{ height: 40, fontSize: 14, color: dropdownText }}
            containerStyle={{ backgroundColor: dropdownBg, borderColor: dropdownBorder }}
            itemTextStyle={{ color: dropdownText }}
            activeColor={isDark ? '#374151' : '#e5e7eb'}
            data={brands} 
            search 
            maxHeight={300} 
            labelField="label" 
            valueField="value" 
            placeholder="Select Brand" 
            searchPlaceholder="Search..." 
            value={vehicleBrand} 
            onChange={handleBrandChange} 
        />
        
        <Text className={`text-sm font-semibold mb-2 mt-4 ${textSub}`}>Model</Text>
        <Dropdown
            style={[styles.dropdown, { backgroundColor: dropdownBg, borderColor: dropdownBorder }]} 
            placeholderStyle={{ color: placeholderColor }} 
            selectedTextStyle={{ color: dropdownText }}
            inputSearchStyle={{ height: 40, fontSize: 14, color: dropdownText }}
            containerStyle={{ backgroundColor: dropdownBg, borderColor: dropdownBorder }}
            itemTextStyle={{ color: dropdownText }}
            activeColor={isDark ? '#374151' : '#e5e7eb'}
            data={modelOptions} 
            search 
            maxHeight={300} 
            labelField="label" 
            valueField="value" 
            placeholder={vehicleBrand ? "Select Model" : "Select Brand First"} 
            searchPlaceholder="Search..." 
            value={vehicleModel} 
            onChange={item => setVehicleModel(item.value)} 
            disable={!vehicleBrand} 
        />

        <View className="flex-row gap-4 mt-4">
            <View className="flex-1">
                <Label isDark={isDark}>Category</Label>
                <Dropdown 
                    style={[styles.dropdown, { backgroundColor: dropdownBg, borderColor: dropdownBorder }]} 
                    placeholderStyle={{ color: placeholderColor }} 
                    selectedTextStyle={{ color: dropdownText }}
                    containerStyle={{ backgroundColor: dropdownBg, borderColor: dropdownBorder }}
                    itemTextStyle={{ color: dropdownText }}
                    activeColor={isDark ? '#374151' : '#e5e7eb'}
                    data={categories} labelField="label" valueField="value" placeholder="Select" value={vehicleCategory} onChange={item => setVehicleCategory(item.value)} 
                />
            </View>
            <View className="flex-1">
                <Label isDark={isDark}>Type</Label>
                <Dropdown 
                    style={[styles.dropdown, { backgroundColor: dropdownBg, borderColor: dropdownBorder }]} 
                    placeholderStyle={{ color: placeholderColor }} 
                    selectedTextStyle={{ color: dropdownText }}
                    containerStyle={{ backgroundColor: dropdownBg, borderColor: dropdownBorder }}
                    itemTextStyle={{ color: dropdownText }}
                    activeColor={isDark ? '#374151' : '#e5e7eb'}
                    data={types} labelField="label" valueField="value" placeholder="Select" value={vehicleType} onChange={item => setVehicleType(item.value)} 
                />
            </View>
        </View>

        <Text className={`text-sm font-semibold mb-2 mt-6 ${textSub}`}>Number Plate Type</Text>
        
        <View className={`flex-row mb-4 p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <TouchableOpacity 
                onPress={() => setPlateType('new')}
                className={`flex-1 py-2 rounded-lg items-center ${plateType === 'new' ? (isDark ? 'bg-gray-600' : 'bg-white shadow-sm') : ''}`}
            >
                <Text className={`font-bold ${plateType === 'new' ? (isDark ? 'text-white' : 'text-black') : 'text-gray-500'}`}>New Format</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setPlateType('old')}
                className={`flex-1 py-2 rounded-lg items-center ${plateType === 'old' ? (isDark ? 'bg-gray-600' : 'bg-white shadow-sm') : ''}`}
            >
                <Text className={`font-bold ${plateType === 'old' ? (isDark ? 'text-white' : 'text-black') : 'text-gray-500'}`}>Old Format</Text>
            </TouchableOpacity>
        </View>

        {plateType === 'new' ? (
            <View className="flex-row gap-2 items-center">
                <View className="w-24">
                    <Dropdown 
                        style={[styles.dropdown, { backgroundColor: dropdownBg, borderColor: dropdownBorder, height: 48 }]} 
                        placeholderStyle={{ color: placeholderColor, fontSize: 12 }} 
                        selectedTextStyle={{ color: dropdownText, fontSize: 14 }}
                        containerStyle={{ backgroundColor: dropdownBg, borderColor: dropdownBorder }}
                        itemTextStyle={{ color: dropdownText }}
                        activeColor={isDark ? '#374151' : '#e5e7eb'}
                        data={provinces}
                        labelField="label" valueField="value" placeholder="Prov" value={plateProv} onChange={item => setPlateProv(item.value)} 
                    />
                </View>
                <Text className={`font-bold text-xl ${textMain}`}>-</Text>
                <CustomInput isDark={isDark} className="w-24 text-center" placeholder="CAB" maxLength={3} autoCapitalize="characters" value={plateLetters} onChangeText={setPlateLetters} />
                <Text className={`font-bold text-xl ${textMain}`}>-</Text>
                <CustomInput isDark={isDark} className="flex-1 text-center" placeholder="1234" maxLength={4} keyboardType="numeric" value={plateNumbers} onChangeText={setPlateNumbers} />
            </View>
        ) : (
            <View className="flex-row gap-2 items-center">
                <View className="w-28">
                    <CustomInput isDark={isDark} className="text-center" placeholder="250 / 18" maxLength={3} value={plateLetters} onChangeText={setPlateLetters} />
                </View>
                <Text className={`font-bold text-xl ${textMain}`}>-</Text>
                <CustomInput isDark={isDark} className="flex-1 text-center" placeholder="1234" maxLength={4} keyboardType="numeric" value={plateNumbers} onChangeText={setPlateNumbers} />
            </View>
        )}

        <View className="flex-row gap-4 mt-4">
            <View className="flex-1"><Label isDark={isDark}>Engine No</Label><CustomInput isDark={isDark} value={engineNumber} onChangeText={setEngineNumber} /></View>
            <View className="flex-1"><Label isDark={isDark}>Chassis No</Label><CustomInput isDark={isDark} value={chassisNumber} onChangeText={setChassisNumber} /></View>
        </View>
    </View>
  );

  const renderStep1 = () => (
    <View className="items-center justify-center py-10">
        <Text className={`text-2xl font-bold mb-2 ${textMain}`}>Upload Vehicle Photo</Text>
        <Text className={`${textSub} mb-8 text-center px-4`}>Choose a clear cover photo for your vehicle.</Text>
        <TouchableOpacity onPress={pickImage} className={`w-full h-72 rounded-3xl border-2 border-dashed ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} justify-center items-center overflow-hidden shadow-sm`}>
            {image ? (
                <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
            ) : (
                <View className="items-center">
                    <Feather name="camera" size={40} color={isDark ? "#9ca3af" : "#4b5563"} />
                    <Text className={`text-lg font-bold mt-2 ${textSub}`}>Tap to Upload</Text>
                </View>
            )}
        </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View>
        <Text className={`text-xl font-bold mb-6 ${textMain}`}>Rental & Location</Text>
        <View className="flex-row gap-4">
            <View className="flex-1"><Label isDark={isDark}>Price (Per Day)</Label><CustomInput isDark={isDark} placeholder="5000" keyboardType="numeric" value={price} onChangeText={setPrice} /></View>
            <View className="flex-1"><Label isDark={isDark}>Seats</Label><CustomInput isDark={isDark} placeholder="4" keyboardType="numeric" value={seats} onChangeText={setSeats} /></View>
        </View>
        <View className="mt-4"><Label isDark={isDark}>Features (Optional)</Label><CustomInput isDark={isDark} placeholder="Ex: AC, Bluetooth..." value={descFeatures} onChangeText={setDescFeatures} /></View>
        <View className="mt-4"><Label isDark={isDark}>Details / Description</Label><CustomInput isDark={isDark} className="h-24 text-top pt-3" multiline placeholder="Full vehicle description..." value={descDetails} onChangeText={setDescDetails} /></View>
        <View className="mt-4"><Label isDark={isDark}>Other Info (Optional)</Label><CustomInput isDark={isDark} className="h-16 text-top pt-3" multiline placeholder="Rules..." value={descInfo} onChangeText={setDescInfo} /></View>
        <Text className={`text-sm font-semibold mb-2 mt-4 ${textSub}`}>Location</Text>
        <View className="flex-row gap-2">
            <CustomInput isDark={isDark} className="flex-1" placeholder="City / Address" value={locationName} onChangeText={setLocationName} />
            <TouchableOpacity onPress={getCurrentLocation} className="bg-blue-600 justify-center px-4 rounded-xl"><FontAwesome5 name="map-marker-alt" size={20} color="white" /></TouchableOpacity>
        </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
        <Text className={`text-xl font-bold mb-6 ${textMain}`}>Owner Details</Text>
        <View className={`p-5 rounded-2xl border shadow-sm ${bgCard} ${inputBorder}`}>
            <Label isDark={isDark}>Full Name</Label>
            <CustomInput isDark={isDark} placeholder="Owner Name" value={ownerName} onChangeText={setOwnerName} />
            <View className="flex-row gap-4 mt-4">
                <View className="flex-1"><Label isDark={isDark}>NIC</Label><CustomInput isDark={isDark} value={ownerId} onChangeText={setOwnerId} /></View>
                <View className="flex-1"><Label isDark={isDark}>Contact</Label><CustomInput isDark={isDark} keyboardType="phone-pad" value={ownerContact} onChangeText={setOwnerContact} /></View>
            </View>
            <View className="mt-4"><Label isDark={isDark}>Email</Label><CustomInput isDark={isDark} keyboardType="email-address" value={ownerEmail} onChangeText={setOwnerEmail} /></View>
            <View className="mt-4"><Label isDark={isDark}>Address</Label><CustomInput isDark={isDark} value={ownerAddress} onChangeText={setOwnerAddress} /></View>
        </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View className={`flex-1 ${bgMain}`}>
        
        <View className={`pt-12 pb-4 px-6 border-b z-10 shadow-sm ${bgMain} ${inputBorder}`}>
            <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
                    <MaterialIcons name="arrow-back-ios" size={20} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
                <Text className={`text-lg font-bold ${textMain}`}>{editId ? "Edit Vehicle" : `Step ${currentStep} of ${totalSteps}`}</Text>
                <View className="w-8" /> 
            </View>
            <View className={`h-2 rounded-full overflow-hidden w-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <View style={{ width: `${(currentStep / totalSteps) * 100}%` }} className={`h-full rounded-full ${isDark ? 'bg-emerald-500' : 'bg-black'}`} />
            </View>
        </View>

        {loadingData ? (
            <View className={`flex-1 justify-center items-center ${bgMain}`}>
                <ActivityIndicator size="large" color={isDark ? "white" : "black"} />
                <Text className={`mt-4 ${textSub}`}>Loading Vehicle Data...</Text>
            </View>
        ) : (
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <View className="mt-8 mb-10">
                    <TouchableOpacity 
                        onPress={currentStep === totalSteps ? handleSubmit : handleNext} 
                        className={`w-full py-4 rounded-2xl flex-row justify-center items-center ${
                            currentStep === totalSteps 
                                ? (isDark ? 'bg-emerald-600' : 'bg-green-600') 
                                : (isDark ? 'bg-gray-700' : 'bg-black')
                        }`}
                    >
                        <Text className="text-white font-bold text-lg mr-2">
                            {isLoading ? "Processing..." : currentStep === totalSteps ? (editId ? "Update Vehicle" : "Publish Vehicle") : "Next Step"}
                        </Text>
                        {!isLoading && currentStep !== totalSteps && <MaterialIcons name="arrow-forward" size={20} color="white" />}
                        {!isLoading && currentStep === totalSteps && <MaterialIcons name="check" size={20} color="white" />}
                    </TouchableOpacity>
                </View>
                <View className="h-[100px]"></View>
            </ScrollView>
        )}

      </View>

      <Modal visible={mapVisible} animationType="slide">
        <View className={`flex-1 ${bgMain}`}>
             <MapView 
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: selectedCoords.latitude, longitude: selectedCoords.longitude,
                    latitudeDelta: 0.05, longitudeDelta: 0.05,
                }}
                onPress={(e) => setSelectedCoords(e.nativeEvent.coordinate)}
             >
                <Marker coordinate={selectedCoords} />
             </MapView>
             <View className={`absolute bottom-10 left-5 right-5 p-4 rounded-2xl shadow-lg ${bgCard}`}>
                <TouchableOpacity onPress={() => setMapVisible(false)} className={`py-3 rounded-xl ${isDark ? 'bg-emerald-600' : 'bg-black'}`}>
                    <Text className="text-white text-center font-bold">Confirm Location</Text>
                </TouchableOpacity>
             </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  dropdown: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
});

export default VehicleForm;