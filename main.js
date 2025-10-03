import { app, BrowserWindow, nativeImage, shell } from 'electron';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageFile = path.join(app.getPath('userData'), 'youtube-data.json');

function completeUrl(baseUrl) {
    const data = fetchAppData();
    return baseUrl + data.location;
}

function fetchAppData() {
    try {
        if (fs.existsSync(storageFile)) {
            const data = fs.readFileSync(storageFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading application data:', error);
    }

    return { location: '/' }
}

function saveAppData(data) {
    try {
        fs.writeFileSync(storageFile, JSON.stringify(data, null, 2));
        console.log('Saved application data:', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving application data:', error);
    }
}

function createWindow(launchUrl = null)
{
    const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/icon.png'));
    const baseUrl = "https:/youtube.com";
    const baseDomains = ['youtube.com', 'google.com'];

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon,
        autoHideMenuBar: true,
        title: "YouTube",
        webPreferences: {
            sandbox: true,
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false
        },
    });

    win.webContents.setWindowOpenHandler((details) => {
        try {
            const url = new URL(details.url);
            if (url.protocol == 'http:' || url.protocol == 'https:') {
                shell.openExternal(details.url);
            }
        } catch (error) {}

        return { action: "deny" };
    });

    win.webContents.on('will-navigate', (event, url) => {
        const urlDomain = new URL(url).hostname.split('.').slice(-2).join('.');
        for (const baseDomain of baseDomains) {
            if (urlDomain === baseDomain || urlDomain.endsWith('.' + baseDomain)) {
                return;
            }
        }
        event.preventDefault();
        shell.openExternal(url).catch(error => {
            console.error('Failed to open external URL:', error);
        });
    });

    let lastUrl = '';
    const urlCheckInterval = setInterval(() => {
        if (win.isDestroyed()) {
            clearInterval(urlCheckInterval);
            return;
        }

        win.webContents.executeJavaScript('window.location.href', true)
            .then(currentUrl => {
                if (currentUrl !== lastUrl) {
                    lastUrl = currentUrl;
                    if (currentUrl.startsWith(baseUrl)) {
                        const location = currentUrl.slice(baseUrl.length);
                        const data = { location: location }
                        saveAppData(data);
                    }
                }
            })
            .catch(error => {});
    }, 1000);

    win.on('closed', () => {
        clearInterval(urlCheckInterval);
    });

    win.loadURL(launchUrl ? launchUrl : completeUrl(baseUrl));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        const launchUrl = process.argv.find(arg => arg.includes('youtube.com'));
        if (launchUrl) {
            createWindow(launchUrl);
        } else {
            createWindow();
        }
    }
});

app.on('open-url', (event, url) => {
    event.preventDefault();
    if (url.includes('youtube.com')) {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
            windows[0].loadURL(url);
            windows[0].focus();
        } else {
            createWindow(url);
        }
    }
});
