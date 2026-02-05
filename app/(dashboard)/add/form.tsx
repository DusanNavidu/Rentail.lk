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
  { label: 'Lanka Ashok Leyland', value: 'Lanka Ashok Leyland' },
  { label: 'Eicher', value: 'Eicher' },
  { label: 'Is', value: 'Isuzu' },
  { label: 'Micro', value: 'Micro' },
  { label: 'Ford', value: 'Ford' },
  { label: 'Other', value: 'Other' },
];

// 🚗 Models Data (Brand එක අනුව වෙනස් වීමට)
const modelsByBrand: { [key: string]: { label: string; value: string }[] } = {
  Toyota: [
    { label: 'Allion', value: 'Allion' }, { label: 'Premio', value: 'Premio' }, { label: 'Axio', value: 'Axio' },
    { label: 'Vitz', value: 'Vitz' }, { label: 'Yaris', value: 'Yaris' }, { label: 'Corolla', value: 'Corolla' },
    { label: 'Prius', value: 'Prius' }, { label: 'Aqua', value: 'Aqua' }, { label: 'Land Cruiser', value: 'Land Cruiser' }, 
    { label: 'Prado', value: 'Prado' }, { label: 'Hilux', value: 'Hilux' }, { label: 'KDH', value: 'KDH' }, { label: 'Wigo', value: 'Wigo' }
  ],
  Nissan: [
    { label: 'Sunny', value: 'Sunny' }, { label: 'Leaf', value: 'Leaf' }, { label: 'X-Trail', value: 'X-Trail' },
    { label: 'March', value: 'March' }, { label: 'Patrol', value: 'Patrol' }, { label: 'Caravan', value: 'Caravan' }, 
    { label: 'Navara', value: 'Navara' }, { label: 'GT-R', value: 'GT-R' }
  ],
  Honda: [
    { label: 'Civic', value: 'Civic' }, { label: 'Fit', value: 'Fit' }, { label: 'Vezel', value: 'Vezel' }, 
    { label: 'CR-V', value: 'CR-V' }, { label: 'Grace', value: 'Grace' }, { label: 'Insight', value: 'Insight' }
  ],
  Suzuki: [
    { label: 'Alto', value: 'Alto' }, { label: 'Wagon R', value: 'Wagon R' }, { label: 'Swift', value: 'Swift' },
    { label: 'Celerio', value: 'Celerio' }, { label: 'Baleno', value: 'Baleno' }, { label: 'Every', value: 'Every' }
  ],
  Mitsubishi: [
    { label: 'Lancer', value: 'Lancer' }, { label: 'Montero', value: 'Montero' }, { label: 'Pajero', value: 'Pajero' },
    { label: 'Outlander', value: 'Outlander' }, { label: 'L200', value: 'L200' }
  ],
  Bajaj: [
    { label: 'RE 205', value: 'RE 205' }, { label: 'RE 4S', value: 'RE 4S' }, { label: 'Qute', value: 'Qute' }, 
    { label: 'Pulsar', value: 'Pulsar' }, { label: 'CT 100', value: 'CT 100' }
  ],
  TVS: [
    { label: 'King', value: 'King' }, { label: 'Apache', value: 'Apache' }, { label: 'Scooty Pep', value: 'Scooty Pep' }, { label: 'Ntorq', value: 'Ntorq' }
  ],
  Other: [{ label: 'Other', value: 'Other' }]
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

const VehicleForm = () => {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const { showLoader, hideLoader, isLoading } = useLoader();
  const [loadingData, setLoadingData] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [image, setImage] = useState<string | null>(null);
  
  // Identity
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [modelOptions, setModelOptions] = useState<{ label: string; value: string }[]>([]); // Dynamic Models
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

  // ✅ LOAD DATA FOR EDITING
  useEffect(() => {
    if (editId) {
        setLoadingData(true);
        getVehicleById(editId as string).then((data: any) => {
            
            setImage(data.imageUrl || null);
            
            // Brand & Models Load
            setVehicleBrand(data.vehicleBrand || "");
            const brandModels = modelsByBrand[data.vehicleBrand] || [{ label: 'Other', value: 'Other' }];
            setModelOptions(brandModels); // Models ටික Set කරන්න
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

  // ✅ Brand Change Handler (Update Models List)
  const handleBrandChange = (item: { label: string; value: string }) => {
    setVehicleBrand(item.value);
    setVehicleModel(""); // Clear old model
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
    setSelectedCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
    });
    setMapVisible(true);
  };

  const handleNext = () => {
    // Step 1 Validation: Image
    if (currentStep === 1) {
        if (!image) {
            return Toast.show({ type: 'error', text1: 'Image Required 📸', text2: 'Please upload a photo first.' });
        }
    }
    
    // Step 2 Validation: Vehicle Identity (Brand, Model, Plate, Engine/Chassis)
    // Note: Removed 'price' and 'seats' from here because they are in Step 3
    else if (currentStep === 2) {
        if (!vehicleBrand || !vehicleModel || !vehicleCategory || !vehicleType || !plateProv || !plateLetters || !plateNumbers) {
            return Toast.show({ type: 'error', text1: 'Missing Details ⚠️', text2: 'Please fill identity fields & plate.' });
        }
    }
    
    // Step 3 Validation: Rental Info (Price, Seats, Location)
    else if (currentStep === 3) {
        if (!price || !seats || !locationName) {
            return Toast.show({ type: 'error', text1: 'Missing Details ⚠️', text2: 'Price, Seats & Location required.' });
        }
    }

    // Proceed to next step if validation passes
    if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else router.back();
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    if (!ownerName || !ownerContact) {
        return Toast.show({ type: 'error', text1: 'Owner Details ⚠️', text2: 'Name & Contact required.' });
    }

    showLoader();
    try {
      const fullPlate = `${plateProv}-${plateLetters}-${plateNumbers}`.toUpperCase();
      let fullDescription = descDetails;
      if (descFeatures || descInfo) {
          fullDescription = `Features: ${descFeatures}\nDetails: ${descDetails}\nInfo: ${descInfo}`;
      }

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
          Toast.show({ type: 'success', text1: 'Updated! 🎉' });
      } else {
          await addVehicle(
            image!, vehicleBrand, vehicleModel, vehicleCategory, vehicleType, fullPlate,
            engineNumber, chassisNumber, price, seats, locData, fullDescription,
            ownerName, ownerId, ownerContact, ownerEmail, ownerAddress
          );
          Toast.show({ type: 'success', text1: 'Published! 🎉' });
      }
      
      setTimeout(() => {
          if (editId) router.replace(`/(dashboard)/add/${editId}`); 
          else router.back(); 
      }, 1500);

    } catch (err: any) {
      console.log(err);
      Toast.show({ type: 'error', text1: 'Error ❌', text2: 'Failed to save.' });
    } finally {
      hideLoader();
    }
  };

  // --- RENDER STEPS ---

  const renderStep1 = () => (
    <View className="items-center justify-center py-10">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Upload Vehicle Photo</Text>
        <Text className="text-gray-500 mb-8 text-center px-4">Choose a clear cover photo for your vehicle.</Text>
        <TouchableOpacity onPress={pickImage} className="w-full h-72 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 justify-center items-center overflow-hidden shadow-sm">
            {image ? (
                <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
            ) : (
                <View className="items-center">
                    <Feather name="camera" size={40} color="#4b5563" />
                    <Text className="text-lg font-bold text-gray-600 mt-2">Tap to Upload</Text>
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
            onChange={handleBrandChange} // ✅ Corrected Handler
        />
        
        <Text className="label mt-4">Model</Text>
        <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            data={modelOptions} // ✅ Dynamic Models
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
            <TextInput className="input w-20 text-center" placeholder="WP" maxLength={2} autoCapitalize="characters" value={plateProv} onChangeText={setPlateProv} />
            <Text className="font-bold text-xl">-</Text>
            <TextInput className="input w-24 text-center" placeholder="CAB" maxLength={3} autoCapitalize="characters" value={plateLetters} onChangeText={setPlateLetters} />
            <Text className="font-bold text-xl">-</Text>
            <TextInput className="input flex-1 text-center" placeholder="1234" maxLength={4} keyboardType="numeric" value={plateNumbers} onChangeText={setPlateNumbers} />
        </View>

        <View className="flex-row gap-4 mt-4">
            <View className="flex-1"><Text className="label">Engine No</Text><TextInput className="input" value={engineNumber} onChangeText={setEngineNumber} /></View>
            <View className="flex-1"><Text className="label">Chassis No</Text><TextInput className="input" value={chassisNumber} onChangeText={setChassisNumber} /></View>
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

        <Text className="label mt-4">Features (Optional)</Text>
        <TextInput className="input" placeholder="Ex: AC, Bluetooth..." value={descFeatures} onChangeText={setDescFeatures} />

        <Text className="label mt-4">Details / Description</Text>
        <TextInput className="input h-24 text-top pt-3" multiline placeholder="Full vehicle description..." value={descDetails} onChangeText={setDescDetails} />

        <Text className="label mt-4">Other Info (Optional)</Text>
        <TextInput className="input h-16 text-top pt-3" multiline placeholder="Rules..." value={descInfo} onChangeText={setDescInfo} />

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
                <View className="flex-1"><Text className="label">NIC</Text><TextInput className="input bg-white" value={ownerId} onChangeText={setOwnerId} /></View>
                <View className="flex-1"><Text className="label">Contact</Text><TextInput className="input bg-white" keyboardType="phone-pad" value={ownerContact} onChangeText={setOwnerContact} /></View>
            </View>

            <Text className="label mt-4">Email</Text>
            <TextInput className="input bg-white" keyboardType="email-address" value={ownerEmail} onChangeText={setOwnerEmail} />
            
            <Text className="label mt-4">Address</Text>
            <TextInput className="input bg-white" value={ownerAddress} onChangeText={setOwnerAddress} />
        </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        
        {/* HEADER & PROGRESS */}
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

        {/* ✅ CONDITIONAL RENDERING (Fixes Hook Error) */}
        {loadingData ? (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="black" />
                <Text className="mt-4 text-gray-500">Loading Vehicle Data...</Text>
            </View>
        ) : (
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                {/* BUTTONS */}
                <View className="mt-8 mb-10">
                    <TouchableOpacity 
                        onPress={currentStep === totalSteps ? handleSubmit : handleNext} 
                        className={`w-full py-4 rounded-2xl flex-row justify-center items-center ${currentStep === totalSteps ? 'bg-green-600' : 'bg-black'}`}
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

      {/* MAP MODAL */}
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