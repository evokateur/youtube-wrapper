# YouTube Wrapper

An [Electron](https://www.electronjs.org/) wrapper for [YouTube](https://youtube.com)
for less distracted, more directed viewing.

- Hides suggested videos and other UI distractions; lets the video being watched take up the screen.

- Can open/activate with a YouTube URL, bypassing the precarious YouTube feed.

- Can be configured as the default browser for YouTube URLs with tools such as [Finicky](https://github.com/johnste/finicky).
  
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

Output will appear in the `dist/` directory.

On macOS you can move `dist/mac/YouTube.app` to `~/Applications`

Example Finicky configuration (`~/.finicky.js`):

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
