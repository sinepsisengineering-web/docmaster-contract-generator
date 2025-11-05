const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: true, // Включите, если вам нужен доступ к Node.js API в рендерере
      contextIsolation: false // Отключите, если nodeIntegration: true
    }
  });

  // Загружаем HTML-файл вашего React-приложения после сборки
  // Убедитесь, что 'dist/index.html' - это правильный путь к вашему index.html после сборки Vite
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // Открыть DevTools.
  // win.webContents.openDevTools();
}

// Теперь этот код находится СНАРУЖИ функции, как и должно быть
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