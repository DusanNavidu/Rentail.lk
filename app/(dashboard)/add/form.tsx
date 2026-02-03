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
  Dimensions,
  ActivityIndicator
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons, Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useLoader } from "@/hooks/useLoader";
import { addVehicle, getVehicleById, updateVehicle } from "@/services/vehicleService";
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Label } from "@react-navigation/elements";

// --- DATA LISTS ---

const brands = [
  { label: 'Toyota', value: 'Toyota' },
  { label: 'Nissan', value: 'Nissan' },
  { label: 'Honda', value: 'Honda' },
  { label: 'Suzuki', value: 'Suzuki' },
  { label: 'Mitsubishi', value: 'Mitsubishi' },
  { label: 'Mazda', value: 'Mazda' },
  { label: 'BMW', value: 'BMW' },
  { label: 'Mercedes-Benz', value: 'Mercedes-Benz' },
  { label: 'Audi', value: 'Audi' },
  { label: 'Land Rover', value: 'Land Rover' },
  { label: 'Kia', value: 'Kia' },
  { label: 'Hyundai', value: 'Hyundai' },
  { label: 'Tata', value: 'Tata' },
  { label: 'Mahindra', value: 'Mahindra' },
  { label: 'Bajaj', value: 'Bajaj' },
  { label: 'TVS', value: 'TVS' },
  { label: 'Yamaha', value: 'Yamaha' },
  { label: 'Hero', value: 'Hero' },
  { label: 'Royal Enfield', value: 'Royal Enfield' },
  { label: 'Ducati', value: 'Ducati' },
  { label: 'Harley-Davidson', value: 'Harley-Davidson' },
  { label: 'Kawasaki', value: 'Kawasaki' },
  { label: 'Lanka Ashok Leyland', value: 'Lanka Ashok Leyland' },
  { label: 'Eicher', value: 'Eicher' },
  { label: 'Hino', value: 'Hino' },
  { label: 'Isuzu', value: 'Isuzu' },
  { label: 'King Long', value: 'King Long' },
  { label: 'Yutong', value: 'Yutong' },
  { label: 'Higer', value: 'Higer' },
  { label: 'Micro', value: 'Micro' },
  { label: 'Ford', value: 'Ford' },
  { label: 'Other', value: 'Other' },
];

