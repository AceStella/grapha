import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  openDirectory: () => ipcRenderer.invoke('open-directory'),
  // Correctly pass the filePath argument to the main process
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  createFile: (args: { directoryPath: string; fileName: string }) => ipcRenderer.invoke('create-file', args),
  saveFile: (args: { filePath: string; content: string }) => ipcRenderer.invoke('save-file', args),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
