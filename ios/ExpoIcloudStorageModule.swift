import ExpoModulesCore
import Foundation

public class ExpoIcloudStorageModule: Module {
    private func uploadFile(destinationPath: String, filePath: String, documentsURL: URL, progressCallback: @escaping (Double, Int64, String) -> Void, completionHandler: @escaping (Result<String, Error>) -> Void) {
        let filePathWithoutPrefix = filePath.replacingOccurrences(of: "file://", with: "")
        let fileURL = URL(fileURLWithPath: filePathWithoutPrefix)
        let fileManager = FileManager.default
        let destinationURL = documentsURL.appendingPathComponent(destinationPath)

        func processUploading(_ query: NSMetadataQuery, _ self: Any) {
            for i in 0 ..< query.resultCount {
                if let item = query.result(at: i) as? NSMetadataItem {
                    if let fileName = item.value(forAttribute: NSMetadataItemFSNameKey) as? String,
                       let percentUploaded = item.value(forAttribute: NSMetadataUbiquitousItemPercentUploadedKey) as? Double,
                       let fileSize = item.value(forAttribute: NSMetadataItemFSSizeKey) as? Int64 {
                        progressCallback(percentUploaded, fileSize, fileName)
                    }

                    if item.value(forAttribute: NSMetadataUbiquitousItemIsUploadedKey) is Bool {
                        // File is uploaded
                        if let uploadedFileURL = item.value(forAttribute: NSMetadataItemURLKey) as? URL {
                            query.stop()
                            query.disableUpdates()
                            NotificationCenter.default.removeObserver(self, name: .NSMetadataQueryDidStartGathering, object: query)
                            NotificationCenter.default.removeObserver(self, name: .NSMetadataQueryDidUpdate, object: query)
                            NotificationCenter.default.removeObserver(self, name: .NSMetadataQueryDidFinishGathering, object: query)
                            DispatchQueue.main.async {
                                completionHandler(.success(uploadedFileURL.path))
                            }
                        }
                    } else if let error = item.value(forAttribute: NSMetadataUbiquitousItemUploadingErrorKey) as? NSError {
                        print("Error uploading file: \(error)")
                        completionHandler(.failure(error))
                    }
                }
            }
        }

        let query = NSMetadataQuery()
        query.operationQueue = .main
        query.predicate = NSPredicate(format: "%K CONTAINS %@", NSMetadataItemFSNameKey, fileManager.displayName(atPath: destinationURL.path))
        query.searchScopes = [NSMetadataQueryUbiquitousDocumentsScope, NSMetadataQueryUbiquitousDataScope]

        NotificationCenter.default.addObserver(forName: .NSMetadataQueryDidStartGathering, object: query, queue: query.operationQueue) { [weak self] _ in
            processUploading(query, self as Any)
        }

        NotificationCenter.default.addObserver(forName: .NSMetadataQueryDidUpdate, object: query, queue: query.operationQueue) { [weak self] _ in
            processUploading(query, self as Any)
        }

        NotificationCenter.default.addObserver(forName: .NSMetadataQueryDidFinishGathering, object: query, queue: query.operationQueue) { [weak self] _ in
            processUploading(query, self as Any)
        }

        do {
            query.start()
            query.enableUpdates()
            let newFileName = UUID().uuidString // Generates a unique file name
            let fileDirectory = fileURL.deletingLastPathComponent()
            let temporaryFileURL = fileDirectory.appendingPathComponent(newFileName)

            try fileManager.copyItem(at: fileURL, to: temporaryFileURL)
            try fileManager.setUbiquitous(true, itemAt: temporaryFileURL, destinationURL: destinationURL)
            try fileManager.removeItem(at: temporaryFileURL)
        } catch {
            print("Error starting upload: \(error)")
        }
    }

