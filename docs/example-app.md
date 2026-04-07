---
description: Run the Expo iCloud Storage example app and verify generic iCloud Drive file operations on iOS.
---

# Example App

The repository includes an Expo example app in the `example/` directory.

The example demonstrates:

- iCloud availability checks
- local test file creation
- iCloud directory creation
- upload
- download
- directory listing
- existence checks
- deletion
- upload and download progress listeners

## Run it

From the repository root:

```bash
npm install
npm run prepare
```

Then run the example:

```bash
cd example
npm install
npm run ios
```

The example is iOS-only. You need an iCloud-capable Apple Developer setup for the full flow.

For a real device test, use your own Apple Developer team, a unique bundle identifier, and a matching iCloud container identifier. The checked-in example dogfoods this package's config plugin with placeholder identifiers:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.example.expoicloudstorage"
    },
    "plugins": [
      [
        "@oleg_svetlichnyi/expo-icloud-storage",
        {
          "containerIdentifier": "iCloud.com.example.expoicloudstorage",
          "containerName": "ExpoIcloudStorageExample",
          "isDocumentScopePublic": true
        }
      ]
    ]
  }
}
```

The plugin expands this into `ios.usesIcloudStorage` and `NSUbiquitousContainers` during Expo config evaluation:

```json
{
  "expo": {
    "ios": {
      "usesIcloudStorage": true,
      "infoPlist": {
        "NSUbiquitousContainers": {
          "iCloud.com.example.expoicloudstorage": {
            "NSUbiquitousContainerIsDocumentScopePublic": true,
            "NSUbiquitousContainerName": "ExpoIcloudStorageExample",
            "NSUbiquitousContainerSupportedFolderLevels": "Any"
          }
        }
      }
    }
  }
}
```

If you run the example on a simulator, `iCloud Status: Not Available` usually means that simulator is not signed in to iCloud or iCloud Drive is disabled.
