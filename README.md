# Leben Mobile

![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

**Leben Mobile** is the mobile application counterpart to the **Leben** web platform. It brings the core features of the Leben ecosystem to your mobile device. Because it is built with React Native, the underlying codebase supports **both Android and iOS**. Depending on your testing setup, you can build and run it on either platform.

## 🔗 The Original Leben Project

This project is an official offshoot of the original **Leben** web application. While the original project focuses on delivering a comprehensive web-based interface, this repository adapts its capabilities for a mobile-first environment.

- **Main Web Repository:** [DavidOG03/Leben](https://github.com/DavidOG03/Leben)

## 🚀 Getting Started

**Important Note on Expo Go:** Because this project uses native modules that are not included in the standard Expo Go app (such as Expo Notifications), you **cannot** run it using Expo Go. You must create and use a **Custom Development Build**.

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [EAS CLI](https://docs.expo.dev/build/setup/) installed globally (`npm install -g eas-cli`)
- An active Expo account (log in via `eas login`)
- Android Studio / Android Emulator (for Android) or Xcode / iOS Simulator (for iOS) installed on your machine.

### Installation & Running the Development Build

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd Leben-mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create the Development Build:**
   You need to build a custom development client for your target platform. 
   
   *For Android:*
   ```bash
   eas build --profile development --platform android
   ```
   *For iOS:*
   ```bash
   eas build --profile development --platform ios
   ```
   *(Alternatively, if you have your local environment completely set up, you can build locally without EAS by running `npx expo run:android` or `npx expo run:ios`)*

4. **Install the Build on your Device/Emulator:**
   Once the EAS build finishes, download the resulting application file (e.g., `.apk` for Android) and install it on your physical device or emulator.

5. **Start the Development Server:**
   After the custom dev client is installed, start your local Metro bundler with the dev client flag:
   ```bash
   npx expo start --dev-client
   ```
   Open the installed app on your device, and it will automatically connect to your local Metro server.

## 🛠 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/)
- **Toolkit:** [Expo](https://expo.dev/) (Custom Development Builds)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! If you're interested in improving the app, feel free to submit a pull request or open an issue.

## 📝 License

This project is open-source and available under the terms of the MIT License.
