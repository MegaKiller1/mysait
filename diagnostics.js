// diagnostics.js
function setupDiagnostics(launcher, mainWindow, isDebug) {
    // Якщо режим розробника вимкнений — просто повністю ігноруємо цей скрипт
    if (!isDebug) return; 

    // Функція, яка закидає повідомлення від ядра прямо у твою консоль DevTools
    const sendLog = (type, message) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            // Очищаємо текст від спецсимволів, щоб консоль не ламалася
            const safeText = String(message).replace(/`/g, "'").replace(/\\/g, '\\\\').replace(/\n/g, ' ');
            mainWindow.webContents.executeJavaScript(`console.${type}(\`[ЯДРО]: ${safeText}\`)`).catch(() => {});
        }
    };

    sendLog('warn', '=== ДІАГНОСТИКА УВІМКНЕНА ===');
    sendLog('warn', 'Зараз тут з\'являться всі процеси запуску Minecraft...');

    // Слухаємо всі технічні події від minecraft-launcher-core
    launcher.on('debug', (e) => sendLog('log', e));
    launcher.on('data',  (e) => sendLog('info', e));
    launcher.on('error', (e) => sendLog('error', e));
}

// Дозволяємо іншим файлам використовувати цю функцію
module.exports = { setupDiagnostics };