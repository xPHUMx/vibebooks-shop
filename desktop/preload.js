const { contextBridge, ipcRenderer } = require('electron');

// Expose safe desktop bridge APIs to web application
contextBridge.exposeInMainWorld('BookSangdaiDesktop', {
  isDesktop: true,
  platform: process.platform,
  version: '2.0.0',
  send: (channel, data) => {
    const validChannels = ['app:minimize', 'app:maximize', 'app:close'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
});