    private func downloadFile(path: String, destinationDir: String, progressCallback: @escaping (Double, Int64, String) -> Void, completionHandler: @escaping (Result<String, Error>) -> Void) {
        let fileURL = URL(fileURLWithPath: path)
        let destinationDirURL = URL(fileURLWithPath: destinationDir)
        let fileManager = FileManager.default
        let destinationURL = destinationDirURL.appendingPathComponent(fileManager.displayName(atPath: fileURL.path))

        func copyAndFinish(sourceURL: URL) {
            do {
                if fileManager.fileExists(atPath: destinationURL.path) {
                    completionHandler(.success(destinationURL.path))
                    return
                }
                try fileManager.copyItem(at: sourceURL, to: destinationURL)
                completionHandler(.success(destinationURL.path))
            } catch {
                print("Error copying file: \(error)")
                completionHandler(.failure(error))
            }
        }

        func proccessDownloading(_ query: NSMetadataQuery, _ self: Any) {
            for i in 0 ..< query.resultCount {
                if let item = query.result(at: i) as? NSMetadataItem {
                    if let fileName = item.value(forAttribute: NSMetadataItemFSNameKey) as? String,
                       let percentDownloaded = item.value(forAttribute: NSMetadataUbiquitousItemPercentDownloadedKey) as? Double,
                       let fileSize = item.value(forAttribute: NSMetadataItemFSSizeKey) as? Int64 {
                        progressCallback(percentDownloaded, fileSize, fileName)
                    }

                    let downloadingStatus = item.value(forAttribute: NSMetadataUbiquitousItemDownloadingStatusKey) as? String
                    if downloadingStatus == NSMetadataUbiquitousItemDownloadingStatusCurrent {
                        // File is downloaded
                        if let downloadedFileURL = item.value(forAttribute: NSMetadataItemURLKey) as? URL {
                            query.stop()
                            NotificationCenter.default.removeObserver(self, name: .NSMetadataQueryDidStartGathering, object: query)
                            NotificationCenter.default.removeObserver(self, name: .NSMetadataQueryDidUpdate, object: query)
                            NotificationCenter.default.removeObserver(self, name: .NSMetadataQueryDidFinishGathering, object: query)
                            DispatchQueue.main.async {
                                copyAndFinish(sourceURL: downloadedFileURL)
                            }
                        }
                    } else if let error = item.value(forAttribute: NSMetadataUbiquitousItemDownloadingErrorKey) as? NSError {
                        print("Error downloading file: (error)")
                        completionHandler(.failure(error))
                    }
                }
            }
        }

        let query = NSMetadataQuery()
        query.operationQueue = .main
        query.predicate = NSPredicate(format: "%K CONTAINS %@", NSMetadataItemFSNameKey, fileManager.displayName(atPath: fileURL.path))
        query.searchScopes = [NSMetadataQueryUbiquitousDocumentsScope, NSMetadataQueryUbiquitousDataScope]

        NotificationCenter.default.addObserver(forName: .NSMetadataQueryDidStartGathering, object: query, queue: query.operationQueue) { [weak self] _ in
            proccessDownloading(query, self as Any)
        }

        NotificationCenter.default.addObserver(forName: .NSMetadataQueryDidUpdate, object: query, queue: query.operationQueue) { [weak self] _ in
            proccessDownloading(query, self as Any)
        }

        NotificationCenter.default.addObserver(forName: .NSMetadataQueryDidFinishGathering, object: query, queue: query.operationQueue) { [weak self] _ in
            proccessDownloading(query, self as Any)
        }

        do {
            query.start()
            query.enableUpdates()
            try fileManager.startDownloadingUbiquitousItem(at: fileURL)
        } catch {
            print("Error starting download: \(error)")
        }
    }

    private func handleDownloadProgress(_ progress: Double, _ fileSize: Int64, _ fileName: String, _ downloadProgressMap: inout [String: Int64], _ totalFilesSize: Int64, _ downloadedProgress: inout Int) {
        if totalFilesSize > 0, progress.isFinite {
            let fileProgress = Int64(Double(fileSize) / Double(totalFilesSize) * progress)
            downloadProgressMap[fileName] = fileProgress

            let totalProgress = downloadProgressMap.values.reduce(0, +)
            let overallProgress = Double(totalProgress).rounded()
            self.sendEvent("onDownloadFilesAsyncProgress", ["value": min(overallProgress, 100)])
        } else {
            print("Error: incorrect file size values")
        }
    }




