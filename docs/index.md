---
layout: home

hero:
  name: Expo iCloud Storage
  text: Typed iCloud Drive file API for Expo iOS apps.
  tagline: Upload, download, list, delete, and build backup flows for SQLite, Realm, documents, exports, and media without writing native iOS code.
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
    details: Use a typed JavaScript API from an Expo iOS development build or bare React Native app.
  - title: File operations that map to real app flows
    details: Create folders, list files, upload, download, delete, and listen for progress events.
  - title: Config plugin included
    details: Add iCloud entitlements and NSUbiquitousContainers from app.json or app.config.js.
  - title: Backup recipes
    details: Start with generic upload and download, then adapt the SQLite and Realm backup recipes for your app.
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

await createDirAsync("Backups");

await uploadFileAsync({
  destinationPath: "Backups/export.json",
  filePath: "/path/to/local/export.json",
});

const restoredPath = await downloadFileAsync(
  `${defaultICloudContainerPath}/Documents/Backups/export.json`,
  "/path/to/local/downloads"
);
```

This module is iOS-only and requires iCloud capability configuration. It does not run in Expo Go because it includes native code.
