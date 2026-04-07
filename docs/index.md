---
layout: home
description: Typed iCloud Drive file operations for Expo iOS apps. Upload, download, list, delete, and track progress in an app iCloud container.

hero:
  name: Expo iCloud Storage
  text: iCloud Drive file operations for Expo iOS.
  tagline: Upload, download, list, delete, and track progress for files in your app's iCloud container, without writing native iOS code.
  image:
    src: /logo.webp
    alt: Expo iCloud Storage
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: API Reference
      link: /api
    - theme: alt
      text: npm
      link: https://www.npmjs.com/package/@oleg_svetlichnyi/expo-icloud-storage

features:
  - title: Expo-first iCloud Drive access
    details: Use a typed JavaScript API from an Expo iOS development build or a bare React Native iOS app with Expo Modules.
  - title: Generic file operations
    details: Create folders, list files, upload, download, delete, and listen for progress events.
  - title: Config plugin included
    details: Add iCloud entitlements and NSUbiquitousContainers from app.json or app.config.js.
  - title: Recipes built on the file API
    details: Use the same upload/download primitives for exports, documents, media, SQLite backups, and Realm backups.
---

```bash
npm install @oleg_svetlichnyi/expo-icloud-storage
```

```ts
import {
  createDirAsync,
  uploadFileAsync,
  downloadFileAsync,
  defaultICloudContainerPath,
} from "@oleg_svetlichnyi/expo-icloud-storage";

await createDirAsync("Exports");

await uploadFileAsync({
  destinationPath: "Exports/export.json",
  filePath: "/path/to/local/export.json",
});

const restoredPath = await downloadFileAsync(
  `${defaultICloudContainerPath}/Documents/Exports/export.json`,
  "/path/to/local/downloads"
);
```

This module is iOS-only and requires iCloud capability configuration. It does not run in Expo Go because it includes native code.

## Use cases

Use the generic file API for JSON exports, app-generated archives, documents, media files, and manual backup or restore flows. SQLite and Realm are recipes built on the same upload/download API, not special database-specific native integrations.

## Common questions

### Can I use this in a React Native app?

Yes, in a bare React Native iOS app that has Expo Modules installed. It is not a pure React Native native module because the JavaScript bridge and iOS pod use `expo-modules-core`.

### Can I use this in Expo Go?

No. Use an Expo development build, EAS iOS build, prebuild, or a bare iOS app.

### Does this sync files automatically?

No. It provides iCloud Drive file operations. iOS controls when files propagate between devices.

Read the full [compatibility guide](./compatibility.md).