    private func handleDownloadCompletion(_ result: Result<String, Error>, _ filesProcessed: inout Int, _ totalFiles: Int, _ results: inout [Result<String, Error>], _ promise: Promise) {
        results.append(result)
        filesProcessed += 1
        if filesProcessed == totalFiles {
            let finalResults = results.map { result -> [String: Any] in
                switch result {
                case let .success(destinationPath):
                    self.sendEvent("onDownloadFilesAsyncProgress", ["value": 100])
                    return ["success": true, "path": destinationPath]
                case let .failure(error):
                    return ["success": false, "error": error.localizedDescription]
                }
            }
            promise.resolve(finalResults)
        }
    }

    private func fetchTotalFilesSize(paths: [String], completionHandler: @escaping (Result<(Int64, [String: Int64]), Error>) -> Void) {
        let fileManager = FileManager.default
        let query = NSMetadataQuery()
        query.operationQueue = .main
        query.searchScopes = [NSMetadataQueryUbiquitousDocumentsScope]

        let orPredicate = NSCompoundPredicate(orPredicateWithSubpredicates: paths.map { path in
            let fileURL = URL(fileURLWithPath: path)
            return NSPredicate(format: "%K CONTAINS %@", NSMetadataItemFSNameKey, fileManager.displayName(atPath: fileURL.path))
        })

        query.predicate = orPredicate

        NotificationCenter.default.addObserver(forName: .NSMetadataQueryDidFinishGathering, object: query, queue: query.operationQueue) { [weak self] _ in
            var totalFilesSize: Int64 = 0
            var filesSizeMap: [String: Int64] = [:]

            for i in 0 ..< query.resultCount {
                if let item = query.result(at: i) as? NSMetadataItem,
                   let fileName = item.value(forAttribute: NSMetadataItemFSNameKey) as? String,
                   let fileSize = item.value(forAttribute: NSMetadataItemFSSizeKey) as? Int64 {
                    let downloadingStatus = item.value(forAttribute: NSMetadataUbiquitousItemDownloadingStatusKey) as? String
                    if downloadingStatus != NSMetadataUbiquitousItemDownloadingStatusCurrent {
                        totalFilesSize += fileSize
                        filesSizeMap[fileName] = fileSize
                    }
                }
                if i == query.resultCount - 1 {
                    query.stop()
                    NotificationCenter.default.removeObserver(self as Any, name: .NSMetadataQueryDidFinishGathering, object: query)
                    completionHandler(.success((totalFilesSize, filesSizeMap)))
                }
            }
        }

        query.start()
        query.enableUpdates()
    }

    public func definition() -> ModuleDefinition {
        Name("ExpoIcloudStorage")
        Events("onUploadFilesAsyncProgress", "onDownloadFilesAsyncProgress")
        Constants([
            "defaultICloudContainerPath": FileManager.default.url(forUbiquityContainerIdentifier: nil)?.path ?? nil,
        ])

        Function("getDefaultPathAsync") {
            FileManager.default.url(forUbiquityContainerIdentifier: nil)?.path ?? nil
        }

        AsyncFunction("isICloudAvailableAsync") { (promise: Promise) in
            let isICloudAvailable = FileManager.default.ubiquityIdentityToken != nil
            promise.resolve(isICloudAvailable)
        }

        AsyncFunction("isExistAsync") { (path: String, isDirectory: Bool, promise: Promise) in
            guard let documentsURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
                promise.reject(NSError(domain: "expo-icloud-storage", code: 0, userInfo: [NSLocalizedDescriptionKey: "iCloud documents directory not found"]))
                return
            }
            let fileURL = documentsURL.appendingPathComponent(path, isDirectory: isDirectory)
            promise.resolve(FileManager.default.fileExists(atPath: fileURL.path))
        }

