---
description: Troubleshooting guide for iCloud availability, path rules, simulator issues, signing, and iCloud container configuration.
---

# Troubleshooting

## `isICloudAvailableAsync()` returns `false`

Check:

- The device is signed in to iCloud.
- iCloud Drive is enabled on the device.
- The app was built as a development build, EAS build, prebuild, or bare iOS app.
- The app target has the iCloud capability.
- The iCloud container identifier in your app config matches your Apple Developer configuration.

This module does not run in Expo Go.

On a simulator, this can be an environment issue rather than an app bug. A simulator that is not signed in to iCloud will report iCloud as unavailable.

On a physical device, Xcode also needs a working Apple Development signing setup and matching device support. If Xcode reports that the developer disk image cannot be mounted, or the device appears as `connected (no DDI)`, update Xcode or install device support for that iOS version before testing iCloud flows.

If you are running the repository example app on a physical device, replace the placeholder `com.example.expoicloudstorage` bundle identifier and `iCloud.com.example.expoicloudstorage` container with identifiers configured for your Apple Developer team.

## Upload fails with "Parent directory does not exist"

Create the destination directory first:

```ts
await createDirAsync("Exports");

await uploadFileAsync({
  destinationPath: "Exports/export.json",
  filePath: localFilePath,
});
```

For `uploadFilesAsync`, the `destinationDirectory` must already exist.

## Download or delete cannot find the file

`downloadFileAsync`, `downloadFilesAsync`, and `unlinkAsync` expect full iCloud file paths for the iCloud source or delete target.

```ts
const fullPath = `${defaultICloudContainerPath}/Documents/Exports/export.json`;

await downloadFileAsync(fullPath, localDestinationDir);
await unlinkAsync(fullPath);
```

For downloads, the local destination directory can be an Expo FileSystem `file://` URI or a plain local filesystem path.

By contrast, `uploadFileAsync`, `createDirAsync`, `readDirAsync`, and `isExistAsync` use paths relative to the iCloud `Documents` directory.

## Files do not appear on another device immediately

iCloud Drive synchronization is asynchronous and controlled by iOS. This module can ask iCloud to upload or download, but it cannot force Apple's sync service to complete instantly across devices.

For a better user experience:

- show progress events for uploads and downloads
- expose a manual "restore from iCloud" action
- keep a local manifest with timestamps or versions
- avoid claiming real-time multi-device sync unless you have tested your exact flow

## iOS capability looks correct but the app still fails

Verify the generated native project after prebuild:

```bash
npx expo prebuild --platform ios --clean
```

Then open the iOS project in Xcode and inspect Signing & Capabilities for the app target.

If you use a custom iCloud container, confirm the same identifier appears in:

- Apple Developer portal
- app config plugin options
- generated `NSUbiquitousContainers`
