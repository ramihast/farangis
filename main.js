//* main.js - پردازش اصلی (Main process)
//* توضیح: ساخت پنجره، هندل کردن IPC، و باز کردن دیالوگ انتخاب پوشه.
//* اگر نمی‌خوای ری‌لود خودکار داشته باشی، خط مربوط به electron-reload را حذف کن.

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

//* === (اختیاری) ری‌لود خودکار در زمان توسعه ===
//* این خط باعث میشه وقتی فایل‌ها رو ویرایش می‌کنی، اپ دوباره لود شه.
//* اگر میخوای حذفش کن یا فقط در dev استفاده کن.
try {
  require("electron-reload")(__dirname, {
    electron: require(path.join(__dirname, "node_modules", ".bin", "electron")),
  });
} catch (e) {
  //* در صورتی که electron-reload نصب نباشه، چیزی اتفاق نمیفته.
}

//* تابع ساخت پنجره
function createWindow() {
  const win = new BrowserWindow({
    width: 550,
    height: 650,
    resizable: false,
    maximizable: false,
    minimizable: true,
    icon: path.join(__dirname, "assets", "icon.png"),
    //* آیکون برنامه (اختیاری)
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), //* بارگذاری فایل preload
      contextIsolation: true, //* امنیت: جداسازی context
      nodeIntegration: false, //* بهتره false باشه
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

//* وقتی اپ آماده شد پنجره رو بساز
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    //* برای macOS: اگر همه پنجره‌ها بسته شده بود، دوباره بساز
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

//* === IPC: ساخت پوشه‌ها ===
//* این هندلر از renderer فراخوانی میشه و پوشه‌ها رو می‌سازه.
//* توجه: اینجا ورودی‌ها را مستقیماً اعتماد می‌کنیم — اگر لازم باشه میشه اعتبارسنجی اضافه کرد.
ipcMain.handle(
  "create-folders",
  async (event, { folderName, startNum, endNum, basePath }) => {
    try {
      for (let i = startNum; i <= endNum; i++) {
        // اگر می‌خواهی بین اسم و عدد فاصله باشه از `${folderName} ${i}` استفاده کن
        const folderPath = path.join(basePath, `${folderName}${i}`);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
      }
      // برمی‌گردونیم یک شیء تا renderer بتونه با result.success چک کنه
      return { success: true, message: "پوشه‌ها با موفقیت ساخته شدند 🎉" };
    } catch (err) {
      return {
        success: false,
        message: "خطا هنگام ساخت پوشه‌ها: " + err.message,
      };
    }
  }
);

// === IPC: باز کردن دیالوگ انتخاب پوشه ===
ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// خروج از اپ وقتی همه پنجره‌ها بسته شد (به جز macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