const modelsByBrand: { [key: string]: { label: string; value: string }[] } = {
  Toyota: [
    { label: 'Allion', value: 'Allion' }, { label: 'Premio', value: 'Premio' }, { label: 'Axio', value: 'Axio' },
    { label: 'Vitz', value: 'Vitz' }, { label: 'Yaris', value: 'Yaris' }, { label: 'Corolla', value: 'Corolla' },
    { label: 'Prius', value: 'Prius' }, { label: 'Aqua', value: 'Aqua' }, { label: 'Camry', value: 'Camry' },
    { label: 'Crown', value: 'Crown' }, { label: 'Land Cruiser', value: 'Land Cruiser' }, { label: 'Prado', value: 'Prado' },
    { label: 'Hilux', value: 'Hilux' }, { label: 'Hiace', value: 'Hiace' }, { label: 'KDH', value: 'KDH' },
    { label: 'C-HR', value: 'C-HR' }, { label: 'Raize', value: 'Raize' }, { label: 'Rush', value: 'Rush' },
    { label: 'Harrier', value: 'Harrier' }, { label: 'Wigo', value: 'Wigo' }, { label: 'Glanza', value: 'Glanza' },
    { label: 'Passo', value: 'Passo' }, { label: 'Tank', value: 'Tank' }, { label: 'Roomy', value: 'Roomy' },
    { label: 'TownAce', value: 'TownAce' }, { label: 'LiteAce', value: 'LiteAce' }
  ],
  Nissan: [
    { label: 'Sunny', value: 'Sunny' }, { label: 'Leaf', value: 'Leaf' }, { label: 'X-Trail', value: 'X-Trail' },
    { label: 'March', value: 'March' }, { label: 'Tiida', value: 'Tiida' }, { label: 'Navara', value: 'Navara' },
    { label: 'Patrol', value: 'Patrol' }, { label: 'Caravan', value: 'Caravan' }, { label: 'NV200', value: 'NV200' },
    { label: 'Juke', value: 'Juke' }, { label: 'Qashqai', value: 'Qashqai' }, { label: 'Bluebird', value: 'Bluebird' },
    { label: 'Sylphy', value: 'Sylphy' }, { label: 'GT-R', value: 'GT-R' }, { label: 'Note', value: 'Note' },
    { label: 'Dayz', value: 'Dayz' }, { label: 'Clipper', value: 'Clipper' }
  ],
  Honda: [
    { label: 'Civic', value: 'Civic' }, { label: 'Fit', value: 'Fit' }, { label: 'Grace', value: 'Grace' },
    { label: 'Vezel', value: 'Vezel' }, { label: 'CR-V', value: 'CR-V' }, { label: 'Insight', value: 'Insight' },
    { label: 'Accord', value: 'Accord' }, { label: 'Freed', value: 'Freed' }, { label: 'Jade', value: 'Jade' },
    { label: 'N-WGN', value: 'N-WGN' }, { label: 'N-Box', value: 'N-Box' }, { label: 'N-One', value: 'N-One' },
    { label: 'S660', value: 'S660' }, { label: 'City', value: 'City' }, { label: 'Jazz', value: 'Jazz' },
    { label: 'HR-V', value: 'HR-V' }
  ],
  Suzuki: [
    { label: 'Alto', value: 'Alto' }, { label: 'Wagon R', value: 'Wagon R' }, { label: 'Swift', value: 'Swift' },
    { label: 'Celerio', value: 'Celerio' }, { label: 'Baleno', value: 'Baleno' }, { label: 'S-Cross', value: 'S-Cross' },
    { label: 'Vitara', value: 'Vitara' }, { label: 'Grand Vitara', value: 'Grand Vitara' }, { label: 'Jimny', value: 'Jimny' },
    { label: 'Every', value: 'Every' }, { label: 'Carry', value: 'Carry' }, { label: 'Hustler', value: 'Hustler' },
    { label: 'Spacia', value: 'Spacia' }, { label: 'Maruti 800', value: 'Maruti 800' }, { label: 'Zen', value: 'Zen' },
    { label: 'Estilo', value: 'Estilo' }, { label: 'A-Star', value: 'A-Star' }, { label: 'Ignis', value: 'Ignis' }
  ],
  Mitsubishi: [
    { label: 'Lancer', value: 'Lancer' }, { label: 'Montero', value: 'Montero' }, { label: 'Pajero', value: 'Pajero' },
    { label: 'Outlander', value: 'Outlander' }, { label: 'ASX', value: 'ASX' }, { label: 'Eclipse Cross', value: 'Eclipse Cross' },
    { label: 'Xpander', value: 'Xpander' }, { label: 'L200', value: 'L200' }, { label: 'Triton', value: 'Triton' },
    { label: 'Mirage', value: 'Mirage' }, { label: 'Attrage', value: 'Attrage' }, { label: 'Galant', value: 'Galant' },
    { label: 'Rosa', value: 'Rosa' }, { label: 'Canter', value: 'Canter' }, { label: 'Fuso', value: 'Fuso' }
  ],
  Mazda: [
    { label: 'Axela', value: 'Axela' }, { label: 'Mazda3', value: 'Mazda3' }, { label: 'Mazda6', value: 'Mazda6' },
    { label: 'Atenza', value: 'Atenza' }, { label: 'Demio', value: 'Demio' }, { label: 'Mazda2', value: 'Mazda2' },
    { label: 'CX-3', value: 'CX-3' }, { label: 'CX-5', value: 'CX-5' }, { label: 'CX-7', value: 'CX-7' },
    { label: 'RX-8', value: 'RX-8' }, { label: 'Flair', value: 'Flair' }, { label: 'Bongo', value: 'Bongo' },
    { label: 'Scrum', value: 'Scrum' }
  ],
  BMW: [
    { label: '3 Series', value: '3 Series' }, { label: '5 Series', value: '5 Series' }, { label: '7 Series', value: '7 Series' },
    { label: 'X1', value: 'X1' }, { label: 'X3', value: 'X3' }, { label: 'X5', value: 'X5' }, { label: 'X6', value: 'X6' },
    { label: 'i8', value: 'i8' }, { label: 'i3', value: 'i3' }, { label: 'Z4', value: 'Z4' }, { label: 'M3', value: 'M3' },
    { label: 'M4', value: 'M4' }, { label: 'M5', value: 'M5' }, { label: '1 Series', value: '1 Series' }, { label: '2 Series', value: '2 Series' }
  ],
  'Mercedes-Benz': [
    { label: 'C-Class', value: 'C-Class' }, { label: 'E-Class', value: 'E-Class' }, { label: 'S-Class', value: 'S-Class' },
    { label: 'A-Class', value: 'A-Class' }, { label: 'CLA', value: 'CLA' }, { label: 'GLA', value: 'GLA' },
    { label: 'GLC', value: 'GLC' }, { label: 'GLE', value: 'GLE' }, { label: 'GLS', value: 'GLS' }, { label: 'G-Wagon', value: 'G-Wagon' },
    { label: 'Vito', value: 'Vito' }, { label: 'Sprinter', value: 'Sprinter' }, { label: 'SLK', value: 'SLK' }, { label: 'CLS', value: 'CLS' }
  ],
  Audi: [
    { label: 'A1', value: 'A1' }, { label: 'A3', value: 'A3' }, { label: 'A4', value: 'A4' }, { label: 'A5', value: 'A5' },
    { label: 'A6', value: 'A6' }, { label: 'A7', value: 'A7' }, { label: 'A8', value: 'A8' }, { label: 'Q2', value: 'Q2' },
    { label: 'Q3', value: 'Q3' }, { label: 'Q5', value: 'Q5' }, { label: 'Q7', value: 'Q7' }, { label: 'Q8', value: 'Q8' },
    { label: 'TT', value: 'TT' }, { label: 'R8', value: 'R8' }
  ],
  'Land Rover': [
    { label: 'Defender', value: 'Defender' }, { label: 'Discovery', value: 'Discovery' }, { label: 'Discovery Sport', value: 'Discovery Sport' },
    { label: 'Freelander', value: 'Freelander' }, { label: 'Range Rover', value: 'Range Rover' },
    { label: 'Range Rover Sport', value: 'Range Rover Sport' }, { label: 'Range Rover Evoque', value: 'Range Rover Evoque' },
    { label: 'Range Rover Velar', value: 'Range Rover Velar' }
  ],
  Kia: [
    { label: 'Picanto', value: 'Picanto' }, { label: 'Rio', value: 'Rio' }, { label: 'Cerato', value: 'Cerato' },
    { label: 'Sportage', value: 'Sportage' }, { label: 'Sorento', value: 'Sorento' }, { label: 'Carnival', value: 'Carnival' },
    { label: 'Stonic', value: 'Stonic' }, { label: 'Seltos', value: 'Seltos' }, { label: 'Sonet', value: 'Sonet' },
    { label: 'Carens', value: 'Carens' }, { label: 'Optima', value: 'Optima' }, { label: 'Soul', value: 'Soul' }
  ],
  Hyundai: [
    { label: 'Eon', value: 'Eon' }, { label: 'Grand i10', value: 'Grand i10' }, { label: 'i20', value: 'i20' },
    { label: 'Accent', value: 'Accent' }, { label: 'Elantra', value: 'Elantra' }, { label: 'Sonata', value: 'Sonata' },
    { label: 'Tucson', value: 'Tucson' }, { label: 'Santa Fe', value: 'Santa Fe' }, { label: 'Venue', value: 'Venue' },
    { label: 'Creta', value: 'Creta' }, { label: 'Kona', value: 'Kona' }, { label: 'Staria', value: 'Staria' },
    { label: 'H-1', value: 'H-1' }, { label: 'Porter', value: 'Porter' }
  ],
  Tata: [
    { label: 'Nano', value: 'Nano' }, { label: 'Indica', value: 'Indica' }, { label: 'Indigo', value: 'Indigo' },
    { label: 'Tiago', value: 'Tiago' }, { label: 'Nexon', value: 'Nexon' }, { label: 'Xenon', value: 'Xenon' },
    { label: 'Ace', value: 'Ace' }, { label: 'Super Ace', value: 'Super Ace' }, { label: 'Dost', value: 'Dost' },
    { label: 'LPK', value: 'LPK' }, { label: 'LPT', value: 'LPT' }, { label: 'Ultra', value: 'Ultra' }, { label: 'Prima', value: 'Prima' }
  ],
  Mahindra: [
    { label: 'KUV100', value: 'KUV100' }, { label: 'TUV300', value: 'TUV300' }, { label: 'XUV300', value: 'XUV300' },
    { label: 'XUV500', value: 'XUV500' }, { label: 'Scorpio', value: 'Scorpio' }, { label: 'Bolero', value: 'Bolero' },
    { label: 'Maxx', value: 'Maxx' }, { label: 'Big Bolero', value: 'Big Bolero' }, { label: 'Supro', value: 'Supro' },
    { label: 'Jeeto', value: 'Jeeto' }, { label: 'Thar', value: 'Thar' }
  ],
  Bajaj: [
    { label: 'RE 205', value: 'RE 205' }, { label: 'RE 4S', value: 'RE 4S' }, { label: 'Compact', value: 'Compact' },
    { label: 'Maxima', value: 'Maxima' }, { label: 'Qute', value: 'Qute' }, { label: 'Pulsar', value: 'Pulsar' },
    { label: 'Discover', value: 'Discover' }, { label: 'Platina', value: 'Platina' }, { label: 'CT 100', value: 'CT 100' },
    { label: 'Avenger', value: 'Avenger' }, { label: 'Dominar', value: 'Dominar' }
  ],
  TVS: [
    { label: 'King', value: 'King' }, { label: 'Duramax', value: 'Duramax' }, { label: 'Apache', value: 'Apache' },
    { label: 'Raider', value: 'Raider' }, { label: 'Ntorq', value: 'Ntorq' }, { label: 'Scooty Pep', value: 'Scooty Pep' },
    { label: 'Wego', value: 'Wego' }, { label: 'Jupiter', value: 'Jupiter' }, { label: 'Sport', value: 'Sport' },
    { label: 'Metro', value: 'Metro' }, { label: 'HLX', value: 'HLX' }
  ],
  Yamaha: [
    { label: 'FZ', value: 'FZ' }, { label: 'Fazer', value: 'Fazer' }, { label: 'R15', value: 'R15' },
    { label: 'MT-15', value: 'MT-15' }, { label: 'Ray ZR', value: 'Ray ZR' }, { label: 'Fascino', value: 'Fascino' },
    { label: 'TW', value: 'TW' }, { label: 'WR', value: 'WR' }, { label: 'TMAX', value: 'TMAX' }, { label: 'NMAX', value: 'NMAX' }
  ],
  Hero: [
    { label: 'Splendor', value: 'Splendor' }, { label: 'Passion', value: 'Passion' }, { label: 'HF Deluxe', value: 'HF Deluxe' },
    { label: 'Glamour', value: 'Glamour' }, { label: 'Hunk', value: 'Hunk' }, { label: 'Xtreme', value: 'Xtreme' },
    { label: 'Karizma', value: 'Karizma' }, { label: 'Pleasure', value: 'Pleasure' }, { label: 'Maestro', value: 'Maestro' },
    { label: 'Destini', value: 'Destini' }
  ],
  'Royal Enfield': [
    { label: 'Classic 350', value: 'Classic 350' }, { label: 'Bullet 350', value: 'Bullet 350' },
    { label: 'Meteor 350', value: 'Meteor 350' }, { label: 'Himalayan', value: 'Himalayan' },
    { label: 'Interceptor 650', value: 'Interceptor 650' }, { label: 'Continental GT', value: 'Continental GT' }
  ],
  Ducati: [
    { label: 'Monster', value: 'Monster' }, { label: 'Panigale', value: 'Panigale' }, { label: 'Multistrada', value: 'Multistrada' },
    { label: 'Diavel', value: 'Diavel' }, { label: 'Scrambler', value: 'Scrambler' }, { label: 'Hypermotard', value: 'Hypermotard' }
  ],
  'Harley-Davidson': [
    { label: 'Iron 883', value: 'Iron 883' }, { label: 'Forty-Eight', value: 'Forty-Eight' }, { label: 'Street 750', value: 'Street 750' },
    { label: 'Fat Boy', value: 'Fat Boy' }, { label: 'Heritage Classic', value: 'Heritage Classic' }, { label: 'Road King', value: 'Road King' }
  ],
  Kawasaki: [
    { label: 'Ninja', value: 'Ninja' }, { label: 'Z Series', value: 'Z Series' }, { label: 'Versys', value: 'Versys' },
    { label: 'Vulcan', value: 'Vulcan' }, { label: 'KLX', value: 'KLX' }, { label: 'D-Tracker', value: 'D-Tracker' }
  ],
  'Lanka Ashok Leyland': [
    { label: 'Viking', value: 'Viking' }, { label: 'Cheetah', value: 'Cheetah' }, { label: 'Eagle', value: 'Eagle' },
    { label: 'Taurus', value: 'Taurus' }, { label: 'Dost', value: 'Dost' }, { label: 'Partner', value: 'Partner' },
    { label: 'Bus (General)', value: 'Bus (General)' }, { label: 'Lorry (General)', value: 'Lorry (General)' }
  ],
  Eicher: [
    { label: 'Pro 1000', value: 'Pro 1000' }, { label: 'Pro 3000', value: 'Pro 3000' }, { label: 'Pro 6000', value: 'Pro 6000' },
    { label: 'Skyline Bus', value: 'Skyline Bus' }, { label: 'Starline Bus', value: 'Starline Bus' }
  ],
  Hino: [
    { label: 'Dutro', value: 'Dutro' }, { label: 'Ranger', value: 'Ranger' }, { label: 'Profia', value: 'Profia' },
    { label: '300 Series', value: '300 Series' }, { label: '500 Series', value: '500 Series' }, { label: '700 Series', value: '700 Series' },
    { label: 'Liesse', value: 'Liesse' }, { label: 'Rainbow', value: 'Rainbow' }, { label: 'S\'elega', value: 'S\'elega' }
  ],
  Isuzu: [
    { label: 'Elf', value: 'Elf' }, { label: 'Forward', value: 'Forward' }, { label: 'Giga', value: 'Giga' },
    { label: 'D-Max', value: 'D-Max' }, { label: 'MU-X', value: 'MU-X' }, { label: 'Journey', value: 'Journey' },
    { label: 'Erga', value: 'Erga' }, { label: 'Gala', value: 'Gala' }
  ],
  'King Long': [
    { label: 'XMQ6129', value: 'XMQ6129' }, { label: 'XMQ6900', value: 'XMQ6900' }, { label: 'XMQ6128', value: 'XMQ6128' },
    { label: 'Kingwin', value: 'Kingwin' }
  ],
  Yutong: [
    { label: 'ZK6122', value: 'ZK6122' }, { label: 'ZK6938', value: 'ZK6938' }, { label: 'ZK6118', value: 'ZK6118' },
    { label: 'City Master', value: 'City Master' }
  ],
  Higer: [
    { label: 'H9290', value: 'H9290' }, { label: 'KLQ6129', value: 'KLQ6129' }, { label: 'Paradise', value: 'Paradise' }
  ],
  Micro: [
    { label: 'Panda', value: 'Panda' }, { label: 'Panda Cross', value: 'Panda Cross' }, { label: 'MX7', value: 'MX7' },
    { label: 'Emgrand 7', value: 'Emgrand 7' }, { label: 'Glory', value: 'Glory' }, { label: 'Rexton', value: 'Rexton' },
    { label: 'Kyron', value: 'Kyron' }, { label: 'Actyon', value: 'Actyon' }, { label: 'Korando', value: 'Korando' },
    { label: 'Tivoli', value: 'Tivoli' }, { label: 'Rodius', value: 'Rodius' }, { label: 'Baic X25', value: 'Baic X25' }
  ],
  Ford: [
    { label: 'Ranger', value: 'Ranger' }, { label: 'Everest', value: 'Everest' }, { label: 'Mustang', value: 'Mustang' },
    { label: 'Fiesta', value: 'Fiesta' }, { label: 'Focus', value: 'Focus' }, { label: 'EcoSport', value: 'EcoSport' },
    { label: 'Kuga', value: 'Kuga' }, { label: 'Mondeo', value: 'Mondeo' }, { label: 'Laser', value: 'Laser' }
  ],
  Other: [
    { label: 'Other', value: 'Other' }
  ]
};

