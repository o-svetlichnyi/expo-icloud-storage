const { createRunOncePlugin, withInfoPlist } = require("@expo/config-plugins");
const pkg = require("./package.json");

function withExpoIcloudStorage(config, _props = {}) {
  const {
    containerIdentifier = "iCloud.$(CFBundleIdentifier)",
    containerName = "$(PRODUCT_NAME)",
    isDocumentScopePublic = false,
    supportedFolderLevels = "Any",
    enableUsesIcloudStorage = true,
    configureUbiquitousContainers = true,
  } = _props ?? {};

  config.ios ??= {};
  if (enableUsesIcloudStorage && config.ios.usesIcloudStorage == null) {
    config.ios.usesIcloudStorage = true;
  }

  if (!configureUbiquitousContainers) {
    return config;
  }

  return withInfoPlist(config, (config) => {
    config.modResults.NSUbiquitousContainers ??= {};
    config.modResults.NSUbiquitousContainers[containerIdentifier] ??= {
      NSUbiquitousContainerIsDocumentScopePublic: isDocumentScopePublic,
      NSUbiquitousContainerName: containerName,
      NSUbiquitousContainerSupportedFolderLevels: supportedFolderLevels,
    };
    return config;
  });
}

module.exports = createRunOncePlugin(withExpoIcloudStorage, pkg.name, pkg.version); 
