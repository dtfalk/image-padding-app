const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// create the main window we use
function createWindow() {

  // initialization of the window
  var win = new BrowserWindow({
    width: 800,
    height: 650,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  // remove the menu from the window
  win.removeMenu();

  // url/path for the index html
  //const startURL = `file://${path.join(__dirname, 'index.html')}`
  const startURL = `file://${path.join(__dirname, 'index.html')}`
  
  // load the index file
  win.loadURL(startURL);

  //win.webContents.openDevTools();

  // Paths
  const userDataPath = app.getPath('userData');
  const dataFilePath = path.join(userDataPath, 'data.json');
  const defaultDataFilePath = path.join(__dirname, 'src', 'data.json');

  // Copy default data.json to userDataPath if it doesn't exist
  if (!fs.existsSync(dataFilePath)) {
    if (fs.existsSync(defaultDataFilePath)) {
      fs.copyFileSync(defaultDataFilePath, dataFilePath);
    } else {
      console.error('Default data.json file does not exist at', defaultDataFilePath);
    }
  }

}

// once ready, display the window
app.whenReady().then(createWindow);


// when the final window is closed, exit the application
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// honestly not sure, just make sure there is always at least one window open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handler for opening the folder dialog
ipcMain.handle('open-folder-dialog', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
    filters: [{ name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'svg', 'gif', 'svg'] }],
    modal: true
  });
  return result.filePaths;
});

// IPC handler for opening a multi-selection file dialog
ipcMain.handle('open-multi-file-dialog', async (event, selectedPath) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'svg', 'gif', 'svg'] }],
    modal: true,
    defaultPath: selectedPath
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

// IPC handler to load the JSON file
ipcMain.handle('load-JSON', async () => {
  const userDataPath = app.getPath('userData');
  const dataFilePath = path.join(userDataPath, 'data.json');
  return new Promise((resolve, reject) => {
    fs.readFile(dataFilePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
});

// IPC handler to save the JSON file
ipcMain.handle('save-JSON', async (event, data) => {
  const userDataPath = app.getPath('userData');
  const dataFilePath = path.join(userDataPath, 'data.json');
  return new Promise((resolve, reject) => {
    fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve('JSON file saved successfully');
      }
    });
  });
});
// IPC handler for getting images from a directory
ipcMain.handle('get-images', async (event, folderPath) => {
  const files = await fs.promises.readdir(folderPath);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
  const images = files.filter(file => imageExtensions.includes(path.extname(file).toLowerCase()));
  return images.map(image => path.join(folderPath, image));
});

// IPC handler for reading an image as Base64
ipcMain.handle('read-image', async (event, filePath) => {
  const imageBuffer = await fs.promises.readFile(filePath);
  return `data:image/${path.extname(filePath).substring(1)};base64,${imageBuffer.toString('base64')}`;
});

// Add IPC handler to exit the app
ipcMain.handle('exit-app', () => {
  app.quit();
});

// IPC handler for padding the images
ipcMain.handle('process-images', async (event, images, saveLocation) => {
  if (!images || !Array.isArray(images) || !saveLocation) {
    throw new Error('Invalid arguments');
  }

  var paddedImages = [];
  for (const image of images) {
    if (!image.path) {
      throw new Error('Image object does not contain a path property');
    }

    const { width, height } = await sharp(image.path).metadata();
    const size = Math.max(width, height);
    var paddedImage;

    // if the difference between width and height is large...
    if (Math.abs(width - height) > 5) {

      paddedImage = await sharp(image.path)
        .extend({
          top: Math.floor((size - height) / 2),
          bottom: Math.ceil((size - height) / 2),
          left: Math.floor((size - width) / 2),
          right: Math.ceil((size - width) / 2),
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toBuffer();
    }
    // if the difference between width and height is small
    else {
      const cropSize = Math.min(width, height);
      paddedImage = await sharp(image.path).extract({
        left: Math.floor((width - cropSize) / 2),
        top: Math.floor((height - cropSize) / 2),
        width: cropSize,
        height: cropSize})
        .toBuffer();
    }

  

    let newFilePath = path.join(saveLocation, `${path.basename(image.path)}`);

    let counter = 1;
    while (fs.existsSync(newFilePath)) {
      const parsedPath = path.parse(newFilePath);
      newFilePath = path.join(saveLocation, `${parsedPath.name}_${counter}${parsedPath.ext}`);
      counter++;
    }

    await fs.promises.writeFile(newFilePath, paddedImage);
    paddedImages.push(newFilePath);
  }
  return paddedImages;
});

