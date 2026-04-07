# API Reference

## Constants

| Export | Type | Description |
| --- | --- | --- |
| `defaultICloudContainerPath` | `string \| null` | Absolute path to the app's iCloud container. It is `null` when the container is unavailable. |

The module stores files under the app's iCloud `Documents` directory. Build full paths with:

```ts
const iCloudDocumentsPath = `${defaultICloudContainerPath}/Documents`;
```

## Availability

### `isICloudAvailableAsync()`

```ts
function isICloudAvailableAsync(): Promise<boolean>;
```

Returns `true` when the current user has an iCloud identity token available on the device.

## Directory and existence

### `createDirAsync(path)`

```ts
function createDirAsync(path: string): Promise<boolean>;
```

Creates a directory relative to the app's iCloud `Documents` directory. Intermediate directories are created.

### `readDirAsync(path, options)`

```ts
function readDirAsync(
  path: string,
  options?: { isFullPath?: boolean }
): Promise<string[]>;
```

Reads a directory relative to iCloud `Documents`.

By default, `isFullPath` is `true`, so returned values are full paths. Set `isFullPath: false` to return only file names.

### `isExistAsync(path, isDirectory)`

```ts
function isExistAsync(path: string, isDirectory: boolean): Promise<boolean>;
```

Checks whether a file or directory exists relative to iCloud `Documents`.

## Upload

### `uploadFileAsync(options)`

```ts
function uploadFileAsync(options: {
  destinationPath: string;
  filePath: string;
}): Promise<string>;
```

Uploads a local file to a destination path relative to iCloud `Documents`.

The parent directory must already exist. Create it with `createDirAsync()` before uploading.

`filePath` can be an Expo FileSystem `file://` URI or a plain local filesystem path.

### `uploadFilesAsync(options)`

```ts
type ICloudFileOperationResult = {
  success: boolean;
  path?: string;
  error?: string;
};

function uploadFilesAsync(options: {
  destinationDirectory: string;
  filePaths: string[];
}): Promise<ICloudFileOperationResult[]>;
```

Uploads multiple local files into a destination directory relative to iCloud `Documents`.

The destination directory must already exist.

Each `filePaths` entry can be an Expo FileSystem `file://` URI or a plain local filesystem path.

## Download

### `downloadFileAsync(path, destinationDir)`

```ts
function downloadFileAsync(
  path: string,
  destinationDir: string
): Promise<string>;
```

Downloads a full iCloud file path into a local destination directory.

`destinationDir` can be an Expo FileSystem `file://` URI or a plain local filesystem path.

### `downloadFilesAsync(paths, destinationDir)`

```ts
function downloadFilesAsync(
  paths: string[],
  destinationDir: string
): Promise<ICloudFileOperationResult[]>;
```

Downloads multiple full iCloud file paths into a local destination directory.

`destinationDir` can be an Expo FileSystem `file://` URI or a plain local filesystem path.

## Delete

### `unlinkAsync(path)`

```ts
function unlinkAsync(path: string): Promise<boolean>;
```

Deletes a full iCloud path.

## Progress events

### `addUploadFilesAsyncProgressListener(listener)`

```ts
function addUploadFilesAsyncProgressListener(
  listener: (event: { value: number }) => void
): Subscription;
```

Listens for upload progress events. `value` is a number from `0` to `100`.

### `addDownloadFilesAsyncProgressListener(listener)`

```ts
function addDownloadFilesAsyncProgressListener(
  listener: (event: { value: number }) => void
): Subscription;
```

Listens for download progress events. `value` is a number from `0` to `100`.

## Path utilities

### `PathUtils.iCloudRemoveDotExt(path)`

```ts
PathUtils.iCloudRemoveDotExt("photo.heic.icloud"); // "photo.heic"
```

Removes the `.icloud` placeholder extension from a path.

### `PathUtils.ext(path)`

```ts
PathUtils.ext("archive.backup.zip"); // "zip"
```

Returns the last extension segment.
