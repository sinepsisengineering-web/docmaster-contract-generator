const { contextBridge, ipcRenderer } = require('electron');

// Мы создаем "мост" с именем 'updaterAPI'
// Теперь в нашем React-коде мы сможем вызывать window.updaterAPI.send(...) и window.updaterAPI.on(...)
contextBridge.exposeInMainWorld('updaterAPI', {
  /**
   * Отправляет команду из React в main.cjs
   * @param {string} channel - Название команды (например, 'check-for-update')
   * @param {any} data - Дополнительные данные (если нужны)
   */
  send: (channel, data) => {
    // Белый список разрешенных каналов для отправки
    const validChannels = ['check-for-update', 'start-download', 'quit-and-install'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  /**
   * Подписывается на события из main.cjs
   * @param {string} channel - Название события (например, 'update-available')
   * @param {Function} func - Функция-обработчик, которая будет вызвана
   */
  on: (channel, func) => {
    // Белый список разрешенных каналов для получения
    const validChannels = [
      'update-available',
      'update-not-available',
      'update-error',
      'download-progress',
      'update-downloaded'
    ];
    if (validChannels.includes(channel)) {
      // Специальная обертка, чтобы избежать "протекания" ipcRenderer в React
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);

      // Возвращаем функцию для отписки, чтобы избежать утечек памяти
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
  }
});