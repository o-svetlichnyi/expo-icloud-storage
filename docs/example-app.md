# Example App

The repository includes an Expo example app in the `example/` directory.

The example demonstrates:

- iCloud availability checks
- local test file creation
- iCloud directory creation
- upload
- download
- directory listing
- existence checks
- deletion
- upload and download progress listeners

## Run it

From the repository root:

```bash
npm install
npm run prepare
```

Then run the example:

```bash
cd example
npm install
npm run ios
```

The example is iOS-only. You need an iCloud-capable Apple Developer setup for the full flow.
