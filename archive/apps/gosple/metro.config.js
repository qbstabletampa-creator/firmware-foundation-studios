const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Monorepo resolution: node_modules is hoisted to archive/ (the workspace root),
// so metro must watch it and resolve from there. Without this the Expo Go dev
// server fails with "Unable to resolve module ./node_modules/expo-router/entry".
const monorepoRoot = path.resolve(__dirname, '../..');
const config = getDefaultConfig(__dirname);

config.watchFolders = [...(config.watchFolders ?? []), monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
