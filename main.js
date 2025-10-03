import { app, BrowserWindow, nativeImage, shell } from 'electron';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

let pendingOpenUrl = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageFile = path.join(app.getPath('userData'), 'youtube-data.json');
const baseDomains = ['youtube.com', 'youtu.be', 'google.com'];
const baseUrl = "https://www.youtube.com";

function isDomainAllowed(url) {
    try {
        const hostname = new URL(url).hostname;
        for (const baseDomain of baseDomains) {
            if (hostname === baseDomain || hostname.endsWith('.' + baseDomain)) {
                return true;
            }
        }
    } catch (e) {}
    return false;
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

function resumeUrl() {
    const data = fetchAppData();
    return baseUrl + data.location;
}

function createWindow(launchUrl = null)
{
    const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/icon.png'));

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
        if (isDomainAllowed(url)) {
            return;
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
                        const urlObj = new URL(currentUrl);
                        const data = { location: urlObj.pathname + urlObj.search + urlObj.hash };
                        saveAppData(data);
                    }
                }
            })
            .catch(error => {});
    }, 1000);

    win.on('closed', () => {
        clearInterval(urlCheckInterval);
    });

    win.webContents.on('did-finish-load', () => {
        win.webContents.insertCSS(`
            /* Hide the sidebar with suggested/related items on a watch page */
            ytd-watch-flexy #secondary,
            ytd-watch-flexy #related,
            ytd-watch-next-secondary-results-renderer,
            ytd-compact-autoplay-renderer,
            ytd-compact-video-renderer,
            ytd-compact-radio-renderer,
            ytd-compact-playlist-renderer {
                display: none !important;
            }

            /* (Nice to have) let the main column take the full width when sidebar is gone */
            ytd-watch-flexy[flexy] #primary {
                max-width: none !important;
            }
        `);
            // #secondary { display: none !important; }
    });

    win.loadURL(launchUrl ? launchUrl : resumeUrl());
}

app.on('ready', () => {
    createWindow();
    if (pendingOpenUrl) {
        handleOpenUrl(pendingOpenUrl);
        pendingOpenUrl = null;
    }
});

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
    if (!app.isReady()) {
        pendingOpenUrl = url;
        return;
    }
    handleOpenUrl(url);
});

function handleOpenUrl(url) {
    if (isDomainAllowed(url)) {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
            windows[0].loadURL(url);
            windows[0].focus();
        } else {
            createWindow(url);
        }
    }
}
