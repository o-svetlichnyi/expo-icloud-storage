---
description: Install and configure Expo iCloud Storage for generic iCloud Drive file operations in Expo iOS apps.
---

# Getting Started

`@oleg_svetlichnyi/expo-icloud-storage` gives Expo iOS apps typed iCloud Drive file operations from TypeScript. It can also run in bare React Native iOS apps that have Expo Modules installed.

Use it when your app needs generic file operations in its iCloud container:

- JSON exports
- app-generated archives
- documents
- media files
- manual backup and restore flows
- SQLite and Realm backup recipes built on top of upload/download

SQLite and Realm are recipes, not special database-specific native integrations.

## Requirements

- iOS 13+
- Expo SDK 53+ or a React Native app using compatible Expo Modules
- a development build, EAS build, prebuild, or bare iOS app
- iCloud capability enabled for your iOS app target
- a user signed in to iCloud on the device

This module is iOS-only. It does not run in Expo Go because Expo Go cannot load custom native modules.

For the full environment matrix, see [Compatibility](./compatibility.md).

## Install

```bash
npm install @oleg_svetlichnyi/expo-icloud-storage
```

## Configure iCloud

Add the config plugin to `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "@oleg_svetlichnyi/expo-icloud-storage",
        {
          "containerIdentifier": "iCloud.$(CFBundleIdentifier)",
          "containerName": "$(PRODUCT_NAME)"
        }
      ]
    ]
  }
}
```

The plugin enables `ios.usesIcloudStorage` when it is not already set, and adds an `NSUbiquitousContainers` entry to the generated iOS Info.plist.

For more options, see [Expo Config Plugin](./config-plugin.md).

## Build your app

For managed Expo apps, create a development build or production build:

```bash
npx expo prebuild --platform ios
npx expo run:ios
```

or build with EAS:

```bash
eas build --platform ios
```

For bare React Native apps using Expo Modules, install pods after adding the package:

```bash
cd ios
pod install
```

## Check availability

```ts
import { isICloudAvailableAsync } from "@oleg_svetlichnyi/expo-icloud-storage";

const available = await isICloudAvailableAsync();

if (!available) {
  // The user may not be signed in to iCloud, or the app may not have the
  // correct iCloud capability/container configuration.
}
```

Next: [Quick Start](./quick-start.md).
