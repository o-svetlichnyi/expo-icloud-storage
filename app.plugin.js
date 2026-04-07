const {
  createRunOncePlugin,
  withEntitlementsPlist,
  withInfoPlist,
} = require("@expo/config-plugins");
const pkg = require("./package.json");

function addUnique(values, value) {
  return Array.from(new Set([...(Array.isArray(values) ? values : []), value]));
}

function resolveContainerIdentifier(config, containerIdentifier) {
  const bundleIdentifier = config.ios?.bundleIdentifier;

  if (!bundleIdentifier) {
    return containerIdentifier;
  }

  return containerIdentifier.replace("$(CFBundleIdentifier)", bundleIdentifier);
}

function getDefaultContainerIdentifier(config) {
  return config.ios?.bundleIdentifier
    ? `iCloud.${config.ios.bundleIdentifier}`
    : null;
}

function addContainerIdentifier(values, containerIdentifier, defaultContainerIdentifier) {
  const existing = Array.isArray(values) ? values : [];
  const filtered =
    defaultContainerIdentifier && defaultContainerIdentifier !== containerIdentifier
      ? existing.filter((value) => value !== defaultContainerIdentifier)
      : existing;

  return addUnique(filtered, containerIdentifier);
}

function withExpoIcloudStorage(config, _props = {}) {
  const {
    containerIdentifier = "iCloud.$(CFBundleIdentifier)",
    containerName = "$(PRODUCT_NAME)",
    isDocumentScopePublic = false,
    supportedFolderLevels = "Any",
    enableUsesIcloudStorage = true,
    configureUbiquitousContainers = true,
    configureEntitlements = true,
  } = _props ?? {};
  const resolvedContainerIdentifier = resolveContainerIdentifier(
    config,
    containerIdentifier,
  );
  const defaultContainerIdentifier = getDefaultContainerIdentifier(config);

  config.ios ??= {};
  if (enableUsesIcloudStorage && config.ios.usesIcloudStorage == null) {
    config.ios.usesIcloudStorage = true;
  }

  if (configureEntitlements) {
    config = withEntitlementsPlist(config, (config) => {
      config.modResults["com.apple.developer.icloud-container-identifiers"] =
        addContainerIdentifier(
          config.modResults["com.apple.developer.icloud-container-identifiers"],
          resolvedContainerIdentifier,
          defaultContainerIdentifier,
        );
      config.modResults["com.apple.developer.ubiquity-container-identifiers"] =
        addContainerIdentifier(
          config.modResults[
            "com.apple.developer.ubiquity-container-identifiers"
          ],
          resolvedContainerIdentifier,
          defaultContainerIdentifier,
        );
      config.modResults["com.apple.developer.icloud-services"] = addUnique(
        config.modResults["com.apple.developer.icloud-services"],
        "CloudDocuments",
      );
      return config;
    });
  }

  if (configureUbiquitousContainers) {
    config = withInfoPlist(config, (config) => {
      config.modResults.NSUbiquitousContainers ??= {};
      config.modResults.NSUbiquitousContainers[resolvedContainerIdentifier] ??=
        {
          NSUbiquitousContainerIsDocumentScopePublic: isDocumentScopePublic,
          NSUbiquitousContainerName: containerName,
          NSUbiquitousContainerSupportedFolderLevels: supportedFolderLevels,
        };
      return config;
    });
  }

  return config;
}

module.exports = createRunOncePlugin(withExpoIcloudStorage, pkg.name, pkg.version);
