export class PathUtils {
  static iCloudRemoveDotExt(path: string) {
    return path.replace(/(.*?)(\.(.*?)\.icloud)$/, "$1$3");
  }

  static ext(path: string) {
    return path.split(".").pop();
  }
}
