import React, { useState, useEffect } from 'react';

// Определяем типы для информации, получаемой от electron-updater
// @ts-ignore (используем ts-ignore, так как window.updaterAPI добавляется в preload)
const updaterAPI = window.updaterAPI;

interface UpdateInfo {
  version: string;
}
interface ProgressInfo {
  percent: number;
  bytesPerSecond: number;
}

// Компонент для отображения и управления обновлениями
function Updater() {
  // Проверяем наличие API прямо внутри компонента
  if (!updaterAPI) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Обновление приложения</h3>
        <p className="text-red-500">Ошибка: Модуль обновления не смог загрузиться. Возможно, preload-скрипт не выполнен.</p>
      </div>
    );
  }

  const [status, setStatus] = useState('Проверить обновления');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [isUpdateReady, setIsUpdateReady] = useState(false);

  useEffect(() => {
    const removeUpdateAvailableListener = updaterAPI.on('update-available', (info: UpdateInfo) => {
      setUpdateInfo(info);
      setStatus(`Доступна новая версия: ${info.version}`);
    });
    
    const removeUpdateNotAvailableListener = updaterAPI.on('update-not-available', (message: string) => {
      setStatus(message);
      setTimeout(() => {
        setStatus('Проверить обновления');
        setUpdateInfo(null);
      }, 3000);
    });
    
    const removeUpdateErrorListener = updaterAPI.on('update-error', (message: string) => {
      setStatus(message);
    });
    
    const removeDownloadProgressListener = updaterAPI.on('download-progress', (progressObj: ProgressInfo) => {
      setStatus(`Загрузка... ${Math.round(progressObj.percent)}%`);
      setProgress(progressObj);
    });

    const removeUpdateDownloadedListener = updaterAPI.on('update-downloaded', (message: string) => {
      setStatus(message);
      setIsUpdateReady(true);
      setProgress(null);
    });

    // Очистка подписок
    return () => {
      removeUpdateAvailableListener();
      removeUpdateNotAvailableListener();
      removeUpdateErrorListener();
      removeDownloadProgressListener();
      removeUpdateDownloadedListener();
    };
  }, []);

  const checkForUpdates = () => {
    setStatus('Проверка...');
    setProgress(null);
    setUpdateInfo(null);
    setIsUpdateReady(false);
    updaterAPI.send('check-for-update');
  };

  const startDownload = () => {
    setStatus('Начинаю загрузку...');
    updaterAPI.send('start-download');
  };

  const quitAndInstall = () => {
    updaterAPI.send('quit-and-install');
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Обновление приложения</h3>
      <div className="bg-gray-50 p-4 rounded-md">
        <p className="mb-2">Статус: <strong className="text-indigo-700">{status}</strong></p>
        
        {progress && (
          <div className="my-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress.percent}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Скорость: {Math.round(progress.bytesPerSecond / 1024)} KB/s
            </p>
          </div>
        )}

        {!updateInfo && !isUpdateReady && (
          <button onClick={checkForUpdates} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400" disabled={status === 'Проверка...'}>
            Проверить обновления
          </button>
        )}

        {updateInfo && !progress && !isUpdateReady && (
          <button onClick={startDownload} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Загрузить версию {updateInfo?.version}
          </button>
        )}
        
        {isUpdateReady && (
          <button onClick={quitAndInstall} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Перезапустить и установить
          </button>
        )}
      </div>
    </div>
  );
}

export default Updater;