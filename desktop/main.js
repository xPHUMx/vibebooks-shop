const { app, BrowserWindow, shell, Menu, dialog } = require('electron');
const path = require('path');

// Determine Target URL
const TARGET_URL = process.env.ELECTRON_DEV === '1'
  ? 'http://localhost:3000'
  : (process.env.APP_URL || 'https://booksangdai.vercel.app');

let mainWindow = null;

function createMainWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: 'Book Sangdai (บุ๊คสั่งได้)',
    icon: iconPath,
    backgroundColor: '#0a0a0c',
    show: false, // Wait until ready-to-show to prevent white flash
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Load URL
  mainWindow.loadURL(TARGET_URL);

  // Smooth appearance
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links safely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // If opening external site, open in default system browser
    if (!url.startsWith(TARGET_URL) && !url.includes('localhost:3000')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Handle failed load (e.g. offline)
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorDescription} (${errorCode})`);
    if (errorCode === -105 || errorCode === -106 || errorCode === -102) {
      mainWindow.loadURL(`data:text/html;charset=utf-8,
        <!DOCTYPE html>
        <html>
        <head>
          <title>Book Sangdai - Connection Error</title>
          <style>
            body { background: %230a0a0c; color: %23ffffff; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .box { background: %23161617; padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); max-width: 440px; }
            h2 { margin: 0 0 12px; font-size: 20px; }
            p { color: %2388888b; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
            button { background: %232997ff; color: %23fff; border: none; padding: 10px 24px; border-radius: 980px; font-weight: 600; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้</h2>
            <p>กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองใหม่อีกครั้ง</p>
            <button onclick="window.location.href='${TARGET_URL}'">ลองใหม่อีกครั้ง (Retry)</button>
          </div>
        </body>
        </html>
      `);
    }
  });

  // Native Application Menu
  const menuTemplate = [
    {
      label: 'Book Sangdai',
      submenu: [
        {
          label: 'เกี่ยวกับ Book Sangdai',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'เกี่ยวกับ Book Sangdai',
              message: 'Book Sangdai (บุ๊คสั่งได้) Desktop v2.0',
              detail: 'Ultra-Refined Digital Store & Creator Vault\nเว็บไซต์: https://booksangdai.vercel.app',
              icon: iconPath,
            });
          },
        },
        { type: 'separator' },
        { role: 'quit', label: 'ออกจากโปรแกรม' },
      ],
    },
    {
      label: 'แก้ไข (Edit)',
      submenu: [
        { role: 'undo', label: 'เลิกทำ' },
        { role: 'redo', label: 'ทำซ้ำ' },
        { type: 'separator' },
        { role: 'cut', label: 'ตัด' },
        { role: 'copy', label: 'คัดลอก' },
        { role: 'paste', label: 'วาง' },
        { role: 'selectAll', label: 'เลือกทั้งหมด' },
      ],
    },
    {
      label: 'มุมมอง (View)',
      submenu: [
        { role: 'reload', label: 'รีเฟรชหน้า (Reload)' },
        { role: 'forceReload', label: 'รีเฟรชแบบเคลียร์แคช' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'ขนาดปกติ' },
        { role: 'zoomIn', label: 'ขยายหน้าจอ' },
        { role: 'zoomOut', label: 'ย่อหน้าจอ' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'เต็มจอ (Full Screen)' },
      ],
    },
    {
      label: 'ช่วยเหลือ (Help)',
      submenu: [
        {
          label: 'เปิดเว็บไซต์ Book Sangdai',
          click: () => shell.openExternal('https://booksangdai.vercel.app'),
        },
        {
          label: 'ติดต่อฝ่ายบริการลูกค้า',
          click: () => shell.openExternal('mailto:support@booksangdai.store'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
