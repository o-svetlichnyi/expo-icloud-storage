import { requireNativeModule } from "expo-modules-core";

export type ICloudFileOperationResult = {
  success: boolean;
  path?: string;
  error?: string;
};

export interface IReadDirAsyncOptions {
  isFullPath?: boolean;
}

export interface ExpoIcloudStorageNativeModule {
  __expo_module_name__?: string;
  startObserving?: () => void;
  stopObserving?: () => void;
  addListener?: any;
  removeListeners?: any;

  defaultICloudContainerPath: string | null;
  isICloudAvailableAsync(): Promise<boolean>;
  isExistAsync(path: string, isDirectory: boolean): Promise<boolean>;
  createDirAsync(path: string): Promise<boolean>;
  readDirAsync(path: string, options?: IReadDirAsyncOptions): Promise<string[]>;
  uploadFileAsync(destinationPath: string, filePath: string): Promise<string>;
  uploadFilesAsync(
    destinationDirectory: string,
    filePaths: string[],
  ): Promise<ICloudFileOperationResult[]>;
  downloadFileAsync(path: string, destinationDir: string): Promise<string>;
  downloadFilesAsync(
    paths: string[],
    destinationDir: string,
  ): Promise<ICloudFileOperationResult[]>;
  unlinkAsync(path: string): Promise<boolean>;
}

// It loads the native module object from the JSI or falls back to
// the bridge module (from NativeModulesProxy) if the remote debugger is on.
export default requireNativeModule<ExpoIcloudStorageNativeModule>(
  "ExpoIcloudStorage",
);
