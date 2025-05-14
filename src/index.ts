import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from "expo-modules-core";

import ExpoIcloudStorageModule from "./ExpoIcloudStorageModule";
const emitter = new EventEmitter(
  ExpoIcloudStorageModule ?? NativeModulesProxy.ExpoIcloudStorage
);

/**
 * Configuration for uploading multiple files
 */
export interface IUploadFilesAsync {
  destinationDirectory: string;
  filePaths: string[];
}

/**
 * Configuration for uploading a single file
 */
export interface IUploadFileAsync {
  destinationPath: string;
  filePath: string;
}

/**
 * Progress event payload for upload and download operations
 */
export interface IProgressEventPayload {
  value: number;
}

/**
 * Add a listener for file upload progress events
 * @param listener Function that will be called when progress updates
 * @returns Subscription that can be removed with .remove()
 */
export function addUploadFilesAsyncProgressListener(
  listener: (event: IProgressEventPayload) => void
): Subscription {
  return emitter.addListener("onUploadFilesAsyncProgress", listener);
}

/**
 * Add a listener for file download progress events
 * @param listener Function that will be called when progress updates
 * @returns Subscription that can be removed with .remove()
 */
export function addDownloadFilesAsyncProgressListener(
  listener: (event: IProgressEventPayload) => void
): Subscription {
  return emitter.addListener("onDownloadFilesAsyncProgress", listener);
}

/**
 * Default path to the app's iCloud container
 * Will be null if iCloud is not available
 */
export const defaultICloudContainerPath: string | null =
  ExpoIcloudStorageModule.defaultICloudContainerPath;

/**
 * Check if a file or directory exists in iCloud
 * @param path The path to check
 * @param isDirectory Whether the path is expected to be a directory
 * @returns Promise that resolves to true if the path exists
 */
export async function isExistAsync(
  path: string,
  isDirectory: boolean
): Promise<boolean> {
  return ExpoIcloudStorageModule.isExistAsync(path, isDirectory);
}

/**
 * Options for reading a directory
 */
export interface IReadDirAsyncOptions {
  isFullPath?: boolean;
}

/**
 * List the contents of a directory in iCloud
 * @param path The directory path to read
 * @param options Configuration options
 * @returns Promise that resolves to an array of file/directory paths
 */
export async function readDirAsync(
  path: string,
  options: IReadDirAsyncOptions = { isFullPath: true }
): Promise<string[]> {
  return ExpoIcloudStorageModule.readDirAsync(path, options);
}

/**
 * Upload multiple files to iCloud
 * @param options Upload configuration with destination and file paths
 * @returns Promise that resolves when all files are uploaded
 */
export async function uploadFilesAsync({
  destinationDirectory,
  filePaths,
}: IUploadFilesAsync): Promise<void> {
  return ExpoIcloudStorageModule.uploadFilesAsync(
    destinationDirectory,
    filePaths
  );
}

/**
 * Upload a single file to iCloud
 * @param options Upload configuration with destination and file path
 * @returns Promise that resolves when the file is uploaded
 */
export async function uploadFileAsync({
  destinationPath,
  filePath,
}: IUploadFileAsync): Promise<void> {
  return ExpoIcloudStorageModule.uploadFileAsync(
    destinationPath,
    filePath
  );
}

/**
 * Remove a file or directory from iCloud
 * @param path The path to remove
 * @returns Promise that resolves when the item is removed
 */
export async function unlinkAsync(path: string): Promise<void> {
  return ExpoIcloudStorageModule.unlinkAsync(path);
}

/**
 * Create a directory in iCloud
 * @param path The directory path to create
 * @returns Promise that resolves when the directory is created
 */
export async function createDirAsync(path: string): Promise<void> {
  return ExpoIcloudStorageModule.createDirAsync(path);
}

/**
 * Check if iCloud is available for the current user
 * @returns Promise that resolves to true if iCloud is available
 */
export async function isICloudAvailableAsync(): Promise<boolean> {
  return ExpoIcloudStorageModule.isICloudAvailableAsync();
}

/**
 * Download a file from iCloud
 * @param path The source path in iCloud
 * @param destinationPath The local destination path
 * @returns Promise that resolves to the local path of the downloaded file
 */
export async function downloadFileAsync(
  path: string,
  destinationPath: string
): Promise<string> {
  return ExpoIcloudStorageModule.downloadFileAsync(path, destinationPath);
}

/**
 * Download multiple files from iCloud
 * @param paths Array of source paths in iCloud
 * @param destinationPath The local destination directory
 * @returns Promise that resolves to an array of download results
 */
export async function downloadFilesAsync(
  paths: string[],
  destinationPath: string
): Promise<{ success: boolean; path: string }[]> {
  return ExpoIcloudStorageModule.downloadFilesAsync(paths, destinationPath);
}

export { PathUtils } from "./path";
