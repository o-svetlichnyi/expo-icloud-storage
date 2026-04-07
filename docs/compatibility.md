# Compatibility

`@oleg_svetlichnyi/expo-icloud-storage` is an Expo-first iOS native module. It can also be used in bare React Native apps that have Expo Modules installed.

## Works with

| Environment | Status | Notes |
| --- | --- | --- |
| Expo development build | Supported | Use `npx expo run:ios` or EAS development builds. |
| Expo prebuild | Supported | The config plugin writes the iCloud configuration during prebuild. |
| EAS iOS build | Supported | The app must use an iCloud-capable bundle identifier and provisioning profile. |
| Bare React Native iOS app | Supported with Expo Modules | Install Expo Modules, install pods, and configure the iCloud capability. |
| React Native New Architecture | Supported | The package is an Expo Module and the example app is configured with `newArchEnabled: true`. |
| iOS simulator | Partially supported | Useful for launch/build checks. iCloud availability depends on the simulator being signed in to iCloud. |
| Physical iOS device | Supported | Best environment for real iCloud Drive upload/download testing. |

## Not supported

| Environment | Status | Why |
| --- | --- | --- |
| Expo Go | Not supported | Expo Go cannot load this custom native module. |
| Android | Not supported | The package only ships an iOS native implementation. |
| Web | Not supported | It uses iOS iCloud Drive APIs. |
| Pure React Native without Expo Modules | Not supported | The JavaScript bridge and native module use `expo-modules-core`. |
| Real-time multi-device sync engine | Not provided | iCloud Drive sync timing is controlled by iOS. This package exposes file operations, not a conflict-resolution sync layer. |

## Can I use it in a React Native app?

Yes, if the app has Expo Modules installed and is built for iOS. The package peer dependencies include `react-native`, `expo`, and `expo-modules-core`, and the native pod depends on `ExpoModulesCore`.

For bare React Native apps, install Expo Modules first, then install this package and run CocoaPods:

```bash
npm install @oleg_svetlichnyi/expo-icloud-storage
cd ios
pod install
```

You also need the iCloud capability and a matching iCloud container configured in your Apple Developer team and iOS target.

## Can I use it in Expo Go?

No. This package includes native Swift code, so it requires a development build, prebuild, EAS build, or bare iOS app.

## Does it sync files automatically between devices?

No. The API can create directories, upload files, list directories, download files, delete files, and report progress. iOS decides when iCloud Drive propagates changes to other devices. For backup and restore flows, design the UI around explicit user actions such as "Back up now" and "Restore from iCloud".

## Good use cases

- Backing up an Expo SQLite database to iCloud Drive.
- Backing up a Realm database file to iCloud Drive.
- Uploading JSON exports or app-generated archives.
- Restoring a user-selected backup file.
- Listing and deleting backup files in the app's iCloud container.

## Poor fit

- Cross-platform storage for Android and iOS.
- Real-time collaborative sync.
- Background conflict resolution across multiple devices.
- Apps that must work inside Expo Go.
