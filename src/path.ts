/**
 * Utility functions for handling iCloud paths and file extensions
 */
export class PathUtils {
  /**
   * Removes the .icloud extension from a path
   * iCloud automatically adds a .icloud extension to files that are in the cloud
   * but not downloaded locally
   * 
   * @param path The path with potential .icloud extension
   * @returns The path with .icloud extension removed
   * 
   * @example
   * PathUtils.iCloudRemoveDotExt("photo.jpg.icloud") // returns "photo.jpg"
   */
  static iCloudRemoveDotExt(path: string): string {
    if (!path) return path;
    return path.replace(/(.*?)(\.(.*?)\.icloud)$/, "$1$3");
  }

  /**
   * Gets the file extension from a path
   * 
   * @param path The file path
   * @returns The file extension or undefined if no extension exists
   * 
   * @example
   * PathUtils.ext("photo.jpg") // returns "jpg"
   * PathUtils.ext("file.with.multiple.dots.txt") // returns "txt"
   */
  static ext(path: string): string | undefined {
    if (!path) return undefined;
    const parts = path.split(".");
    return parts.length > 1 ? parts.pop() : undefined;
  }
}
