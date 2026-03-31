const { contextBridge, ipcRenderer } = require('electron');
const os = require('os'); // Підключаємо системний модуль для роботи з "залізом" комп'ютера

const _totalRamGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));
console.log('[preload] detected total RAM (GB):', _totalRamGB);

contextBridge.exposeInMainWorld('electronAPI', {
    // Відправка команди на запуск
    launchGame: (options) => ipcRenderer.send('launcher:launch', options),
    
    // Отримання статусу з бекенда (ядра)
    onLauncherStatus: (callback) => ipcRenderer.on('launcher:status', (event, status) => callback(status)),
    
    // НОВА ФУНКЦІЯ: Рахуємо всю ОЗП комп'ютера і переводимо з байтів у гігабайти
    getTotalRAM: () => _totalRamGB
});