# HerHealth Mobile App

React Native mobile application for HerHealth Africa — a women's health navigation platform.

Built with **Expo** + **TypeScript** + **Firebase**, sharing the same backend as the web app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 51 |
| Language | TypeScript |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Backend | Firebase (Auth + Firestore) — same project as web |
| Icons | @expo/vector-icons (Ionicons) |
| Safe Area | react-native-safe-area-context |
| Gestures | react-native-gesture-handler |

---

## Project Structure

```
mobile/
├── App.tsx                        # Root entry point
├── app.json                       # Expo config
├── babel.config.js
├── tsconfig.json
├── package.json
└── src/
    ├── constants/
    │   ├── colors.ts              # Brand colors (ported from Tailwind)
    │   └── typography.ts          # Font sizes and weights
    ├── context/
    │   └── AuthContext.tsx        # Firebase Auth context (same logic as web)
    ├── firebase/
    │   └── firebaseConfig.ts      # Firebase init (same project as web)
    ├── navigation/
    │   ├── RootNavigator.tsx      # Auth gate + stack navigator
    │   └── TabNavigator.tsx       # Bottom tab bar (5 tabs)
    ├── screens/
    │   ├── auth/
    │   │   └── AuthScreen.tsx     # Login / Sign Up / Forgot Password
    │   ├── dashboard/
    │   │   └── DashboardScreen.tsx # Home with cycle widget + bookings
    │   ├── tracker/
    │   │   └── TrackerScreen.tsx  # Symptom tracker + cycle logging
    │   ├── booking/
    │   │   └── BookingScreen.tsx  # 3-step booking wizard
    │   ├── sisterhood/
    │   │   └── SisterhoodScreen.tsx # Community circles + chat + wins
    │   ├── discover/
    │   │   └── DiscoverScreen.tsx # Specialist directory + nominations
    │   └── profile/
    │       └── ProfileScreen.tsx  # Profile, settings, logout
    ├── components/
    │   └── ui/
    │       ├── Button.tsx         # Reusable button (primary/secondary/ghost)
    │       ├── Card.tsx           # Reusable card container
    │       ├── Input.tsx          # Reusable text input with label + error
    │       ├── LoadingScreen.tsx  # Full-screen loading state
    │       └── Toast.tsx          # Animated toast notification
    └── utils/
        └── cycleUtils.ts          # Cycle phase calculator (ported from web)
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for testing)

### 2. Install Dependencies

```bash
cd mobile
npm install
```

### 3. Firebase Configuration

The Firebase credentials are already configured in `src/firebase/firebaseConfig.ts` and point to the **same `herhealth-africa` Firebase project** as the web app. No changes needed — the mobile app shares the same Firestore database and Auth system.

### 4. Run the App

```bash
# Start Expo dev server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Scan QR code with Expo Go on your phone
# (works on both Android and iOS)
```

---

## Firebase Firestore Rules

The mobile app uses the **same Firestore collections** as the web app:

| Collection | Purpose |
|---|---|
| `users/{uid}` | User profile document |
| `users/{uid}/profile/data` | Cycle settings, health goals |
| `users/{uid}/dailyLogs/{date}` | Daily symptom logs |
| `users/{uid}/bookings/{id}` | Session bookings |
| `chats/{circleId}/messages` | Sisterhood chat messages |
| `wins` | Community wins board |
| `specialists` | Vetted specialist directory |
| `nominations` | Specialist nominations |

Make sure your Firestore security rules allow authenticated users to read/write their own data.

---

## Build for Production

### Android APK (via Expo EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK for Android
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS (via Expo EAS — requires Apple Developer account)

```bash
eas build --platform ios --profile production
```

### Local Android Build (requires Android Studio)

```bash
npx expo run:android
```

---

## Features

| Feature | Status |
|---|---|
| Login / Sign Up / Forgot Password | ✅ |
| Dashboard with cycle phase widget | ✅ |
| Active bookings display | ✅ |
| Quick action navigation cards | ✅ |
| Symptom tracker (8 symptoms, 1-5 rating) | ✅ |
| Mood selector (5 options) | ✅ |
| Energy level slider | ✅ |
| Daily notes | ✅ |
| Weekly symptom chart | ✅ |
| Cycle phase calculator | ✅ |
| Period logging modal | ✅ |
| 3-step booking wizard | ✅ |
| Package selection (3 packages) | ✅ |
| Sisterhood community circles | ✅ |
| Real-time anonymous chat | ✅ |
| Community wins board | ✅ |
| Specialist directory | ✅ |
| Specialist nominations | ✅ |
| Sister testimonials | ✅ |
| Profile management | ✅ |
| Edit profile modal | ✅ |
| Cycle settings modal | ✅ |
| Sign out | ✅ |
| WhatsApp booking contact | ✅ |

---

## Brand Colors

| Name | Hex |
|---|---|
| Rose Pink (primary) | `#D4688A` |
| Dark Plum (text) | `#2D1B2E` |
| Petal (background) | `#FAF9F6` |
| Rose Pink Light | `#FFF5F8` |

---

## Notes

- The Admin Panel from the web app is intentionally excluded from the mobile app — admin management is better suited to the web interface.
- The WellnessCircle page was a placeholder in the web app and is not included.
- All Firebase calls use the same Firestore document paths as the web app, ensuring full data compatibility.