const categories = [
  { label: 'Car', value: 'Car' }, { label: 'Van', value: 'Van' },
  { label: 'Jeep (SUV)', value: 'Jeep' }, { label: 'Bike', value: 'Bike' },
  { label: 'Bus', value: 'Bus' }, { label: 'Lorry', value: 'Lorry' },
  { label: 'Three Wheel', value: 'Three Wheel' }, { label: 'Other', value: 'Other' },
];

const types = [
  { label: 'Sedan', value: 'Sedan' }, { label: 'Hatchback', value: 'Hatchback' },
  { label: 'SUV', value: 'SUV' }, { label: 'Crossover', value: 'Crossover' },
  { label: 'Coupe', value: 'Coupe' }, { label: 'Convertible', value: 'Convertible' },
  { label: 'Wagon', value: 'Wagon' }, { label: 'Sports', value: 'Sports' },
  { label: 'Off-road', value: 'Off-road' }, { label: 'Luxury', value: 'Luxury' },
  { label: 'Scooter', value: 'Scooter' }, { label: 'Sport Bike', value: 'Sport Bike' },
];

const [modelOptions, setModelOptions] = useState<{ label: string; value: string }[]>([]);

const VehicleForm = () => {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const { showLoader, hideLoader, isLoading } = useLoader();
  const [loadingData, setLoadingData] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [image, setImage] = useState<string | null>(null);
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleCategory, setVehicleCategory] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  
  const [plateProv, setPlateProv] = useState("");
  const [plateLetters, setPlateLetters] = useState("");
  const [plateNumbers, setPlateNumbers] = useState("");
  
  const [engineNumber, setEngineNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");

  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [descFeatures, setDescFeatures] = useState("");
  const [descDetails, setDescDetails] = useState("");
  const [descInfo, setDescInfo] = useState("");
  
  const [mapVisible, setMapVisible] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [selectedCoords, setSelectedCoords] = useState({
    latitude: 6.9271, longitude: 79.8612,
  });

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
            setVehicleModel(data.vehicleModel || "");
            setVehicleCategory(data.vehicleCategory || "");
            setVehicleType(data.vehicleType || "");
            
            const plateStr = data.numberPlate || "";
            const parts = plateStr.split('-');
            if(parts.length === 3) {
                setPlateProv(parts[0]); 
                setPlateLetters(parts[1]); 
                setPlateNumbers(parts[2]);
            } else {
                setPlateNumbers(plateStr);
            }

            setEngineNumber(data.engineNumber || "");
            setChassisNumber(data.chassisNumber || "");
            
            setPrice(data.price ? data.price.toString() : "");
            setSeats(data.seats ? data.seats.toString() : "");
            
            setDescDetails(data.description || ""); 
            setDescFeatures("");
            setDescInfo("");

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
            console.log(err);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load vehicle details' });
            router.back();
        }).finally(() => {
            setLoadingData(false);
        });
    }
  }, [editId]);

  const handleBrandChange = (item: { label: string; value: string }) => {
    setVehicleBrand(item.value); // 1. Save the selected brand to state
    
    // 2. Update the model list based on the selected brand
    const newModels = modelsByBrand[item.value] || [{ label: 'Other', value: 'Other' }];
    setModelOptions(newModels);
    
    setVehicleModel(""); // 3. Reset the model selection when brand changes
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
    setSelectedCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
    });
    setMapVisible(true);
  };

  const handleNext = () => {
    if (currentStep === 1) {
        if (!image) return Toast.show({ type: 'error', text1: 'Image Required 📸', text2: 'Please upload a photo first.' });
    }
    else if (currentStep === 2) {
        if (!vehicleBrand || !vehicleModel || !vehicleCategory || !vehicleType || !plateProv || !plateLetters || !plateNumbers) {
            return Toast.show({ type: 'error', text1: 'Missing Details ⚠️', text2: 'Please fill identity fields & plate.' });
        }
    }
    else if (currentStep === 3) {
        if (!price || !seats || !locationName) {
            return Toast.show({ type: 'error', text1: 'Missing Details ⚠️', text2: 'Price, Seats & Location required.' });
        }
    }

    if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
    } else {
        router.back();
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    if (!ownerName || !ownerContact || !ownerId || !ownerAddress) {
        return Toast.show({ type: 'error', text1: 'Owner Details ⚠️', text2: 'Please fill all owner details.' });
    }

    showLoader();
    try {
      const fullPlate = `${plateProv}-${plateLetters}-${plateNumbers}`.toUpperCase();
      const fullDescription = `Features: ${descFeatures}\nDetails: ${descDetails}\nInfo: ${descInfo}`.trim();
      const locData = { address: locationName, latitude: selectedCoords.latitude, longitude: selectedCoords.longitude };

      const vehicleData = {
        vehicleBrand, vehicleModel, vehicleCategory, vehicleType, numberPlate: fullPlate,
        engineNumber, chassisNumber, price: Number(price), seats: Number(seats),
        locationName: locationName, latitude: selectedCoords.latitude, longitude: selectedCoords.longitude,
        description: fullDescription,
        ownerName, ownerId, ownerContact, ownerEmail, ownerAddress
      };

      if (editId) {
          await updateVehicle(editId as string, vehicleData, image!);
          Toast.show({ type: 'success', text1: 'Updated! 🎉', text2: 'Vehicle details updated.' });
      } else {
          await addVehicle(
            image!, vehicleBrand, vehicleModel, vehicleCategory, vehicleType, fullPlate,
            engineNumber, chassisNumber, price, seats, locData, fullDescription,
            ownerName, ownerId, ownerContact, ownerEmail, ownerAddress
          );
          Toast.show({ type: 'success', text1: 'Success! 🎉', text2: 'Vehicle Published.' });
      }
      
      setTimeout(() => {
          if (editId) router.replace(`/(dashboard)/add/${editId}`); // Go back to details view
          else router.back(); 
      }, 1500);

    } catch (err: any) {
      console.log(err);
      Toast.show({ type: 'error', text1: 'Error ❌', text2: 'Failed to save.' });
    } finally {
      hideLoader();
    }
  };

  const renderStep1 = () => (
    <View className="items-center justify-center py-10">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Upload Vehicle Photo</Text>
        <Text className="text-gray-500 mb-8 text-center px-4">Choose a clear cover photo for your vehicle.</Text>
        
        <TouchableOpacity onPress={pickImage} className="w-full h-72 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 justify-center items-center overflow-hidden shadow-sm">
            {image ? (
                <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
            ) : (
                <View className="items-center">
                    <View className="bg-white p-6 rounded-full shadow-sm mb-4">
                        <Feather name="camera" size={40} color="#4b5563" />
                    </View>
                    <Text className="text-lg font-bold text-gray-600">Tap to Upload</Text>
                </View>
            )}
        </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
        <Text className="text-xl font-bold text-black mb-6">Vehicle Identity</Text>
        
        <Text className="label">Brand</Text>
        <Dropdown 
            style={styles.dropdown} 
            placeholderStyle={styles.placeholderStyle} 
            selectedTextStyle={styles.selectedTextStyle} 
            inputSearchStyle={styles.inputSearchStyle} 
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

        <Text className="label mt-4">Model</Text>
        <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            data={modelOptions} // Use the dynamic list here
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={vehicleBrand ? "Select Model" : "Select Brand First"}
            searchPlaceholder="Search..."
            value={vehicleModel}
            onChange={item => setVehicleModel(item.value)}
            disable={!vehicleBrand} // Disable if no brand selected
        />
        <View className="flex-row gap-4 mt-4">
            <View className="flex-1">
                <Text className="label">Category</Text>
                <Dropdown style={styles.dropdown} placeholderStyle={styles.placeholderStyle} selectedTextStyle={styles.selectedTextStyle} data={categories} labelField="label" valueField="value" placeholder="Select" value={vehicleCategory} onChange={item => setVehicleCategory(item.value)} />
            </View>
            <View className="flex-1">
                <Text className="label">Type</Text>
                <Dropdown style={styles.dropdown} placeholderStyle={styles.placeholderStyle} selectedTextStyle={styles.selectedTextStyle} data={types} labelField="label" valueField="value" placeholder="Select" value={vehicleType} onChange={item => setVehicleType(item.value)} />
            </View>
        </View>

        <Text className="label mt-4">Number Plate</Text>
        <View className="flex-row gap-2 items-center">
            <View className="w-20 bg-yellow-400 p-2 rounded-lg border-2 border-black"><Text className="text-[10px] text-center font-bold">PROV</Text><TextInput className="text-center font-bold text-lg" placeholder="WP" maxLength={2} autoCapitalize="characters" value={plateProv} onChangeText={setPlateProv} /></View>
            <Text className="font-bold text-xl">-</Text>
            <View className="w-24 bg-white p-2 rounded-lg border-2 border-black"><TextInput className="text-center font-bold text-lg" placeholder="CAB" maxLength={3} autoCapitalize="characters" value={plateLetters} onChangeText={setPlateLetters} /></View>
            <Text className="font-bold text-xl">-</Text>
            <View className="flex-1 bg-white p-2 rounded-lg border-2 border-black"><TextInput className="text-center font-bold text-lg" placeholder="1234" maxLength={4} keyboardType="numeric" value={plateNumbers} onChangeText={setPlateNumbers} /></View>
        </View>

        <View className="flex-row gap-4 mt-4">
            <View className="flex-1"><Text className="label">Engine No</Text><TextInput className="input" placeholder="Eg: 1KR-12345" value={engineNumber} onChangeText={setEngineNumber} /></View>
            <View className="flex-1"><Text className="label">Chassis No</Text><TextInput className="input" placeholder="Eg: KSP-123" value={chassisNumber} onChangeText={setChassisNumber} /></View>
        </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
        <Text className="text-xl font-bold text-black mb-6">Rental & Location</Text>

        <View className="flex-row gap-4">
            <View className="flex-1"><Text className="label">Price (Per Day)</Text><TextInput className="input" placeholder="5000" keyboardType="numeric" value={price} onChangeText={setPrice} /></View>
            <View className="flex-1"><Text className="label">Seats</Text><TextInput className="input" placeholder="4" keyboardType="numeric" value={seats} onChangeText={setSeats} /></View>
        </View>

        <Text className="label mt-4">Features</Text>
        <TextInput className="input" placeholder="Ex: AC, Bluetooth, Sunroof..." value={descFeatures} onChangeText={setDescFeatures} />

        <Text className="label mt-4">Details</Text>
        <TextInput className="input h-20 text-top pt-3" multiline placeholder="Engine capacity, fuel type..." value={descDetails} onChangeText={setDescDetails} />

        <Text className="label mt-4">Other Info</Text>
        <TextInput className="input h-20 text-top pt-3" multiline placeholder="Rental rules etc..." value={descInfo} onChangeText={setDescInfo} />

        <Text className="label mt-4">Location</Text>
        <View className="flex-row gap-2">
            <TextInput className="input flex-1" placeholder="City / Address" value={locationName} onChangeText={setLocationName} />
            <TouchableOpacity onPress={getCurrentLocation} className="bg-blue-600 justify-center px-4 rounded-xl"><FontAwesome5 name="map-marker-alt" size={20} color="white" /></TouchableOpacity>
        </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
        <Text className="text-xl font-bold text-black mb-6">Owner Details</Text>
        <View className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm">
            <Text className="label">Full Name</Text>
            <TextInput className="input bg-white" placeholder="Owner Name" value={ownerName} onChangeText={setOwnerName} />

            <View className="flex-row gap-4 mt-4">
                <View className="flex-1"><Text className="label">NIC Number</Text><TextInput className="input bg-white" placeholder="NIC" value={ownerId} onChangeText={setOwnerId} /></View>
                <View className="flex-1"><Text className="label">Contact</Text><TextInput className="input bg-white" placeholder="07XXXXXXXX" keyboardType="phone-pad" value={ownerContact} onChangeText={setOwnerContact} /></View>
            </View>

            <Text className="label mt-4">Email</Text>
            <TextInput className="input bg-white" placeholder="owner@email.com" keyboardType="email-address" value={ownerEmail} onChangeText={setOwnerEmail} />

            <Text className="label mt-4">Address</Text>
            <TextInput className="input bg-white" placeholder="Permanent Address" value={ownerAddress} onChangeText={setOwnerAddress} />
        </View>

        <View className="mt-6 bg-blue-50 p-4 rounded-xl flex-row items-center">
            <Ionicons name="information-circle-outline" size={24} color="#2563eb" />
            <Text className="text-blue-800 ml-2 flex-1 text-xs">By submitting, you agree that all information provided is accurate and you are the legal owner of this vehicle.</Text>
        </View>
    </View>
  );

  if (loadingData) {
      return (
          <View className="flex-1 justify-center items-center bg-white">
              <ActivityIndicator size="large" color="black" />
              <Text className="mt-4 text-gray-500">Loading Vehicle Data...</Text>
          </View>
      );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        
        <View className="pt-12 pb-4 px-6 bg-white border-b border-gray-100 z-10 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
                    <MaterialIcons name="arrow-back-ios" size={20} color="black" />
                </TouchableOpacity>
                <Text className="text-lg font-bold">{editId ? "Edit Vehicle" : `Step ${currentStep} of ${totalSteps}`}</Text>
                <View className="w-8" /> 
            </View>
            
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden w-full">
                <View style={{ width: `${(currentStep / totalSteps) * 100}%` }} className="h-full bg-black rounded-full" />
            </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <View className="mt-8 mb-10">
                <TouchableOpacity 
                    onPress={currentStep === totalSteps ? handleSubmit : handleNext} 
                    className={`w-full py-4 rounded-2xl flex-row justify-center items-center ${currentStep === totalSteps ? 'bg-green-600' : 'bg-black'}`}
                >
                    <Text className="text-white font-bold text-lg mr-2">
                        {isLoading ? "Processing..." : currentStep === totalSteps ? (editId ? "Update Vehicle" : "Publish Vehicle") : "Next Step"}
                    </Text>
                    
                    {!isLoading && currentStep !== totalSteps && (
                        <MaterialIcons name="arrow-forward" size={20} color="white" />
                    )}
                    
                    {!isLoading && currentStep === totalSteps && (
                        <MaterialIcons name="check" size={20} color="white" />
                    )}
                </TouchableOpacity>
            </View>
            <View className="h-[200px]"></View>
        </ScrollView>

      </View>

      <Modal visible={mapVisible} animationType="slide">
        <View className="flex-1">
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
             <View className="absolute bottom-10 left-5 right-5 bg-white p-4 rounded-2xl shadow-lg">
                <Text className="text-center font-bold mb-2">Tap to Pin Location</Text>
                <TouchableOpacity onPress={() => setMapVisible(false)} className="bg-black py-3 rounded-xl">
                    <Text className="text-white text-center font-bold">Confirm Location</Text>
                </TouchableOpacity>
             </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  dropdown: { height: 50, borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#f9fafb' },
  placeholderStyle: { fontSize: 14, color: '#9ca3af' },
  selectedTextStyle: { fontSize: 14, color: '#1f2937' },
  inputSearchStyle: { height: 40, fontSize: 14 },
});

export default VehicleForm;