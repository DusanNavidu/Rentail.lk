<div align="center">

  <img src="./assets/images/icon.png" alt="Rentail Logo" width="120" />

  # 🚗 Rentail.lk
  
  **Sri Lanka's Premier Peer-to-Peer Vehicle Rental Platform**
  
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](./LICENSE)

  <p>
    <b>Rentail.lk</b> connects vehicle owners with renters seamlessly. Whether it's a car, bike, van, or lorry, find the perfect ride or earn passive income by listing your vehicle.
  </p>

  [Report Bug](https://github.com/DusanNavidu/Rentail.lk/issues) • [Request Feature](https://github.com/DusanNavidu/Rentail.lk/issues)

</div>

---

## 📑 Table of Contents
- [📸 App Previews](#-app-previews)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Installation & Setup](#-installation--setup)
- [⚙️ Configuration](#️-configuration)
- [📂 Project Structure](#-project-structure)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📞 Contact](#-contact)

---

## 📸 App Previews

<div align="center">
  <table>
    <tr>
      <td align="center"><b>🏠 Home Screen</b></td>
      <td align="center"><b>🚙 Vehicle Details</b></td>
      <td align="center"><b>📅 Booking Flow</b></td>
    </tr>
    <tr>
      <td><img src="./assets/screenshots/home.png" width="250" /></td>
      <td><img src="./assets/screenshots/details.png" width="250" /></td>
      <td><img src="./assets/screenshots/booking.png" width="250" /></td>
    </tr>
    <tr>
      <td align="center"><b>➕ Add Vehicle</b></td>
      <td align="center"><b>📊 Dashboard</b></td>
      <td align="center"><b>🌙 Dark Mode</b></td>
    </tr>
    <tr>
      <td><img src="./assets/screenshots/add.png" width="250" /></td>
      <td><img src="./assets/screenshots/dashboard.png" width="250" /></td>
      <td><img src="./assets/screenshots/darkmode.png" width="250" /></td>
    </tr>
  </table>
</div>

---

## ✨ Key Features

### 👤 For Renters
- **🚙 Extensive Listings:** Browse Cars, Vans, Bikes, Tuk-Tuks, Lorries, and more.
- **🔍 Smart Search:** Filter by Brand (Toyota, Nissan, etc.), Price, and Location.
- **📅 Easy Booking:** Real-time availability check and price calculation based on dates.
- **📍 Map View:** View vehicle pick-up locations directly on an interactive map.
- **📜 History:** Track active, pending, and completed bookings.

### 🚘 For Vehicle Owners
- **📝 Easy Listing:** 4-step guided form to add vehicles with photos and specs.
- **💼 Manage Requests:** Accept or Reject incoming booking requests instantly.
- **💰 Earnings Dashboard:** Visualize your income and booking performance.
- **🔄 Availability Control:** Update vehicle status and details anytime.

### ⚙️ System Highlights
- **🔐 Secure Auth:** Powered by Firebase Authentication (Email/Password).
- **🌗 Theme Support:** Seamless Dark and Light mode switching.
- **📱 Responsive UI:** Optimized for both Android and iOS devices.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React Native, Expo, TypeScript |
| **Styling** | NativeWind (Tailwind CSS) |
| **Navigation** | Expo Router (File-based routing) |
| **Backend** | Firebase Firestore (NoSQL DB) |
| **Authentication** | Firebase Auth |
| **Storage** | Cloudinary (Image Hosting) |
| **Maps** | React Native Maps, Expo Location |
| **UI Components** | React Native Element Dropdown, Lucide Icons |

---

## 🚀 Installation & Setup

Follow these steps to get a local copy up and running.

### Prerequisites
* **Node.js** (v18 or newer)
* **npm** or **yarn**
* **Expo Go** app on your phone (or an Emulator)

### Installation

1.  **Clone the Repo**
    ```bash
    git clone [https://github.com/DusanNavidu/Rentail.lk.git](https://github.com/DusanNavidu/Rentail.lk.git)
    cd Rentail.lk
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the App**
    ```bash
    npx expo start -c
    ```

---

## ⚙️ Configuration

To make the app work, you need to configure **Firebase**.

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project and add a Web App.
3.  Create a file named `firebase.ts` inside the `services/` folder.
4.  Paste your credentials:

```typescript
// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);