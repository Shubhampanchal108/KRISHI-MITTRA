// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package.json "exports" field resolution so subpath imports
// like @google/genai/web work correctly in Metro.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
