//! preload.js - اجرا در محیط preload قبل از لود renderer
//! از contextBridge برای ایجاد API امن بین renderer و main استفاده می‌کنیم.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('folderAPI', {
  //! ارسال درخواست ساخت پوشه‌ها به main
  createFolders: (data) => ipcRenderer.invoke('create-folders', data),

  //! باز کردن دیالوگ انتخاب پوشه و دریافت مسیر انتخاب‌شده
  selectFolder: () => ipcRenderer.invoke('select-folder')
});
