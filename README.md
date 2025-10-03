# YouTube Wrapper

An [Electron](https://www.electronjs.org/) wrapper for [YouTube](https://youtube.com)
for more directed, less distracted viewing.

- Hides suggested videos and other UI distractions; lets the video being watched take up the majority of the screen.

- Can open/activate with a YouTube URL, bypassing the precarious YouTube feed (which often can take hours to circumnavigate).

- Rather than opening at `/` (oh no, the feeeeeed) it opens/activates at the last location, making it easy to start where you left off.

- Only navigates to base domains `youtube.com`, `youtu.be`, and `google.com` (for authentication); external links open in the default browser.

- Can be configured as the default browser for YouTube URLs with tools such as [Finicky](https://github.com/johnste/finicky), giving you a straight path from your stack/queue/heap to the video you meant to watch. 
  Example `~/.finicky.js`:
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
git clone git@github.com:evokateur/youtube-wrapper.git
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

Output will appear in the `dist/` directory. On macOS you can simply:
```sh
mv dist/mac/YouTube.app ~/Applications
```


