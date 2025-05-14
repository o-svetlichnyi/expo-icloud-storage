const { createRunOncePlugin } = require("@expo/config-plugins");
const pkg = require("./package.json");

function withExpoIcloudStorage(config, _props = {}) {
  // Props like appleTeamId can be passed from app.json if needed.
  // Example: const { appleTeamId } = _props;

  // Entitlements (usesIcloudStorage, NSUbiquitousContainers)
  // are primarily configured in the app.json's ios section.
  // This plugin ensures the module is recognized by Expo's plugin system
  // and can be a place for more complex native modifications if required in the future.
  // For now, it doesn't need to modify much if app.json is correctly set up.
  return config;
}

module.exports = createRunOncePlugin(withExpoIcloudStorage, pkg.name, pkg.version); 