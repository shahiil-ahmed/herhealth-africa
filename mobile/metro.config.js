// metro.config.js
// Expo SDK 51 — React Navigation + Firebase compatible Metro configuration
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// ─── Resolver ─────────────────────────────────────────────────────────────────
// Ensure Metro resolves the "react-native" export condition for packages
// like firebase/auth that ship separate browser and RN builds.
// Without this, Metro picks the "browser" build which uses URL, IndexedDB,
// and other web-only APIs that crash on Hermes.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'react-native',
  'require',
  'default',
];

// ─── Source extensions ────────────────────────────────────────────────────────
// Ensure .cjs files (used by some Firebase sub-packages) are resolved
const { sourceExts, assetExts } = config.resolver;
config.resolver.sourceExts = [...sourceExts, 'cjs', 'mjs'];

module.exports = config;
