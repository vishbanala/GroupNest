# Building GroupNest

## Important: Native Modules Required

This app uses native modules (`@react-native-async-storage/async-storage` and `expo-image-picker`) which **cannot run in Expo Go**. You need to create a **development build**.

## Option 1: Build on Android (Windows Compatible)

Since you're on Windows, you can build and test on Android:

```bash
# Make sure you have Android Studio installed with an emulator set up
npx expo run:android
```

This will:
1. Build the native Android app
2. Install it on your emulator/device
3. Launch the app

## Option 2: Use EAS Build (Recommended for iOS)

For iOS builds (or cloud builds), use Expo Application Services:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS** (if not already done):
   ```bash
   eas build:configure
   ```

4. **Build for iOS** (requires Apple Developer account):
   ```bash
   eas build --platform ios
   ```

5. **Build for Android**:
   ```bash
   eas build --platform android
   ```

6. **Build locally** (if you have the required tools):
   ```bash
   eas build --platform ios --local
   ```

## Option 3: Build iOS on macOS

If you have access to a Mac:

1. **Install CocoaPods** (if not installed):
   ```bash
   sudo gem install cocoapods
   ```

2. **Install iOS dependencies**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Build and run**:
   ```bash
   npx expo run:ios
   ```

## Troubleshooting

### "NativeModule: AsyncStorage is null"

This means you're trying to run in Expo Go. You **must** use a development build:

1. Stop the current Expo server
2. Run `npx expo prebuild --clean` (if not already done)
3. Build with `npx expo run:android` or `npx expo run:ios`
4. Or use EAS Build

### "Cannot find native module 'ExponentImagePicker'"

Same issue - you need a development build, not Expo Go.

### Metro Cache Issues

Clear the cache:
```bash
npx expo start --clear
```

Or:
```bash
npx react-native start --reset-cache
```

### Android Build Issues

Make sure:
- Android Studio is installed
- Android SDK is configured
- An emulator is running or a device is connected
- Run `npx expo run:android`

### iOS Build Issues (on Mac)

1. Make sure Xcode is installed
2. Run `cd ios && pod install`
3. Open the project in Xcode: `open ios/GroupNest.xcworkspace`
4. Select a simulator and run

## Quick Start (Android on Windows)

```bash
# 1. Make sure Android Studio is installed with an emulator
# 2. Start an Android emulator from Android Studio
# 3. Run:
npx expo run:android
```

This will take 5-10 minutes the first time as it builds the native app.

## Development Workflow

Once you have a development build installed:

1. **Start the dev server**:
   ```bash
   npx expo start --dev-client
   ```

2. **The app will automatically reload** when you make changes

3. **For native changes**, you'll need to rebuild:
   ```bash
   npx expo run:android  # or run:ios
   ```

## Summary

- ❌ **Cannot use Expo Go** - native modules not supported
- ✅ **Use development build** - `npx expo run:android` or `npx expo run:ios`
- ✅ **Or use EAS Build** - cloud builds for both platforms
- ✅ **Android works on Windows** - iOS requires Mac or EAS Build








