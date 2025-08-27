import { contextBridge, ipcRenderer } from 'electron'

// Define the API we want to expose to the renderer process
const electronAPI = {
  openDirectory: () => ipcRenderer.invoke('open-directory'),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file'),
}

// Expose the API to the window object under the 'electronAPI' key
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// For TypeScript to recognize the new API on the window object
export type ElectronAPI = typeof electronAPI
