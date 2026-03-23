# Khushi Presentation

A simple, beautiful, and mobile-friendly web application to design, preview, and export polished worship slides in minutes.

## ✨ Features
- **Live Preview:** See changes in real-time.
- **Drag & Drop Text:** Freely move text on the slides with your mouse or touch.
- **Customization:** Change themes, text color, opacity, size, and alignment.
- **Auto-fit:** Automatically scales down long text to perfectly fit the slide.
- **PDF Export:** Downloads high-quality landscape PDFs instantly.
- **Telegram Notifications:** Get notified on Telegram whenever a PDF is downloaded.

## 🚀 Setup Instructions

1. Clone this repository to your local machine.
2. Create a file named `env.js` in the root folder (or rename `env.sample.js` to `env.js`).
3. Add your Telegram API credentials inside `env.js`:
   ```javascript
   window.ENV_TG_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
   window.ENV_TG_CHAT_ID = "YOUR_ADMIN_ID_HERE";
   ```
4. Ensure you have your background images in the `themes/` folder (e.g., `theme1.png`, `theme2.png`).
5. Open `index.html` in your browser to start using the app! No build steps required.

## 🛡️ Security Note
The `env.js` file is included in `.gitignore` to prevent your private Telegram bot tokens from being exposed publicly on GitHub.