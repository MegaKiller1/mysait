const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { Client, Authenticator } = require('minecraft-launcher-core');

const launcher = new Client();
let isLaunching = false;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'img/NexCraft_icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true // Увімкнули консоль
    }
  });

  win.removeMenu();
  win.loadFile(path.join(__dirname, 'index.html'));
  
  // Правильне місце для відкриття консолі (ВСЕРЕДИНІ функції createWindow)
  win.webContents.openDevTools(); 
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.on('launcher:launch', async (event, cfg) => {
  if (isLaunching) return;
  isLaunching = true;

  const auth = Authenticator.getAuth(cfg.username); 

  let opts = {
    clientPackage: null,
    authorization: auth,
    root: path.join(app.getPath('appData'), 'launxter', '.nexcraft'), 
    version: {
      number: "1.12.2", 
      type: "release",
      custom: "1.12.2-forge-14.23.5.2864"
    },
    memory: {
      max: `${cfg.ramGB}G`,
      min: "4G" // Java більше не буде крашитися!
    }
  };

  if (cfg.server) {
    opts.server = {
      host: cfg.server.host,
      port: cfg.server.port || 25565
    };
  }

  launcher.on('download-status', (e) => {
    let percent = Math.round((e.current / e.total) * 100);
    event.sender.send('launcher:status', `Завантаження файлів: ${percent}%`);
  });

  try {
    event.sender.send('launcher:status', 'Запуск ядра Minecraft...');
    await launcher.launch(opts);
    
    launcher.on('close', (e) => {
      isLaunching = false;
      event.sender.send('launcher:status', 'Гра закрита.');
    });

  } catch (error) {
    isLaunching = false;
    event.sender.send('launcher:status', `Помилка: ${error.message}`);
    console.error("Помилка запуску:", error);
  }
});