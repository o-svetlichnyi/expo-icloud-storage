import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Expo iCloud Storage",
  description:
    "Typed iCloud Drive file API for Expo iOS apps. Upload, download, list, delete, and build backup flows.",
  base: "/expo-icloud-storage/",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    [
      "meta",
      {
        name: "keywords",
        content:
          "expo, react-native, ios, icloud, icloud-drive, expo-module, file-system, backup",
      },
    ],
    ["meta", { property: "og:title", content: "Expo iCloud Storage" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Typed iCloud Drive file API for Expo iOS apps. Upload, download, list, delete, and build backup flows.",
      },
    ],
  ],
  themeConfig: {
    logo: "/logo.svg",
    search: {
      provider: "local",
    },
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "API", link: "/api" },
      { text: "Recipes", link: "/recipes/sqlite-backup" },
      {
        text: "npm",
        link: "https://www.npmjs.com/package/@oleg_svetlichnyi/expo-icloud-storage",
      },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/getting-started" },
          { text: "Expo Config Plugin", link: "/config-plugin" },
          { text: "Quick Start", link: "/quick-start" },
          { text: "API Reference", link: "/api" },
          { text: "Troubleshooting", link: "/troubleshooting" },
          { text: "Example App", link: "/example-app" },
        ],
      },
      {
        text: "Recipes",
        items: [
          { text: "SQLite Backup", link: "/recipes/sqlite-backup" },
          { text: "Realm Backup", link: "/recipes/realm-backup" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/o-svetlichnyi/expo-icloud-storage",
      },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present Oleg Svetlichnyi",
    },
  },
});
