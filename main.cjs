const { app, BrowserWindow, ipcMain } = require('electron'); // Добавили ipcMain
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Настраиваем логирование для отладки
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

// Отключаем автоматическую загрузку. Мы будем делать это вручную по команде.
autoUpdater.autoDownload = false;

// Глобальная переменная для нашего окна, чтобы мы могли отправлять в него сообщения
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({ // Присваиваем окну глобальную переменную
    width: 1200,
    height: 800,
    webPreferences: {
  preload: path.join(__dirname, 'preload.cjs'),
  // Включаем изоляцию контекста для безопасности.
  // Это ОБЯЗАТЕЛЬНО для работы contextBridge в preload.cjs.
  contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  
  //mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ===================================================================
// ЛОГИКА РУЧНОГО ОБНОВЛЕНИЯ
// ===================================================================

// Функция для отправки сообщений в наше окно (в React-компонент)
function sendStatusToWindow(channel, text) {
  if (mainWindow) {
    autoUpdater.logger.info(text);
    mainWindow.webContents.send(channel, text);
  }
}

// 1. Интерфейс (React) запрашивает проверку обновлений
ipcMain.on('check-for-update', () => {
  autoUpdater.checkForUpdates();
});

// 2. Интерфейс (React) дает команду начать загрузку обновления
ipcMain.on('start-download', () => {
  autoUpdater.downloadUpdate();
});

// 3. Интерфейс (React) дает команду перезапустить и установить обновление
ipcMain.on('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

// --- Обработчики событий от autoUpdater ---

// Событие: Найдено доступное обновление
autoUpdater.on('update-available', (info) => {
  // Отправляем в React информацию о найденной версии
  sendStatusToWindow('update-available', info);
});

// Событие: Обновление не найдено
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('update-not-available', 'Новых обновлений нет. У вас последняя версия.');
});

// Событие: Ошибка при обновлении
autoUpdater.on('error', (err) => {
  sendStatusToWindow('update-error', `Ошибка при обновлении: ${err.message}`);
});

// Событие: Прогресс загрузки
autoUpdater.on('download-progress', (progressObj) => {
  // Отправляем в React объект с процентами, скоростью и т.д.
  sendStatusToWindow('download-progress', progressObj);
});

// Событие: Обновление успешно загружено и готово к установке
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('update-downloaded', 'Обновление загружено. Готово к установке.');
});