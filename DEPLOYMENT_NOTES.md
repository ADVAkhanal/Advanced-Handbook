# Deploying the Advanced Companies Handbook Portal

The portal is a single self-contained HTML file. There is **no server, no build step, no dependencies**. Pick whichever of the options below fits your environment.

---

## Option 1 — Shared network drive (recommended, simplest)

Best when every shop computer is already on the company network.

1. Copy `Advanced_Handbook_Dashboard.html` to a read-only shared folder. Example:
   ```
   \\fileserver\shop\Handbook\Advanced_Handbook_Dashboard.html
   ```
2. On each shop computer, create a desktop shortcut:
   - Right-click the desktop → **New → Shortcut**.
   - Paste the UNC path: `\\fileserver\shop\Handbook\Advanced_Handbook_Dashboard.html`.
   - Name the shortcut **Employee Handbook**.
   - (Optional) Right-click the shortcut → **Properties → Change Icon…** and pick a recognizable icon.
3. To push the shortcut to many machines at once, drop the `.lnk` file into the **All Users Desktop** via Group Policy:
   ```
   C:\Users\Public\Desktop\Employee Handbook.lnk
   ```

**Updating:** replace the file at the shared location. Every shop computer sees the new version the next time they open it.

---

## Option 2 — Internal web server (IIS / nginx)

Best when you already have an intranet site and want a friendly URL like `http://intranet/handbook`.

### IIS (Windows Server)

1. Copy `Advanced_Handbook_Dashboard.html` to a folder, e.g.:
   ```
   C:\inetpub\wwwroot\handbook\Advanced_Handbook_Dashboard.html
   ```
2. In **IIS Manager**, add a default document for the site:
   - Select the `handbook` folder → **Default Document** → **Add…** → `Advanced_Handbook_Dashboard.html`.
3. Employees browse to:
   ```
   http://intranet/handbook/
   ```

### nginx (Linux)

1. Copy the file into your web root:
   ```
   /var/www/handbook/Advanced_Handbook_Dashboard.html
   ```
2. Add a location block to your `nginx.conf`:
   ```nginx
   location /handbook/ {
       alias /var/www/handbook/;
       index Advanced_Handbook_Dashboard.html;
   }
   ```
3. Reload nginx:
   ```bash
   sudo nginx -s reload
   ```

### Apache

```apache
Alias /handbook /var/www/handbook
<Directory /var/www/handbook>
    DirectoryIndex Advanced_Handbook_Dashboard.html
    Require all granted
</Directory>
```

---

## Option 3 — Set as browser homepage

If everyone uses the same browser, point it at the handbook so it opens automatically.

### Microsoft Edge (Group Policy)

1. Open **Group Policy Management Editor**.
2. Go to **Computer Configuration → Administrative Templates → Microsoft Edge**.
3. Enable **"Configure the home page URL"** and set the value to:
   ```
   file://fileserver/shop/Handbook/Advanced_Handbook_Dashboard.html
   ```
   or the intranet URL if using Option 2.

### Chrome (per-machine policy)

Edit the Chrome managed policy registry key:
```
HKEY_LOCAL_MACHINE\Software\Policies\Google\Chrome
  HomepageLocation = "http://intranet/handbook/"
  HomepageIsNewTabPage = 0
```

---

## Option 4 — Kiosk / dedicated shop-floor terminal

If a computer's only job is to be a handbook station:

### Microsoft Edge in kiosk mode
```
msedge.exe --kiosk "file://fileserver/shop/Handbook/Advanced_Handbook_Dashboard.html" --edge-kiosk-type=fullscreen --no-first-run
```

### Chrome in kiosk mode
```
chrome.exe --kiosk "http://intranet/handbook/" --no-first-run
```

Put that command line in a `.bat` file and drop it in the Startup folder:
```
shell:startup
```

---

## Updating the handbook content

The handbook text is stored inside the HTML file (look for `window.HANDBOOK_DATA` near the bottom). To publish a revision:

1. Edit or replace the file.
2. Drop the new file into the shared location, overwriting the old one.
3. Done. There is nothing to reinstall on the shop computers.

If you maintain the handbook in another system, generate a fresh HTML by replacing the `HANDBOOK_DATA` JSON block.

---

## Privacy and offline behavior

- **No external API.** The portal answers questions using only the handbook text embedded in the file.
- **No tracking.** No analytics, telemetry, cookies, or outbound requests are made when a user searches or browses.
- **Works offline.** The logo and all data are embedded as base64. Google Fonts are loaded as a *non-blocking* enhancement only; if a machine has no internet, the page falls back to system fonts (Segoe UI / Arial / Helvetica) and remains fully functional.
- **No installation required.** Just the one HTML file.

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| The logo doesn't show | The file may have been corrupted during copy. Re-copy `Advanced_Handbook_Dashboard.html` from the source. |
| The page looks unstyled / plain | Likely opened from inside a `.zip` archive or quarantined download. Extract first, then open. |
| Search returns no results for a known term | The term might be phrased differently in the handbook. Try a category instead, or contact HR to confirm coverage. |
| File opens in Notepad instead of a browser | Right-click → **Open With → Microsoft Edge** (or Chrome). Then check **"Always use this app to open .html files"**. |
| Looks bad on a small/tablet screen | The portal has a mobile layout but is designed for desktop. Try maximizing the window. |

---

## File checksum (optional integrity check)

To make sure the file copied to your network share is intact, run:
```powershell
Get-FileHash .\Advanced_Handbook_Dashboard.html -Algorithm SHA256
```
Record the hash when you first deploy, and verify it after each update.
