const { getDefaultConfig } = require("expo/metro-config");
const fs = require("fs");
const path = require("path");

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(projectRoot, "node_modules/expo/node_modules"),
  path.resolve(projectRoot, "node_modules/react-native/node_modules"),
];

config.resolver.extraNodeModules = {
  "@oleg_svetlichnyi/expo-icloud-storage": workspaceRoot,
};

const ancestorNodeModules = path.resolve(workspaceRoot, "../..", "node_modules");
const hasAncestorNativeDeps = ["expo", "react", "react-native"].some((name) =>
  fs.existsSync(path.join(ancestorNodeModules, name, "package.json")),
);

if (hasAncestorNativeDeps) {
  config.resolver.disableHierarchicalLookup = true;
  Object.assign(config.resolver.extraNodeModules, {
    expo: path.resolve(projectRoot, "node_modules/expo"),
    "expo-modules-core": path.resolve(
      projectRoot,
      "node_modules/expo-modules-core",
    ),
    react: path.resolve(projectRoot, "node_modules/react"),
    "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  });
}

module.exports = config;
