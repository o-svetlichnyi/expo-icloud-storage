const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the project and workspace directories
const projectRoot = __dirname;
// Workspace root is ../../ from the project root
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the workspace
config.watchFolders = [projectRoot, workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"), // In case you have a root node_modules
];

// 3. Force Metro to resolve the library from the local symlink
config.resolver.extraNodeModules = {
  "@oleg_svetlichnyi/expo-icloud-storage": workspaceRoot,
};

module.exports = config; 