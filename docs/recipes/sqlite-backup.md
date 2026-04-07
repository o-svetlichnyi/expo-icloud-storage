---
description: Recipe for backing up and restoring an Expo SQLite database file with the generic iCloud upload/download API.
---

# Recipe: SQLite Backup and Restore

This recipe shows how to copy a local SQLite database file to iCloud Drive and restore it later.

It uses the generic file upload and download API. The package does not include a SQLite-specific native backup engine.

The exact database path depends on how your app creates the database. Many Expo SQLite apps store databases under `FileSystem.documentDirectory + "SQLite/"`.

## Backup

```ts
import * as FileSystem from "expo-file-system/legacy";
import {
  createDirAsync,
  isICloudAvailableAsync,
  uploadFileAsync,
} from "@oleg_svetlichnyi/expo-icloud-storage";

export async function backupSQLiteDatabase() {
  const available = await isICloudAvailableAsync();

  if (!available) {
    throw new Error("iCloud is not available.");
  }

  const databaseName = "app.db";
  const localDatabasePath = `${FileSystem.documentDirectory}SQLite/${databaseName}`;
  const remoteDirectory = "SQLiteBackups";
  const remotePath = `${remoteDirectory}/${databaseName}`;

  const info = await FileSystem.getInfoAsync(localDatabasePath);

  if (!info.exists) {
    throw new Error(`SQLite database not found at ${localDatabasePath}`);
  }

  await createDirAsync(remoteDirectory);

  return uploadFileAsync({
    filePath: localDatabasePath,
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

export async function restoreSQLiteDatabase() {
  if (!defaultICloudContainerPath) {
    throw new Error("iCloud container path is not available.");
  }

  const databaseName = "app.db";
  const remotePath = `${defaultICloudContainerPath}/Documents/SQLiteBackups/${databaseName}`;
  const sqliteDir = `${FileSystem.documentDirectory}SQLite`;

  await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });

  return downloadFileAsync(remotePath, sqliteDir);
}
```

## Production notes

- Close active database connections before replacing a SQLite file.
- Use versioned backup names if users may restore older data, for example `app-2026-04-07.db`.
- Upload a small manifest JSON next to the database if you need metadata such as schema version, app version, or created date.
- Do not restore over an open database connection.
