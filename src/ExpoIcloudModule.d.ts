declare module "ExpoIcloudStorageModule" {
  /**
   * Options for readDirAsync
   */
  interface IReadDirAsyncOptions {
    /**
     * Whether to return full paths or just filenames
     * @default true
     */
    isFullPath?: boolean;
  }
  
  interface ExpoIcloudStorageModule {
    /** 
     * Default path to the app's iCloud container 
     * Will be null if iCloud is not available 
     */
    defaultICloudContainerPath: string | null;
    
    /**
     * Check if a file or directory exists in iCloud
     * @param path The path to check
     * @param isDirectory Whether the path is expected to be a directory
     */
    isExistAsync(path: string, isDirectory: boolean): Promise<boolean>;
    
    /**
     * List the contents of a directory in iCloud
     * @param path The directory path to read
     * @param options Configuration options
     * @default options = { isFullPath: true }
     */
    readDirAsync(
      path: string,
      options: IReadDirAsyncOptions
    ): Promise<string[]>;
    
    /**
     * Upload multiple files to iCloud
     * @param destinationDirectory Destination directory in iCloud
     * @param filePaths Array of local file paths to upload
     */
    uploadFilesAsync(
      destinationDirectory: string,
      filePaths: string[]
    ): Promise<void>;
    
    /**
     * Upload a single file to iCloud
     * @param destinationPath Destination path in iCloud
     * @param filePath Local file path to upload
     */
    uploadFileAsync(destinationPath: string, filePath: string): Promise<void>;
    
    /**
     * Remove a file or directory from iCloud
     * @param path The path to remove
     */
    unlinkAsync(path: string): Promise<void>;
    
    /**
     * Create a directory in iCloud
     * @param path The directory path to create
     */
    createDirAsync(path: string): Promise<void>;
    
    /**
     * Check if iCloud is available for the current user
     */
    isICloudAvailableAsync(): Promise<boolean>;
    
    /**
     * Download a file from iCloud
     * @param filePath The source path in iCloud
     * @param destinationPath The local destination path
     */
    downloadFileAsync(
      filePath: string,
      destinationPath: string
    ): Promise<string>;
    
    /**
     * Download multiple files from iCloud
     * @param filePaths Array of source paths in iCloud
     * @param destinationPath The local destination directory
     */
    downloadFilesAsync(
      filePaths: string[],
      destinationPath: string
    ): Promise<{ success: boolean; path: string }[]>;
  }

  const ExpoIcloudStorage: ExpoIcloudStorageModule;
  export default ExpoIcloudStorage;
}
