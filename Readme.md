<div align="center">

  <img src="./client/assets/images/logo.jpeg" alt="Krishi Mittra Logo" width="140" style="border-radius: 100%; border: 4px solid #2E7D32;" />

  # 🌾 KRISHI MITTRA
  ### *Smart Farming || Smarter Future*

  **An AI-Powered Multilingual Ecosystem for Modern & Precision Agriculture**

  [![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-v54.0-000000?style=for-the-badge&logo=expo)](https://expo.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-v20-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Groq AI](https://img.shields.io/badge/Groq_AI-Vision_%26_LLM-FF6F00?style=for-the-badge)](https://groq.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)](LICENSE)

</div>

---

## 📌 Executive Summary

**Krishi Mittra** (कृषि मित्र - *Friend of Farmers*) is an enterprise-grade, AI-driven mobile application engineered to bridge the gap between cutting-edge artificial intelligence and ground-level farming operations. 

By unifying **Vision AI plant diagnostics**, **N-P-K soil health analysis**, **real-time Agmarknet mandi pricing**, **voice-assisted multilingual AI chatbots**, and **location-aware micro-climate weather advisory**, Krishi Mittra empowers smallholder and commercial farmers with data-driven decision-making directly from their mobile devices.

---

## ✨ Key Features

### 🧠 1. Multilingual AI Agricultural Assistant (Krishi Bot)
- **Generative AI Guidance:** Instant, context-aware answers to crop diseases, irrigation schedules, and organic farming techniques.
- **Persistent Chat Memory:** Multi-turn session tracking powered by MongoDB & Groq LLM backend.
- **Multilingual Support:** Interactive dialogue in Hindi, English, Marathi, Gujarati, Punjabi, and local regional dialects.

### 🐛 2. AI Pest & Plant Disease Diagnostic Scanner
- **Instant Photo Diagnostics:** Upload leaf or crop photos via camera or gallery to detect plant pathologies, pest infestations, and nutrient deficiencies.
- **Actionable Treatment Plans:** Detailed organic and chemical remedies, recommended spray windows, and prevention protocols.

### 🌱 3. Soil Health & N-P-K Fertilizer Optimization
- **Nutrient Profiling:** Input Nitrogen (N), Phosphorus (P), Potassium (K), and pH levels.
- **Smart Recommendations:** Automated calculation of optimal fertilizer dosages (Urea, DAP, MOP) tailored to crop type and soil composition.

### 💰 4. Real-Time Mandi Prices (Agmarknet Integration)
- **Market Intelligence:** Live price updates across agricultural wholesale markets (Mandis) across India.
- **Price Trend Alerts:** Enables farmers to identify optimal market channels and sell at peak value.

### 🌦️ 5. Micro-Climate Weather & Spraying Window Advisory
- **Precision Forecasts:** Location-validated weather updates for temperature, humidity, rainfall, and wind speeds.
- **Spraying Safety Index:** AI recommendations on safe pesticide/fertilizer spraying windows based on humidity and rain probability.

### 🎙️ 6. Voice Assistant & Accessibility
- **Voice-to-Text & Text-to-Speech:** Integrated using `expo-speech` for low-literacy users, allowing hands-free interaction in local languages.

### 🏛️ 7. Government Schemes Explorer
- **Scheme Discovery:** Direct access to government subsidies (PM-KISAN, PM Fasal Bima Yojana, Soil Health Card Scheme, Kisan Credit Card).
- **Eligibility Checker:** Simplified criteria breakdown to help farmers leverage financial support.

### 👨‍🌾 8. Farmer Community Hub & Live Streaming
- **Peer Knowledge Sharing:** Social feed for farmers to ask questions, share harvest results, and exchange field experiences.
- **Live Video Streaming:** Real-time expert consultation sessions, webinars, and field demonstrations.

### 🎨 9. Premium UX & Animated Splash Screen
- **Modern UI Design:** Clean eco-mint visual design system with smooth layout components.
- **Animated Launch Screen:** Micro-animations (logo scale-up, tagline badge, progress indicator) built with `react-native-reanimated` & `Animated`.

---

## 🏗️ System Architecture

```
                    ┌───────────────────────────────────┐
                    │      Krishi Mittra Mobile App     │
                    │    (React Native + Expo Router)   │
                    └─────────────────┬─────────────────┘
                                      │
                                      │ REST API / JSON
                                      ▼
                    ┌───────────────────────────────────┐
                    │      Node.js / Express Server     │
                    └────────┬─────────────────┬────────┘
                             │                 │
              ┌──────────────┴───┐         ┌───┴──────────────┐
              │ MongoDB Database │         │  Multer Storage  │
              └──────────────────┘         └──────────────────┘
                             │                 │
              ┌──────────────┴─────────────────┴──────────────┐
              │             AI & External Services            │
              ├─────────────────┬──────────────┬──────────────┤
              │ Groq LLM / Vision│ Agmarknet API│ Weather API  │
              └─────────────────┴──────────────┴──────────────┘
```

---

## 🧩 Tech Stack

### **Mobile Client (Frontend)**
- **Framework:** React Native (`v0.81.5`), Expo (`v54.0.20`), Expo Router (`v6.0.13`)
- **Animations:** `react-native-reanimated`, `Animated`, `expo-haptics`
- **UI Components & Icons:** `@expo/vector-icons`, `react-native-toast-message`, Custom Eco Design System
- **State & Storage:** `@react-native-async-storage/async-storage`
- **Media & Voice:** `expo-camera`, `expo-image-picker`, `expo-speech`

### **Server (Backend)**
- **Runtime & Framework:** Node.js, Express.js (`v4.21.2`)
- **Database & ORM:** MongoDB, Mongoose (`v8.12.0`)
- **Authentication:** JWT (JSON Web Tokens), `bcryptjs`, Google OAuth
- **File Processing:** `multer` (multipart image upload middleware)

### **AI & Third-Party APIs**
- **AI Models:** Groq API (High-speed Llama & Vision models for crop diagnosis & chat)
- **Market Data:** Agmarknet Government API
- **Meteorological Data:** OpenWeatherMap API

---

## 📂 Project Directory Structure

```
KRISHI-MITTRA/
├── client/                     # React Native Expo Mobile App
│   ├── app/                    # Expo Router Screens
│   │   ├── _layout.tsx         # Root Stack Navigator
│   │   ├── index.tsx           # Entry Redirect
│   │   ├── Home.jsx            # Main Dashboard
│   │   ├── ChatBot.jsx         # AI Agricultural Assistant
│   │   ├── Pest.jsx            # Pest & Disease Scanner
│   │   ├── Weather.jsx         # Weather & Spray Advisory
│   │   ├── MarektPrice.jsx     # Mandi Prices
│   │   ├── GovtSchemes.jsx     # Schemes Explorer
│   │   ├── Community.jsx       # Farmer Social Hub
│   │   ├── LiveStream.jsx      # Video Streaming
│   │   ├── login.jsx           # User Authentication
│   │   └── signUp.jsx          # Registration
│   ├── src/
│   │   ├── components/         # Reusable Components
│   │   │   ├── SplashScreen.jsx # Animated Launch Screen
│   │   │   ├── SoilData.jsx    # N-P-K Soil Form & Analysis
│   │   │   ├── HeaderTab.jsx   # Top Header Component
│   │   │   └── AppServices.jsx # Service Quick-Links
│   │   ├── services/           # API Services & Axios Client
│   │   └── utils/              # Helper utilities
│   ├── assets/                 # Images, Icons & Logos
│   ├── app.json                # Expo Configuration
│   └── package.json            # Client Dependencies
│
└── Server/                     # Express.js REST API Backend
    ├── Connections/            # Database Connection (MongoDB)
    ├── Controllers/            # Business Logic & Endpoint Handlers
    │   ├── userController.js
    │   ├── soilDataController.js
    │   ├── pestSessionController.js
    │   └── chatHistoryController.js
    ├── Middlewares/            # Multer Upload & Auth Middlewares
    ├── Models/                 # Mongoose Schemas (User, Soil, Chat, Pest)
    ├── Routes/                 # Express Router Endpoints
    ├── index.js                # Server Entrypoint
    └── package.json            # Server Dependencies
```

---

## 📡 REST API Reference

### 👤 User & Auth Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/signup` | Register a new farmer account |
| `POST` | `/api/login` | Authenticate user & issue JWT |
| `POST` | `/api/google-login` | OAuth authentication via Google |
| `GET`  | `/api/getuser/:id` | Fetch detailed user profile |
| `PUT`  | `/api/updateuser/:userId` | Update profile information |

### 🌱 Soil Health Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/soil/add` | Save new N-P-K soil sample analysis |
| `GET`  | `/api/soil/get/user/:id` | Fetch soil health history for user |
| `PATCH`| `/api/soil/update/:id` | Update soil sample records |

### 🐛 AI Pest Scanner & LLM Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/pest/scan` | Upload crop image & get AI disease analysis |
| `POST` | `/api/pest/chat` | Continue multi-turn chat about diagnosis |
| `GET`  | `/api/pest/history/:userId` | Fetch diagnostic history |

### 💬 Chat Assistant Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat/add` | Save AI chat interaction message |
| `GET`  | `/api/chat/get/user/:id` | Retrieve conversational history |

---

## ⚡ Installation & Local Setup

### **Prerequisites**
- **Node.js**: `v18.x` or higher
- **npm** or **yarn**
- **MongoDB**: Local instance or MongoDB Atlas Connection URI
- **Expo Go App**: Download on Android/iOS device for instant testing

### **1. Clone the Repository**
```bash
git clone https://github.com/Shubhampanchal108/KRISHI-MITTRA.git
cd KRISHI-MITTRA
```

### **2. Configure Backend Server**
```bash
cd Server
npm install
```

Start the backend:
```bash
npm start
```

### **3. Configure Mobile Client**
Open a new terminal window:
```bash
cd client
npm install
```

Start the Expo development server:
```bash
npx expo start
```
> Scan the displayed QR code using the **Expo Go** app on your physical device, or run on an Android Emulator / iOS Simulator.

---

## 🚀 Roadmap & Future Enhancements

- [ ] 🌾 **AI Crop Yield Prediction:** Satellite image & historical weather-based harvest estimation models.
- [ ] 🗣️ **Offline Voice AI Mode:** On-device quantized AI voice assistant for remote fields with low connectivity.
- [ ] 🔗 **Blockchain Traceability:** Farm-to-fork supply chain tracking for organic certification transparency.
- [ ] 🤝 **Expert Tele-Consultation:** Direct video scheduling with agricultural scientists & university specialists.
- [ ] 🚜 **Smart IoT Drone Integration:** Automated field scanning telemetry sync with Krishi Mittra.

---

## 💡 Vision

> *"To democratize artificial intelligence for every farmer, transforming traditional agriculture into precision, sustainable, and profitable smart farming."*

---

## 👨‍💻 Developer & Credits

Developed with ❤️ by **Shubham**  
🌍 *Computer Science Engineer & Agri-Tech Enthusiast*  
📧 Email: [panchalshubham2015@gmail.com](mailto:panchalshubham2015@gmail.com)  
🐙 GitHub: [@Shubhampanchal108](https://github.com/Shubhampanchal108)

---

<div align="center">
  <sub>Built for farmers across India & worldwide. Standardized under the MIT License.</sub>
</div>
