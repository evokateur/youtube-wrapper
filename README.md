# YouTube Wrapper

A desktop wrapper for [YouTube](https://youtube.com)
built using [Electron](https://www.electronjs.org/) that can be used for distraction free, directed viewing.

## Features

- Inserts CSS to hide suggested videos, etc:

  ```css
  - /* hide the sidebar with suggested/related items on a watch page */
    ytd-watch-flexy #secondary,
    ytd-watch-flexy #related,
    ytd-watch-next-secondary-results-renderer,
    ytd-compact-autoplay-renderer,
    ytd-compact-video-renderer,
    ytd-compact-radio-renderer,
    ytd-compact-playlist-renderer {
        display: none !important;
    }

    /* let the main column take the full width when sidebar is gone */
    ytd-watch-flexy[flexy] #primary {
        max-width: none !important;
    }
    ```

- Can be opened/activated with a YouTube URL and can be configured as the
browser for launching YouTube URLs from bookmark managers and other apps.
  - Example [Finicky](https://github.com/johnste/finicky) configuration (`~/.finicky.js`):

    ```javascript
    export default {
    defaultBrowser: "Firefox",
    handlers: [
        {
        match: /youtube\.com/,
        browser: "YouTube"
        },
        {
        match: /youtu\.be/,
        browser: "YouTube"
        }
    ]
    };
    ```
  
## Getting Started

### 1. Clone the repository

```bash
git clone [youtube-wrapper repo]
cd youtube-wrapper
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
npm start
```

### 4. Packaging the app

To build for macOS (.app or .dmg) or Linux (.AppImage), run:

```bash
npm run package
```

Output will appear in the `dist/` directory – move `dist/mac/YouTube.app` to `~/Applications`.
