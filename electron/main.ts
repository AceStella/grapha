import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import fs from 'fs-extra'
import { fileURLToPath } from 'node:url'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkWikiLink from 'remark-wiki-link'

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

function parseLinks(content: string): string[] {
  const links: string[] = [];
  const processor = unified()
    .use(remarkParse)
    .use(remarkWikiLink);

  const tree = processor.parse(content);
  
  function visit(node: any) {
    if (node.type === 'wikiLink') {
      links.push(node.value);
    }
    if (node.children) {
      node.children.forEach(visit);
    }
  }

  visit(tree);
  return [...new Set(links)];
}

ipcMain.handle('open-directory', async () => {
  if (!win) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });

  if (canceled || filePaths.length === 0) return null;

  const dirPath = filePaths[0];
  const tree = await readDirectory(dirPath);
  return { path: dirPath, tree };
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const links = parseLinks(content);
    return { content, links };
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    return null;
  }
});

ipcMain.handle('create-file', async (_, { directoryPath, fileName }) => {
  if (!fileName.endsWith('.md')) fileName += '.md';
  const filePath = path.join(directoryPath, fileName);
  try {
    await fs.ensureFile(filePath);
    const newTree = await readDirectory(directoryPath);
    return { success: true, newTree };
  } catch (error) {
    console.error(`Failed to create file: ${filePath}`, error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('save-file', async (_, { filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error(`Failed to save file: ${filePath}`, error);
    return { success: false, error: (error as Error).message };
  }
});

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

// --- Start: Add get-graph-data handler ---
async function getAllFiles(dirPath: string): Promise<string[]> {
  const dirents = await fs.readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dirPath, dirent.name);
    return dirent.isDirectory() ? getAllFiles(res) : res;
  }));
  return Array.prototype.concat(...files).filter(file => file.endsWith('.md'));
}

ipcMain.handle('get-graph-data', async (_, vaultPath: string) => {
  const allFiles = await getAllFiles(vaultPath);
  const nodes = allFiles.map(filePath => ({
    id: path.basename(filePath, '.md'),
    path: filePath,
  }));

  const edges: { source: string, target: string }[] = [];

  for (const node of nodes) {
    const content = await fs.readFile(node.path, 'utf-8');
    const links = parseLinks(content);
    links.forEach(link => {
      // Find the target node that matches the link
      const targetNode = nodes.find(n => n.id === link);
      if (targetNode) {
        edges.push({ source: node.id, target: targetNode.id });
      }
    });
  }

  return { nodes, edges };
});
// --- End: Add get-graph-data handler ---

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
