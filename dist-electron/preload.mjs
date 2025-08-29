"use strict";
const electron = require("electron");
const electronAPI = {
  openDirectory: () => electron.ipcRenderer.invoke("open-directory"),
  readFile: (filePath) => electron.ipcRenderer.invoke("read-file", filePath),
  createFile: (args) => electron.ipcRenderer.invoke("create-file", args),
  saveFile: (args) => electron.ipcRenderer.invoke("save-file", args),
  deleteFile: (args) => electron.ipcRenderer.invoke("delete-file", args)
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
