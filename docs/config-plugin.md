# Expo Config Plugin

The package includes a config plugin so Expo can generate the iCloud capability configuration during prebuild.

## Recommended config

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

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `containerIdentifier` | `string` | `iCloud.$(CFBundleIdentifier)` | The iCloud container identifier written to `NSUbiquitousContainers`. |
| `containerName` | `string` | `$(PRODUCT_NAME)` | The display name for the iCloud container. |
| `isDocumentScopePublic` | `boolean` | `false` | Whether the container documents are public in iCloud Drive. |
| `supportedFolderLevels` | `string` | `Any` | Value for `NSUbiquitousContainerSupportedFolderLevels`. |
| `enableUsesIcloudStorage` | `boolean` | `true` | Enables `ios.usesIcloudStorage` when it is not already set. |
| `configureUbiquitousContainers` | `boolean` | `true` | Adds the `NSUbiquitousContainers` entry. |
| `configureEntitlements` | `boolean` | `true` | Adds the iCloud container and `CloudDocuments` service to the generated entitlements plist. |

## Manual configuration

If you do not use the config plugin, add the iCloud config manually:

```json
{
  "expo": {
    "ios": {
      "usesIcloudStorage": true,
      "infoPlist": {
        "NSUbiquitousContainers": {
          "iCloud.$(CFBundleIdentifier)": {
            "NSUbiquitousContainerIsDocumentScopePublic": false,
            "NSUbiquitousContainerName": "$(PRODUCT_NAME)",
            "NSUbiquitousContainerSupportedFolderLevels": "Any"
          }
        }
      }
    }
  }
}
```

If you use a custom iCloud container from the Apple Developer portal, replace `iCloud.$(CFBundleIdentifier)` with that identifier.

## Apple Developer configuration

Your app identifier must have the iCloud capability enabled in the Apple Developer portal. In Xcode, the generated native target should show iCloud under Signing & Capabilities.

If `isICloudAvailableAsync()` returns `false`, verify:

- the user is signed in to iCloud on the device
- iCloud Drive is enabled on the device
- the app target has iCloud capability
- the iCloud container identifier matches your app configuration
