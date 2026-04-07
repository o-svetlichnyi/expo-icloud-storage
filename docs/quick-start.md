# Quick Start

This flow creates a local file, uploads it to iCloud Drive, lists the directory, downloads it, and deletes it.

```ts
import * as FileSystem from "expo-file-system";
import {
  createDirAsync,
  defaultICloudContainerPath,
  downloadFileAsync,
  isExistAsync,
  isICloudAvailableAsync,
  readDirAsync,
  unlinkAsync,
  uploadFileAsync,
} from "@oleg_svetlichnyi/expo-icloud-storage";

export async function runICloudRoundTrip() {
  const available = await isICloudAvailableAsync();

  if (!available || !defaultICloudContainerPath) {
    throw new Error("iCloud is not available for this app/user.");
  }

  const localFile = `${FileSystem.documentDirectory}export.json`;
  const downloadDir = `${FileSystem.documentDirectory}downloads`;
  const remoteDirectory = "Exports";
  const remoteRelativePath = `${remoteDirectory}/export.json`;
  const remoteFullPath = `${defaultICloudContainerPath}/Documents/${remoteRelativePath}`;

  await FileSystem.writeAsStringAsync(
    localFile,
    JSON.stringify({ createdAt: new Date().toISOString() })
  );

  await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
  await createDirAsync(remoteDirectory);

  const uploadedPath = await uploadFileAsync({
    destinationPath: remoteRelativePath,
    filePath: localFile,
  });

  const exists = await isExistAsync(remoteRelativePath, false);
  const files = await readDirAsync(remoteDirectory, { isFullPath: false });
  const downloadedPath = await downloadFileAsync(remoteFullPath, downloadDir);

  await unlinkAsync(remoteFullPath);

  return {
    uploadedPath,
    exists,
    files,
    downloadedPath,
  };
}
```

## Path rules

Some methods take paths relative to the app's iCloud `Documents` directory. Other methods take full iCloud file paths.

Relative to iCloud `Documents`:

- `createDirAsync(path)`
- `readDirAsync(path, options)`
- `isExistAsync(path, isDirectory)`
- `uploadFileAsync({ destinationPath, filePath })`
- `uploadFilesAsync({ destinationDirectory, filePaths })`

Full iCloud file paths:

- `downloadFileAsync(path, destinationDir)`
- `downloadFilesAsync(paths, destinationDir)`
- `unlinkAsync(path)`

Use `defaultICloudContainerPath` to build full paths:

```ts
const fullPath = `${defaultICloudContainerPath}/Documents/Exports/export.json`;
```

## Progress events

```ts
import {
  addDownloadFilesAsyncProgressListener,
  addUploadFilesAsyncProgressListener,
} from "@oleg_svetlichnyi/expo-icloud-storage";

const uploadSub = addUploadFilesAsyncProgressListener(({ value }) => {
  console.log("Upload progress", value);
});

const downloadSub = addDownloadFilesAsyncProgressListener(({ value }) => {
  console.log("Download progress", value);
});

uploadSub.remove();
downloadSub.remove();
```
