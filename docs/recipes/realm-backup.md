# Recipe: Realm Backup and Restore

Realm files can be copied like any other local file, but you should make sure the file is in a consistent state before backing it up.

## Backup

```ts
import {
  createDirAsync,
  isICloudAvailableAsync,
  uploadFileAsync,
} from "@oleg_svetlichnyi/expo-icloud-storage";

export async function backupRealmFile(realm: Realm) {
  const available = await isICloudAvailableAsync();

  if (!available) {
    throw new Error("iCloud is not available.");
  }

  const remoteDirectory = "RealmBackups";
  const remotePath = `${remoteDirectory}/default.realm`;

  // Close or otherwise quiesce Realm before copying in production.
  const localRealmPath = realm.path;

  await createDirAsync(remoteDirectory);

  return uploadFileAsync({
    filePath: localRealmPath,
    destinationPath: remotePath,
  });
}
```

## Restore

```ts
import * as FileSystem from "expo-file-system/legacy";
import {
  defaultICloudContainerPath,
  downloadFileAsync,
} from "@oleg_svetlichnyi/expo-icloud-storage";

export async function restoreRealmFile(destinationDir: string) {
  if (!defaultICloudContainerPath) {
    throw new Error("iCloud container path is not available.");
  }

  const remotePath = `${defaultICloudContainerPath}/Documents/RealmBackups/default.realm`;

  await FileSystem.makeDirectoryAsync(destinationDir, { intermediates: true });

  return downloadFileAsync(remotePath, destinationDir);
}
```

## Production notes

- Close Realm before backing up or replacing the file.
- If your Realm setup uses companion files, back up the full set required by your app.
- Prefer versioned backup names if users may restore older data.
- Keep a manifest file with app version and data schema version when restore compatibility matters.
