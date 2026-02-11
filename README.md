# Classmode

Classmode is a comprehensive academic management application built with **React Native** and **Expo**. It streamlines the daily academic experience for students and faculty by providing robust tools for timetable management, attendance tracking, and real-time class notifications.

## 🚀 Features

### 📅 Smart Timetable Management
- **Weekly Schedule**: View your entire week's class schedule at a glance.
- **Detailed View**: Access specific details for each class, including timing, room number, and faculty.
- **Dynamic Updates**: Real-time updates for rescheduled or cancelled classes.
- **Admin Tools**: Class Representatives (CRs) and Admins can add or edit class schedules directly from the app.

### 📊 Attendance Tracking
- **Visual Analytics**: Monitor your attendance with intuitive circular progress indicators.
- **History Log**: View detailed logs of present, absent, and cancelled classes.
- **Status Alerts**: Get visual warnings if your attendance drops below required thresholds (e.g., 75%).
- **Quick Actions**: Easily mark or toggle attendance status (Present/Absent).

### 🔐 Secure Authentication & Profile
- **User Accounts**: Secure Signup and Login flows.
- **Password Recovery**: Integrated "Forgot Password" flow with OTP verification.
- **Profile Management**: customizable user profiles with crucial academic details (Batch, Section, etc.).

### 🔔 Notifications
- **Real-time Alerts**: Stay informed about class changes, important announcements, and attendance milestones.
- **Firebase Integration**: Reliable push notifications powered by Firebase Cloud Messaging.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 54](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language**: JavaScript / TypeScript
- **Styling**: 
  - Custom Theming System (`src/theme`)
  - `StyleSheet` API and Global CSS
  - [NativeWind](https://www.nativewind.dev/) (Tailwind CSS support)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & Moti
- **Icons**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native) / Expo Vector Icons
- **Fonts**: Inter, Outfit, Urbanist (via `@expo-google-fonts`)

### Backend & Services
- **API Communication**: [Axios](https://axios-http.com/)
- **Notifications**: [React Native Firebase](https://rnfirebase.io/) (Messaging)
- **Backend Infrastructure**: Node.js, Express (Inferred), Redis, Docker
- **Database**: MongoDB (Inferred)

---

## 📂 Project Structure

```
c:/App/MyNewProject/
├── app/                  # Expo Router screens and layouts
│   ├── (auth)/           # Authentication screens (Login, Signup, etc.)
│   ├── (timetable)/      # Timetable related screens
│   └── ...
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context for state management
│   ├── services/         # API services (Auth, Attendance, etc.)
│   ├── theme/            # Design tokens and theme configuration
│   └── utils/            # Helper functions
├── assets/               # Images and static assets
└── ...
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (LTS version recommended)
- npm or yarn
- Expo Go app on your physical device (Android/iOS) OR an Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/classmode.git
   cd classmode
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Create a `.env` file in the root directory if required for API keys.
   - Ensure `google-services.json` is present for Firebase functionality on Android.

4. **Run the App**
   ```bash
   npx expo start
   ```
   - Press `a` to open in Android Emulator
   - Press `i` to open in iOS Simulator
   - Scan the QR code with Expo Go to run on a physical device.

---

## 📱 Screenshots

| Timetable View | Attendance Stats | Login Screen |
|:---:|:---:|:---:|
| *(Add screenshot here)* | *(Add screenshot here)* | *(Add screenshot here)* |

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

## 📄 License

This project is licensed under the MIT License.
