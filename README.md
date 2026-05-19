# Advanced Companies — Employee Handbook Portal

A single-file, self-contained internal web portal for the Advanced Companies employee handbook. Built so any shop employee can open it from any computer in the building, search policies in plain English, and get an answer drawn directly from the handbook text.

## Features

- **Plain-English search.** "How much PTO do I get?", "What is the dress code?", "When do I get paid?" — full questions, not just keywords.
- **Answers from the handbook only.** The portal extracts the most relevant sentences from the matching section and shows them as a short answer. It never invents policy.
- **Section references on every answer.** Every match cites the handbook section number and title so employees can verify.
- **Low-confidence safeguard.** If the handbook does not clearly answer the question, the portal says so and tells the employee to contact HR.
- **Category browsing.** Sidebar shows all policy categories with section counts.
- **Highlighted matches.** Query terms are highlighted in the answer summary and section body.
- **Works offline.** Everything — including the logo — is embedded in the HTML. Google Fonts load only as a non-blocking enhancement; the page falls back to system fonts gracefully.
- **Privacy by design.** No tracking, no external API calls, no data leaves the computer.
- **Printable.** Built-in print stylesheet renders a clean handout if an employee wants a paper copy of a section.
- **Keyboard friendly.** `/` focuses search, `Enter` asks, `Esc` clears.

## Files

| File | Purpose |
| ---- | ------- |
| `Advanced_Handbook_Dashboard.html` | The portal — open it directly in any browser. |
| `DEPLOYMENT_NOTES.md` | Detailed deployment instructions (network drive, IIS, nginx, kiosk). |
| `README.md` | This file. |

## Quick start (local)

Double-click `Advanced_Handbook_Dashboard.html`. That's it. It runs in any modern browser (Edge, Chrome, Firefox, Safari) without any setup.

## Deployment

See [`DEPLOYMENT_NOTES.md`](DEPLOYMENT_NOTES.md) for the full guide. The short version:

1. Copy `Advanced_Handbook_Dashboard.html` to a shared network drive.
2. Create a desktop shortcut on each shop computer pointing to that file.
3. (Optional) Set it as the browser homepage for shop-floor PCs.

Updating the handbook is a one-file swap — replace the file at the shared location and every computer sees the new version on next open.

## Browser support

Tested on the current versions of Microsoft Edge, Chrome, Firefox, and Safari. The portal uses only standard HTML, CSS, and JavaScript with no build step or external libraries.

## Editing the handbook content

The handbook text lives inside `Advanced_Handbook_Dashboard.html` as a `window.HANDBOOK_DATA` JSON object at the bottom of the file (look for the `<script id="handbook-data-script">` tag). Each section has the following fields:

```jsonc
{
  "id": "4.2",                 // Section number (or "OK-..." for Oklahoma supplements)
  "title": "Vacation / PTO",   // Heading
  "group": "Time Off",         // Display group (optional)
  "category": "Benefits & Leave", // Sidebar category
  "state": null,                // null, "Oklahoma", etc.
  "content": "Markdown-ish body..."
}
```

The content field supports a small markdown subset: `**bold**`, `*italic*`, `-` bullets, and `1.` numbered lists.
