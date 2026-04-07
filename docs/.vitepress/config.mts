import { defineConfig } from "vitepress";
import type { HeadConfig, TransformContext } from "vitepress";

const base = "/expo-icloud-storage/";
const siteUrl = "https://o-svetlichnyi.github.io";
const siteBaseUrl = `${siteUrl}${base}`;
const siteDescription =
  "Typed iCloud Drive file operations for Expo iOS apps. Upload, download, list, delete, and track progress in an app iCloud container.";
const siteKeywords =
  "expo, react-native, ios, icloud, icloud-drive, expo-module, file-system, file-upload, file-download, cloud-storage, ios-storage, backup";

function pageToCanonicalUrl(page: string): string {
  const path = page
    .replace(/(^|\/)index\.md$/, "$1")
    .replace(/\.md$/, "");

  return new URL(path, siteBaseUrl).toString();
}

function createPageHead(context: TransformContext): HeadConfig[] {
  const canonicalUrl = pageToCanonicalUrl(context.page);
  const title = context.title.includes("Expo iCloud Storage")
    ? context.title
    : `${context.title} | Expo iCloud Storage`;
  const description = context.description || siteDescription;

  return [
    ["link", { rel: "canonical", href: canonicalUrl }],
    ["meta", { property: "og:url", content: canonicalUrl }],
    ["meta", { property: "og:title", content: title }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { name: "twitter:title", content: title }],
    ["meta", { name: "twitter:description", content: description }],
  ];
}

export default defineConfig({
  title: "Expo iCloud Storage",
  description: siteDescription,
  base,
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: siteBaseUrl,
  },
  head: [
    ["link", { rel: "icon", type: "image/webp", href: `${base}logo.webp` }],
    [
      "link",
      { rel: "sitemap", type: "application/xml", href: `${base}sitemap.xml` },
    ],
    [
      "link",
      {
        rel: "alternate",
        type: "text/markdown",
        title: "LLM documentation",
        href: `${base}llms.txt`,
      },
    ],
    ["meta", { name: "author", content: "Oleg Svetlichnyi" }],
    [
      "meta",
      {
        name: "keywords",
        content: siteKeywords,
      },
    ],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:image", content: `${siteBaseUrl}logo.webp` }],
    ["meta", { name: "twitter:card", content: "summary" }],
    ["meta", { name: "twitter:image", content: `${siteBaseUrl}logo.webp` }],
  ],
  transformHead: createPageHead,
  themeConfig: {
    logo: "/logo.webp",
    search: {
      provider: "local",
    },
    nav: [
      { text: "Get Started", link: "/getting-started" },
      { text: "Quick Start", link: "/quick-start" },
      { text: "API", link: "/api" },
      { text: "Compatibility", link: "/compatibility" },
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
          { text: "Quick Start", link: "/quick-start" },
          { text: "API Reference", link: "/api" },
          { text: "Expo Config Plugin", link: "/config-plugin" },
          { text: "Compatibility", link: "/compatibility" },
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