        AsyncFunction("createDirAsync") { (path: String, promise: Promise) in
            guard let documentsURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
                promise.reject(NSError(domain: "expo-icloud-storage", code: 0, userInfo: [NSLocalizedDescriptionKey: "iCloud documents directory not found"]))
                return
            }

            let directoryURL = documentsURL.appendingPathComponent(path, isDirectory: true)

            do {
                try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true, attributes: nil)
                promise.resolve(true)
            } catch let error as NSError {
                print("Error creating directory: \(error.localizedDescription)")
                promise.reject(error)
            }
        }

        AsyncFunction("unlinkAsync") { (path: String, promise: Promise) in
            let fileURL = URL(fileURLWithPath: path)

            guard let iCloudContainer = FileManager.default.url(forUbiquityContainerIdentifier: nil),
                  let iCloudDocumentsURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents"),
                  fileURL.path.hasPrefix(iCloudContainer.path) else {
                promise.reject(NSError(domain: "expo-icloud-storage", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid iCloud path"]))
                return
            }

            do {
                try FileManager.default.removeItem(at: fileURL)
                promise.resolve(true)
            } catch let error as NSError {
                print("Error removing item: \(error.localizedDescription)")
                promise.reject(error)
            }
        }

        AsyncFunction("readDirAsync") { (path: String, options: [String: Bool], promise: Promise) in

            guard let documentsURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
                promise.reject(NSError(domain: "expo-icloud-storage", code: 0, userInfo: [NSLocalizedDescriptionKey: "iCloud documents directory not found"]))
                return
            }
            let directoryURL = documentsURL.appendingPathComponent(path, isDirectory: true)
            guard let contents = try? FileManager.default.contentsOfDirectory(at: directoryURL, includingPropertiesForKeys: nil) else {
                promise.resolve([])
                return
            }

            let isFullPath = options["isFullPath"] ?? true
            print(isFullPath)
            if isFullPath {
                let fullPaths = contents.map { $0.path }
                promise.resolve(fullPaths)
            } else {
                let fileNames = contents.map { $0.lastPathComponent }
                promise.resolve(fileNames)
            }
        }

        AsyncFunction("downloadFileAsync") { (path: String, destinationDir: String, promise: Promise) in
            guard (FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents")) != nil else {
                promise.reject(NSError(domain: "expo-icloud-storage", code: 0, userInfo: [NSLocalizedDescriptionKey: "iCloud documents directory not found"]))
                return
            }

            downloadFile(path: path, destinationDir: destinationDir, progressCallback: { progress, _, _ in
                self.sendEvent("onDownloadFilesAsyncProgress", ["value": Double(progress).rounded()])
            }, completionHandler: { result in
                switch result {
                case let .success(destinationPath):
                    promise.resolve(destinationPath)
                case let .failure(error):
                    promise.reject(error)
                }
            })
        }

        AsyncFunction("downloadFilesAsync") { (paths: [String], destinationDir: String, promise: Promise) in
            guard let documentsURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
                promise.reject(NSError(domain: "expo-icloud-storage", code: 0, userInfo: [NSLocalizedDescriptionKey: "iCloud documents directory not found"]))
                return
            }
            self.sendEvent("onDownloadFilesAsyncProgress", ["value": 0])

            self.fetchTotalFilesSize(paths: paths, completionHandler: { result in
                switch result {
                case let .success((totalFilesSize, _)):
                    var downloadProgressMap: [String: Int64] = [:]
                    var downloadedProgress = 0
                    var filesProcessed = 0
                    var results: [Result<String, Error>] = []

                    if totalFilesSize == 0 {
                                    self.sendEvent("onDownloadFilesAsyncProgress", ["value": 100])
                                    promise.resolve([])
                                    return
                                }

                    for path in paths {
                        let progressCallback: (Double, Int64, String) -> Void = { progress, fileSize, fileName in
                            self.handleDownloadProgress(progress, fileSize, fileName, &downloadProgressMap, totalFilesSize, &downloadedProgress)
                        }

                        let completionHandler: (Result<String, Error>) -> Void = { result in
                            self.handleDownloadCompletion(result, &filesProcessed, paths.count, &results, promise)
                        }

                        self.downloadFile(path: path, destinationDir: destinationDir, progressCallback: progressCallback, completionHandler: completionHandler)
                    }
                case let .failure(error):
                    promise.reject(NSError(domain: "expo-icloud-storage", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to fetch file sizes: \(error.localizedDescription)"]))
                }
            })
        }



        AsyncFunction("uploadFileAsync") { (destinationPath: String, filePath: String, promise: Promise) in
            guard let documentsURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
                promise.reject(NSError(domain: "expo-icloud-storage", code: 0, userInfo: [NSLocalizedDescriptionKey: "iCloud documents directory not found"]))
                return
            }
            self.sendEvent("onUploadFilesAsyncProgress", ["value": 0])
            uploadFile(destinationPath: destinationPath, filePath: filePath, documentsURL: documentsURL, progressCallback: { progress, _, _ in
                self.sendEvent("onUploadFilesAsyncProgress", ["value": Double(progress).rounded()])
            }, completionHandler: { result in
                switch result {
                case let .success(destinationPath):
                    self.sendEvent("onUploadFilesAsyncProgress", ["value": 100])
                    promise.resolve(destinationPath)
                case let .failure(error):
                    promise.reject(error)
                }
            })
        }

        AsyncFunction("uploadFilesAsync") { (destinationDirectory: String, filePaths: [String], promise: Promise) in
            guard let documentsURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") else {
                promise.reject(NSError(domain: "expo-icloud-storage", code: 0, userInfo: [NSLocalizedDescriptionKey: "iCloud documents directory not found"]))
                return
            }
            let totalFiles = filePaths.count
            var filesProcessed = 0
            var results: [Result<String, Error>] = []
            var totalSize: Int64 = 0
            let fileManager = FileManager.default

            let dispatchGroup = DispatchGroup()

            for filePath in filePaths {
                dispatchGroup.enter()
                let filePathWithoutPrefix = filePath.replacingOccurrences(of: "file://", with: "")
                let fileURL = URL(fileURLWithPath: filePathWithoutPrefix)
                DispatchQueue.global().async {
                    do {
                        let attributes = try fileManager.attributesOfItem(atPath: fileURL.path)
                        if let fileSize = attributes[.size] as? Int64 {
                            totalSize += fileSize
                        }
                    } catch {
                        print("Error getting file size: \(error)")
                    }
                    dispatchGroup.leave()
                }
            }
            dispatchGroup.notify(queue: .main) {
                var uploadedProgress: Int = 0
                self.sendEvent("onUploadFilesAsyncProgress", ["value": 0])
                for (_, filePath) in filePaths.enumerated() {
                    let filePathWithoutPrefix = filePath.replacingOccurrences(of: "file://", with: "")
                    let fileURL = URL(fileURLWithPath: filePathWithoutPrefix)
                    let destinationPath = destinationDirectory + "/" + fileURL.lastPathComponent

                    self.uploadFile(destinationPath: destinationPath, filePath: filePath, documentsURL: documentsURL, progressCallback: { progress, fileSize, _ in
                        if totalSize != 0 {
                            let relativeToTotalProgress = Int(Double(fileSize) / Double(totalSize) * progress)

                            let overallProgress = Double(relativeToTotalProgress + uploadedProgress).rounded()
                            self.sendEvent("onUploadFilesAsyncProgress", ["value": overallProgress])
                            if progress == 100 {
                                uploadedProgress += relativeToTotalProgress
                            }
                        }
                    }, completionHandler: { result in
                        filesProcessed += 1
                        results.append(result)

                        if filesProcessed == totalFiles {
                            promise.resolve(results.map { result -> [String: Any] in
                                switch result {
                                case let .success(destinationPath):
                                    self.sendEvent("onUploadFilesAsyncProgress", ["value": 100])
                                    return ["success": true, "path": destinationPath]
                                case let .failure(error):
                                    return ["success": false, "error": error.localizedDescription]
                                }
                            })
                        }
                    })
                }
            }
        }
    }
}

