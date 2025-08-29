import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  openDirectory: () => ipcRenderer.invoke('open-directory'),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  createFile: (args: { directoryPath: string; fileName: string }) => ipcRenderer.invoke('create-file', args),
  saveFile: (args: { filePath: string; content: string }) => ipcRenderer.invoke('save-file', args),
  deleteFile: (args: { vaultPath: string; filePath: string }) => ipcRenderer.invoke('delete-file', args),
  // --- Add the new getGraphData function to the API bridge ---
  getGraphData: (vaultPath: string) => ipcRenderer.invoke('get-graph-data', vaultPath),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
