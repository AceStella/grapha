"use strict";
const electron = require("electron");
const electronAPI = {
  openDirectory: () => electron.ipcRenderer.invoke("open-directory"),
  readFile: (filePath) => electron.ipcRenderer.invoke("read-file")
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
