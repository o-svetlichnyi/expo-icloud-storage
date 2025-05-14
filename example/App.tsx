import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Alert, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import {
  defaultICloudContainerPath,
  isICloudAvailableAsync,
  createDirAsync,
  isExistAsync,
  readDirAsync,
  uploadFileAsync,
  unlinkAsync,
  downloadFileAsync,
  PathUtils,
  addUploadFilesAsyncProgressListener,
  addDownloadFilesAsyncProgressListener,
  IProgressEventPayload,
} from '@oleg_svetlichnyi/expo-icloud-storage';

export default function App() {
  const [isICloudAvailable, setIsICloudAvailable] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState<string>('testDir/testFile.txt');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [dirContents, setDirContents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [lastOperation, setLastOperation] = useState<{action: string, status: 'success' | 'error' | 'in-progress', message: string} | null>(null);
  const [showUploadProgress, setShowUploadProgress] = useState<boolean>(false);
  const [showDownloadProgress, setShowDownloadProgress] = useState<boolean>(false);

  const localDocDir = FileSystem.documentDirectory;
  const localTestFilePath = () => `${localDocDir}localTestFile.txt`;
  const icloudDocumentsPath = defaultICloudContainerPath ? `${defaultICloudContainerPath}/Documents` : null;

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await isICloudAvailableAsync();
        setIsICloudAvailable(available);
        setStatusMessage(available ? 'iCloud Status: Available' : 'iCloud Status: Not Available');
      } catch (e: any) {
        setStatusMessage('iCloud Status: Error');
        setIsICloudAvailable(false);
      }
    };
    checkAvailability();

    const uploadListener = addUploadFilesAsyncProgressListener((event: IProgressEventPayload) => {
      setUploadProgress(event.value);
      setShowUploadProgress(true);
    });
    const downloadListener = addDownloadFilesAsyncProgressListener((event: IProgressEventPayload) => {
      setDownloadProgress(event.value);
      setShowDownloadProgress(true);
    });

    return () => {
      uploadListener.remove();
      downloadListener.remove();
    };
  }, []);

  const startLoading = (action: string) => {
    setIsLoading(prev => ({...prev, [action]: true}));
  };

  const stopLoading = (action: string) => {
    setIsLoading(prev => ({...prev, [action]: false}));
  };

  const setOperation = (action: string, status: 'success' | 'error' | 'in-progress', message: string) => {
    setLastOperation({action, status, message});
  };

  const handleError = (action: string, error: any) => {
    const message = `Error: ${error.message || JSON.stringify(error)}`;
    console.error(message, error);
    setStatusMessage(message);
    setOperation(action, 'error', message);
    stopLoading(action);
    
    // Make sure any progress indicators are hidden
    if (action === 'uploadFile') {
      setUploadProgress(0);
      setShowUploadProgress(false);
    } else if (action === 'downloadFile') {
      setDownloadProgress(0);
      setShowDownloadProgress(false);
    }
    
    Alert.alert('Error', message);
  };

  const handleCreateTestFile = async () => {
    const action = 'createLocalFile';
    startLoading(action);
    setOperation(action, 'in-progress', 'Creating local test file...');
    try {
      await FileSystem.writeAsStringAsync(localTestFilePath(), `Hello from local file! Timestamp: ${Date.now()}`);
      const successMsg = `Local file created at: ${localTestFilePath().split('/').pop()}`;
      setStatusMessage(successMsg);
      setOperation(action, 'success', successMsg);
    } catch (e) {
      handleError(action, e);
    } finally {
      stopLoading(action);
    }
  };

  const handleCreateDir = async () => {
    const action = 'createDir';
    if (!isICloudAvailable || !icloudDocumentsPath) {
      setStatusMessage('iCloud not available');
      return;
    }
    startLoading(action);
    setOperation(action, 'in-progress', 'Creating directory...');
    
    const dirPath = PathUtils.ext(inputValue) ? PathUtils.iCloudRemoveDotExt(inputValue).split('/').slice(0, -1).join('/') : inputValue;
    if (!dirPath) {
      setStatusMessage('Cannot determine directory path from input.');
      setOperation(action, 'error', 'Cannot determine directory path from input.');
      stopLoading(action);
      return;
    }
    try {
      await createDirAsync(dirPath);
      const successMsg = `Directory created: ${dirPath}`;
      setStatusMessage(successMsg);
      setOperation(action, 'success', successMsg);
    } catch (e) {
      handleError(action, e);
    } finally {
      stopLoading(action);
    }
  };

  const handleUploadFile = async () => {
    const action = 'uploadFile';
    if (!isICloudAvailable || !icloudDocumentsPath) {
      setStatusMessage('iCloud not available');
      return;
    }
    startLoading(action);
    setOperation(action, 'in-progress', 'Uploading file...');
    setUploadProgress(0);
    setShowUploadProgress(true);
    
    if (!(await FileSystem.getInfoAsync(localTestFilePath())).exists) {
      await handleCreateTestFile();
    }
    
    const destination = inputValue || 'uploadedFromExample.txt';
    try {      
      // Now proceed with the upload
      await uploadFileAsync({ filePath: localTestFilePath(), destinationPath: destination });
      const successMsg = `File uploaded to: ${destination}`;
      setStatusMessage(successMsg);
      setOperation(action, 'success', successMsg);
      setUploadProgress(100);
           
    } catch (e) {
      handleError(action, e);
    } finally {
      stopLoading(action);
      setTimeout(() => {
        setShowUploadProgress(false);
      }, 2000);
    }
  };

  const handleReadDir = async () => {
    const action = 'readDir';
    if (!isICloudAvailable || !icloudDocumentsPath) {
      setStatusMessage('iCloud not available');
      return;
    }
    startLoading(action);
    setOperation(action, 'in-progress', 'Reading directory contents...');
    
    const dirPath = inputValue.includes('/') ? inputValue.substring(0, inputValue.lastIndexOf('/')) : '';
    try {
      const contents = await readDirAsync(dirPath, { isFullPath: false });
      setDirContents(contents);
      const successMsg = contents.length > 0 ? 
        `Found ${contents.length} items in directory` : 
        `Directory is empty`;
      setStatusMessage(successMsg);
      setOperation(action, 'success', successMsg);
    } catch (e) {
      handleError(action, e);
      setDirContents([]);
    } finally {
      stopLoading(action);
    }
  };

  const handleIsExist = async () => {
    const action = 'isExist';
    if (!isICloudAvailable || !icloudDocumentsPath) {
      setStatusMessage('iCloud not available');
      return;
    }
    startLoading(action);
    setOperation(action, 'in-progress', 'Checking if file exists...');
    
    const pathToCheck = inputValue;
    const isDir = !PathUtils.ext(pathToCheck);
    try {
      const exists = await isExistAsync(pathToCheck, isDir);
      const successMsg = exists ? 
        `${pathToCheck} exists` : 
        `${pathToCheck} does not exist`;
      setStatusMessage(successMsg);
      setOperation(action, 'success', successMsg);
    } catch (e) {
      handleError(action, e);
    } finally {
      stopLoading(action);
    }
  };

  const handleDownloadFile = async () => {
    const action = 'downloadFile';
    if (!isICloudAvailable || !icloudDocumentsPath) {
      setStatusMessage('iCloud not available');
      return;
    }
    startLoading(action);
    setOperation(action, 'in-progress', 'Downloading file...');
    setDownloadProgress(0);
    setShowDownloadProgress(true);
    
    const icloudFilePath = `${icloudDocumentsPath}/${inputValue}`;
    const localDestinationDir = `${localDocDir}downloads/`;
    try {
      await FileSystem.makeDirectoryAsync(localDestinationDir, { intermediates: true });
      const downloadedTo = await downloadFileAsync(icloudFilePath, localDestinationDir);
      const fileName = downloadedTo.split('/').pop();
      const successMsg = `Downloaded to: ${fileName}`;
      setStatusMessage(successMsg);
      setOperation(action, 'success', successMsg);
      // Ensure we show 100% even if the event listener didn't catch the final progress
      setDownloadProgress(100);
      
    } catch (e) {
      // Explicitly handle file not found errors with a specific message
      if ((e as any).message?.includes('does not exist')) {
        const errorMsg = `File not found: ${inputValue}`;
        setStatusMessage(errorMsg);
        setOperation(action, 'error', errorMsg);
        setDownloadProgress(0);
        Alert.alert('File Not Found', `The file "${inputValue}" does not exist in iCloud.`);
      } else {
        // Handle other errors
        handleError(action, e);
      }
    } finally {
      stopLoading(action);
      setTimeout(() => {
        setShowDownloadProgress(false);
      }, 2000);
    }
  };

  const handleUnlink = async () => {
    const action = 'deleteFile';
    if (!isICloudAvailable || !icloudDocumentsPath) {
      setStatusMessage('iCloud not available');
      return;
    }
    startLoading(action);
    setOperation(action, 'in-progress', 'Deleting file...');
    
    const pathToDelete = `${icloudDocumentsPath}/${inputValue}`;
    try {
      await unlinkAsync(pathToDelete);
      const successMsg = `Deleted: ${inputValue}`;
      setStatusMessage(successMsg);
      setOperation(action, 'success', successMsg);
    } catch (e) {
      handleError(action, e);
    } finally {
      stopLoading(action);
    }
  };

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Expo iCloud Storage Example</Text>
        <Text style={styles.status}>This module is iOS only.</Text>
      </View>
    );
  }

  const renderStatusBadge = () => {
    if (!lastOperation) return null;
    
    const badgeStyle = [
      styles.statusBadge,
      lastOperation.status === 'success' ? styles.successBadge : 
      lastOperation.status === 'error' ? styles.errorBadge : 
      styles.inProgressBadge
    ];
    
    const textStyle = [
      styles.statusBadgeText,
      lastOperation.status === 'success' ? styles.successText : 
      lastOperation.status === 'error' ? styles.errorText : 
      styles.inProgressText
    ];
    
    return (
      <View style={styles.statusBadgeContainer}>
        <View style={badgeStyle}>
          <Text style={textStyle}>{lastOperation.action}</Text>
        </View>
        <Text style={styles.statusBadgeMessage}>{lastOperation.message}</Text>
      </View>
    );
  };

  const renderProgressIndicator = (progress: number, isVisible: boolean, type: string) => {
    if (!isVisible) return null;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelContainer}>
          <Text style={styles.progressLabel}>{type}</Text>
          <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, {width: `${progress}%`}]} />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Expo iCloud Storage Example</Text>
        <StatusBar style="auto" />

        <Text style={styles.status}>
          iCloud Status: {isICloudAvailable === null ? 'Checking...' : isICloudAvailable ? 'Available' : 'Not Available'}
        </Text>
        
        {renderStatusBadge()}
        
        <TextInput
          style={styles.input}
          onChangeText={setInputValue}
          value={inputValue}
          placeholder="Enter path relative to iCloud Documents"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, isLoading['createLocalFile'] && styles.buttonInProgress]} 
            onPress={handleCreateTestFile}
            disabled={isLoading['createLocalFile']}
          >
            {isLoading['createLocalFile'] ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Create Local File</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.button, 
              !isICloudAvailable && styles.buttonDisabled,
              isLoading['createDir'] && styles.buttonInProgress
            ]} 
            onPress={handleCreateDir}
            disabled={!isICloudAvailable || isLoading['createDir']}
          >
            {isLoading['createDir'] ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.buttonText, !isICloudAvailable && styles.buttonTextDisabled]}>Create Dir (iCloud)</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.buttonFull, 
            !isICloudAvailable && styles.buttonDisabled,
            isLoading['uploadFile'] && styles.buttonInProgress
          ]} 
          onPress={handleUploadFile}
          disabled={!isICloudAvailable || isLoading['uploadFile']}
        >
          {isLoading['uploadFile'] ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.buttonText, !isICloudAvailable && styles.buttonTextDisabled]}>Upload File (iCloud)</Text>
          )}
        </TouchableOpacity>
        
        {renderProgressIndicator(uploadProgress, showUploadProgress, 'Upload Progress')}

        <TouchableOpacity 
          style={[
            styles.buttonFull, 
            !isICloudAvailable && styles.buttonDisabled,
            isLoading['downloadFile'] && styles.buttonInProgress
          ]} 
          onPress={handleDownloadFile}
          disabled={!isICloudAvailable || isLoading['downloadFile']}
        >
          {isLoading['downloadFile'] ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.buttonText, !isICloudAvailable && styles.buttonTextDisabled]}>Download File (iCloud)</Text>
          )}
        </TouchableOpacity>
        
        {renderProgressIndicator(downloadProgress, showDownloadProgress, 'Download Progress')}

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[
              styles.button, 
              !isICloudAvailable && styles.buttonDisabled,
              isLoading['readDir'] && styles.buttonInProgress
            ]} 
            onPress={handleReadDir}
            disabled={!isICloudAvailable || isLoading['readDir']}
          >
            {isLoading['readDir'] ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.buttonText, !isICloudAvailable && styles.buttonTextDisabled]}>List Dir (iCloud)</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.button, 
              !isICloudAvailable && styles.buttonDisabled,
              isLoading['isExist'] && styles.buttonInProgress
            ]} 
            onPress={handleIsExist}
            disabled={!isICloudAvailable || isLoading['isExist']}
          >
            {isLoading['isExist'] ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.buttonText, !isICloudAvailable && styles.buttonTextDisabled]}>Is Exist? (iCloud)</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.buttonFull, 
            styles.deleteButton, 
            !isICloudAvailable && styles.buttonDisabled,
            isLoading['deleteFile'] && styles.buttonInProgress
          ]} 
          onPress={handleUnlink}
          disabled={!isICloudAvailable || isLoading['deleteFile']}
        >
          {isLoading['deleteFile'] ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.buttonText, styles.deleteButtonText, !isICloudAvailable && styles.buttonTextDisabled]}>Delete (iCloud)</Text>
          )}
        </TouchableOpacity>
        
        {dirContents.length > 0 && (
          <View style={styles.dirContentsContainer}>
            <Text style={styles.dirContentsTitle}>Directory Contents:</Text>
            <Text style={styles.dirContentsSubtitle}>
              {inputValue.includes('/') ? 
                `iCloud Documents/${inputValue.substring(0, inputValue.lastIndexOf('/'))}` : 
                'iCloud Documents (root)'}
            </Text>
            {dirContents.map((item, index) => (
              <View key={index} style={styles.dirContentsItem}>
                <Text style={styles.dirContentsItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  status: {
    fontSize: 18,
    marginVertical: 8,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
  statusMessageContainer: {
    marginVertical: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  statusMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    padding: 12,
  },
  statusBadgeContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 5,
  },
  successBadge: {
    backgroundColor: '#e7f6e7',
  },
  errorBadge: {
    backgroundColor: '#fde7e7',
  },
  inProgressBadge: {
    backgroundColor: '#e7f0fd',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  successText: {
    color: '#1d8f1d',
  },
  errorText: {
    color: '#d32f2f',
  },
  inProgressText: {
    color: '#1976d2',
  },
  statusBadgeMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#d1d1d6',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  button: {
    flex: 0.48,
    backgroundColor: '#007aff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
  },
  buttonFull: {
    width: '100%',
    backgroundColor: '#007aff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
    height: 45,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a2a2a7',
  },
  buttonInProgress: {
    backgroundColor: '#5294e0',
  },
  buttonTextDisabled: {
    color: '#e0e0e0',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    marginTop: 5,
  },
  deleteButtonText: {
    color: 'white',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007aff',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34c759',
    borderRadius: 4,
  },
  dirContentsContainer: {
    marginTop: 25,
    width: '100%',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dirContentsTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
    color: '#000',
  },
  dirContentsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  dirContentsItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dirContentsItemText: {
    fontSize: 16,
    color: '#333',
  }
});
