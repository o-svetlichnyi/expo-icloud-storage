import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from "expo-modules-core";

import ExpoIcloudStorageModule from "./ExpoIcloudStorageModule";
const emitter = new EventEmitter(
  ExpoIcloudStorageModule ?? NativeModulesProxy.ExpoIcloudStorage
);

interface IUploadFilesAsync {
  destinationDirectory: string;
  filePaths: string[];
}
interface IUploadFileAsync {
  destinationPath: string;
  filePath: string;
}
interface IProgressEventPayload {
  value: number;
}

export function addUploadFilesAsyncProgressListener(
  listener: (event: IProgressEventPayload) => void
): Subscription {
  return emitter.addListener("onUploadFilesAsyncProgress", listener);
}

export function addDownloadFilesAsyncProgressListener(
  listener: (event: IProgressEventPayload) => void
): Subscription {
  return emitter.addListener("onDownloadFilesAsyncProgress", listener);
}

export const defaultICloudContainerPath: string | null =
  ExpoIcloudStorageModule.defaultICloudContainerPath;

export async function isExistAsync(
  path: string,
  isDirectory: boolean
): Promise<boolean> {
  return await ExpoIcloudStorageModule.isExistAsync(path, isDirectory);
}
type IReadDirAsyncOptions = {
  isFullPath?: boolean;
};
export async function readDirAsync(
  path: string,
  options: IReadDirAsyncOptions = { isFullPath: true }
): Promise<string[]> {
  return await ExpoIcloudStorageModule.readDirAsync(path, options);
}

export async function uploadFilesAsync({
  destinationDirectory,
  filePaths,
}: IUploadFilesAsync): Promise<void> {
  return await ExpoIcloudStorageModule.uploadFilesAsync(
    destinationDirectory,
    filePaths
  );
}

export async function uploadFileAsync({
  destinationPath,
  filePath,
}: IUploadFileAsync): Promise<void> {
  return await ExpoIcloudStorageModule.uploadFileAsync(
    destinationPath,
    filePath
  );
}
export async function unlinkAsync(path: string): Promise<void> {
  return ExpoIcloudStorageModule.unlinkAsync(path);
}
export async function createDirAsync(path: string): Promise<void> {
  return ExpoIcloudStorageModule.createDirAsync(path);
}
export async function isICloudAvailableAsync(): Promise<boolean> {
  return ExpoIcloudStorageModule.isICloudAvailableAsync();
}
export async function downloadFileAsync(
  path: string,
  destinationPath: string
): Promise<string> {
  return ExpoIcloudStorageModule.downloadFileAsync(path, destinationPath);
}

export async function downloadFilesAsync(
  paths: string[],
  destinationPath: string
): Promise<{ success: boolean; path: string }[]> {
  return ExpoIcloudStorageModule.downloadFilesAsync(paths, destinationPath);
}
export { PathUtils } from "./path";
