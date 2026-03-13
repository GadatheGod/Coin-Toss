# Coin Toss App

## Run on your phone (Expo Go)

1. Open VS Code terminal in this folder
2. Run: npm install
3. Run: npx expo start
4. Scan the QR code with Expo Go app on your Android phone
   - Install Expo Go from Play Store if not done yet

## Build APK (offline install)

1. Install EAS CLI:
   npm install -g eas-cli

2. Login to Expo:
   eas login

3. Configure build:
   eas build:configure

4. Build APK:
   eas build -p android --profile preview

5. Download APK from the link Expo gives you and install on phone.

## Notes
- Make sure your phone and PC are on the same WiFi for Expo Go
- The APK build happens on Expo cloud servers (free tier available)
