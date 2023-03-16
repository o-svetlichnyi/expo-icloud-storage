declare module "ExpoIcloudStorageModule" {
  interface ExpoIcloudStorageModule {
    defaultICloudContainerPath: string | null;
    getDefaultPathAsync(): Promise<string>;
    isExistAsync(path: string): Promise<boolean>;
    readDirAsync(
      path: string,
      options: IReadDirAsyncOptions = { isFullPath: true }
    ): Promise<string[]>;
    uploadFilesAsync(
      destinationPath: string,
      filePaths: string[]
    ): Promise<void>;
    uploadFileAsync(destinationPath: string, filePath: string): Promise<void>;
    unlinkAsync(path: string): Promise<void>;
    createDirAsync(path: string): Promise<void>;
    isICloudAvailableAsync(): Promise<boolean>;
    downloadFileAsync(
      filePath: string,
      destinationPath: string
    ): Promise<string>;
    downloadFilesAsync(
      filePaths: string[],
      destinationPath: string
    ): Promise<{ success: boolean; path: string }[]>;
  }

  const ExpoIcloudStorage: ExpoIcloudStorageModule;
  export default ExpoIcloudStorage;
}
