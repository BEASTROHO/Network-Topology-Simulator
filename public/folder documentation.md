# 🌐 Public Folder Overview

The `public/` directory contains static assets and configuration files that are directly served by the browser. These files are not processed by Webpack and remain unchanged during the build process.

---

## 📁 Contents

| File/Folder | Description |
|-------------|-------------|
| `index.html` | Main HTML template. React mounts to the `<div id="root">`. Includes meta tags and links to favicon. |
| `favicon.ico` | Icon displayed in browser tab. Represents the simulator visually. |
| `manifest.json` | Web app manifest for PWA support. Defines name, icons, theme color, and display mode. |
| `robots.txt` | Controls how search engines index the site. Prevents unwanted crawling. |
| `logo192.png` / `logo512.png` | Icons used for PWA and mobile home screen shortcuts. |
| `assets/` *(optional)* | Folder for static images, SVGs, or external resources used in UI. |

---

## 🛠 How It Works

- `index.html` is the entry point for the React app.
- React injects the app into the `#root` div.
- Static files here are accessible via `/filename.ext` in the browser.
- Ideal for storing:
  - App icons
  - External fonts
  - Static images
  - SEO-related files

---

## 🧩 Best Practices

- Avoid placing dynamic or JS-heavy logic here.
- Use `src/assets/` for images that require import or bundling.
- Keep `manifest.json` updated for proper PWA behavior.
- Ensure `robots.txt` reflects your indexing preferences.

---

## 📌 Example Use

```html
<!-- index.html snippet -->
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
