const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { start } = require('repl');

async function createWindow() {
  const isDev = (await import('electron-is-dev')).default;
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: true,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: true,
    }
  });
  
  win.removeMenu();

  // Load the index.html from a URL
  // const startURL = isDev
  // ? 'http://localhost:3000'
  // : 'http://localhost:5000'; // URL where serve is running

  // Load the index.html from a file path
  // const indexPath = path.join(__dirname, 'index.html');
  // console.log('hello')
  // win.loadFile(indexPath).then((error) => {
  //   console.log('Failed to load index.html:', error);
  // });
  // console.log('bye')
  const startURL = isDev
  ? 'http://localhost:3000'
  : `file://${path.join(__dirname, '..', 'build', 'index.html')}`;
  console.log(startURL);

  await win.loadURL(startURL).catch((error) => {
    throw new Error('Failed to load URL:', error);
  });
  //win.loadFile(path.join(__dirname, '..', 'build', 'index.html')).catch((error) => {
  //  console.log('Failed to load index.html:', error);
 //});

  // Open the DevTools.
  win.webContents.openDevTools();
}

// IPC handler for opening the file dialog
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  return result.filePaths;
});

// IPC handler for opening the folder dialog
ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths;
});

// IPC handler for opening a multi-selection file dialog
ipcMain.handle('open-multi-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'img'] }],
  });
  return result.filePaths;
});

// IPC handler for reading the contents of a directory
ipcMain.handle('read-directory', async (event, folderPath) => {
  return fs.promises.readdir(folderPath);
});

// IPC handler for reading the contents of a file
ipcMain.handle('read-file', async (event, filePath) => {
  return fs.promises.readFile(filePath, 'utf8');
});

// IPC handler for getting images from a directory
ipcMain.handle('get-images', async (event, folderPath) => {
  const files = await fs.promises.readdir(folderPath);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', 'img'];
  const images = files.filter(file => imageExtensions.includes(path.extname(file).toLowerCase()));
  return images.map(image => path.join(folderPath, image));
});

// IPC handler for reading an image as Base64
ipcMain.handle('read-image', async (event, filePath) => {
  const imageBuffer = await fs.promises.readFile(filePath);
  return `data:image/${path.extname(filePath).substring(1)};base64,${imageBuffer.toString('base64')}`;
});

ipcMain.handle('process-images', async (event, images, saveLocation) => {

  if (!images || !Array.isArray(images) || !saveLocation) {
    throw new Error('Invalid arguments');
  }

  const processedImages = [];

  for (const image of images) {
    if (!image.path) {
      throw new Error('Image object does not contain a path property');
    }

    const { width, height } = await sharp(image.path).metadata();
    const size = Math.max(width, height);

    const paddedImage = await sharp(image.path)
      .extend({
        top: Math.floor((size - height) / 2),
        bottom: Math.ceil((size - height) / 2),
        left: Math.floor((size - width) / 2),
        right: Math.ceil((size - width) / 2),
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    let newFilePath = path.join(saveLocation, `${path.basename(image.path)}`);

    let counter = 1;
    while (fs.existsSync(newFilePath)) {
      const parsedPath = path.parse(newFilePath);
      newFilePath = path.join(saveLocation, `${parsedPath.name}_${counter}${parsedPath.ext}`);
      counter++;
    }

    await fs.promises.writeFile(newFilePath, paddedImage);
    processedImages.push(newFilePath);
  }

  return processedImages;
});

// Add IPC handler to exit the app
ipcMain.handle('exit-app', () => {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
