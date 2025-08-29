import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import fs from 'fs-extra'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

async function readDirectory(directoryPath: string): Promise<any[]> {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        return {
          name: entry.name,
          path: fullPath,
          children: await readDirectory(fullPath),
        };
      }
      if (entry.name.endsWith('.md')) {
        return {
          name: entry.name,
          path: fullPath,
        };
      }
      return null;
    })
  );
  return files.filter(file => file !== null) as any[];
}

ipcMain.handle('open-directory', async () => {
  if (!win) {
    return null;
  }
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });

  if (canceled || filePaths.length === 0) {
    return null;
  }

  const dirPath = filePaths[0];
  const tree = await readDirectory(dirPath);
  return { path: dirPath, tree };
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    return null;
  }
});

// --- Start: Add create-file handler ---
ipcMain.handle('create-file', async (_, { directoryPath, fileName }) => {
  if (!fileName.endsWith('.md')) {
    fileName += '.md';
  }
  const filePath = path.join(directoryPath, fileName);

  try {
    await fs.ensureFile(filePath);
    const newTree = await readDirectory(directoryPath);
    return { success: true, newTree };
  } catch (error) {
    console.error(`Failed to create file: ${filePath}`, error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-file', async (_, { filePath, content }: { filePath: string; content: string }) => {
  try {
    // We use fs-extra's writeFile which is promise-based by default
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error(`Failed to save file: ${filePath}`, error);
    return { success: false, error: (error as Error).message };
  }
});
// --- End: Add create-file handler ---

ipcMain.handle('delete-file', async (_, { vaultPath, filePath }) => {
  try {
    await fs.remove(filePath);
    const newTree = await readDirectory(vaultPath);
    return { success: true, newTree };
  } catch (error) {
    console.error(`Failed to delete file: ${filePath}`, error);
    return { success: false, error: (error as Error).message };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
