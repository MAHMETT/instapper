<p align="center">
  <img src="public/logo.png" alt="Instapper logo" width="96" height="96" />
</p>

<h1 align="center">instapper</h1>

<p align="center"><strong>Grab thumbnails. Instantly.</strong></p>

<p align="center">
  <a href="https://github.com/MAHMETT/instapper/releases"><img alt="Latest release" src="https://img.shields.io/github/v/release/MAHMETT/instapper?color=635BFF&label=release" /></a>
  <a href="https://github.com/MAHMETT/instapper/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/MAHMETT/instapper?color=4AE3B5" /></a>
  <img alt="Chrome MV3" src="https://img.shields.io/badge/chrome-MV3-4285F4?logo=googlechrome&logoColor=white" />
  <img alt="Firefox" src="https://img.shields.io/badge/firefox-supported-FF7139?logo=firefoxbrowser&logoColor=white" />
</p>

<p align="center">
  <img alt="WXT" src="https://img.shields.io/badge/WXT-0.21-22D3EE" />
  <img alt="Svelte" src="https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Biome" src="https://img.shields.io/badge/Biome-2-60A5FA" />
</p>

Instapper is a friendly browser extension that grabs image thumbnails from Instagram hashtag and profile pages, then lets you export them — either as a CSV of links or as a ZIP full of the actual image files.

No account, no server, no telemetry. Everything runs locally in your browser.

---

## Features

- **Auto scroll & scrape** — Instapper scrolls the page for you and collects thumbnails as they load.
- **Smart and quiet** — it watches the page for new images instead of blindly hammering it.
- **No duplicates** — every thumbnail is stored once, even if Instagram shows it twice.
- **Always in sync** — the counter updates live while scraping, and your data survives a popup close.
- **Export CSV** — a clean list of image links, handy for scripts or spreadsheets.
- **Export ZIP** — downloads the images themselves, bundled into a single archive.
- **One format in the archive** — every thumbnail is converted to PNG or JPEG on export (images already in that format are kept as-is). Pick the target in **Settings**.
- **Date range filter** — narrow thumbnails by post date: last 1/3/6/8/12 months, all dates, or a custom from/to range (defaults to the last 8 months, and is remembered between sessions). The counter shows in-range over total, and scraping stops on its own once it scrolls past the range. Thumbnails whose post date can't be determined are always kept.
- **Optional sort on export** — choose per export whether the ZIP stays flat or groups files into `YYYY-MM/` folders, oldest first.
- **English & Indonesian** — the interface ships in Indonesian by default. Switch languages in **Settings** and it applies immediately, everywhere, and is remembered.
- **Light & dark** — a proper theme toggle, dark by default.
- **Chrome, Firefox & Safari** — one codebase, three browsers, via WXT.

## Download

Grab a ready-to-use build from the [**Releases page**](https://github.com/MAHMETT/instapper/releases):

- Chrome / Edge — `instapper-1.2.0-chrome.zip`
- Firefox — `instapper-1.2.0-firefox.zip`
- Safari — `instapper-1.2.0-safari.zip`

> Replace `1.2.0` with the latest version shown on the Releases page.

These aren't on the official stores yet, so "installing" just means unzipping and loading the folder. It takes about a minute.

## Install

### Chrome / Edge

1. Download and unzip the Chrome build.
2. Open `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the unzipped folder.
5. Pin Instapper to your toolbar and you're set.

### Firefox

1. Download and unzip the Firefox build.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…** and pick `manifest.json` inside the unzipped folder.

## Usage

1. Open Instagram and log in.
2. Go to a hashtag page (like `instagram.com/explore/tags/photography/`) or a profile page.
3. Click the Instapper icon in your toolbar.
4. Hit **Auto Scroll & Scrape** — the page starts scrolling and the counter climbs.
5. Click **Stop Scrolling** once you've collected enough.
6. Export what you need:
   - **Download CSV** → a list of image links.
   - **Export ZIP** → the actual image files, zipped up.

> **Heads up:** Instagram image links expire after a while. Export soon after scraping. If a few images fail, Instapper skips them and tells you how many made it.

## Build from source

You'll need [Bun](https://bun.sh) installed.

```bash
git clone https://github.com/MAHMETT/instapper.git
cd instapper
bun install

# development (Chrome, with hot reload)
bun run dev
bun run dev:firefox

# production build
bun run build
bun run build:firefox

# packaged zips
bun run zip
bun run zip:firefox
```

Handy extras:

```bash
bun run check      # type-check Svelte + TypeScript
bun run lint       # Biome lint + format check
bun run lint:fix   # auto-fix what's safe
bun run icons      # regenerate icons from logo.png
```

Pre-commit and pre-push hooks are wired up with [Lefthook](https://lefthook.dev), so formatting and type-checking run automatically.

## Tech stack

- [WXT](https://wxt.dev) + [Svelte 5](https://svelte.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [bits-ui](https://bits-ui.com) for the UI
- [`@webext-core/messaging`](https://webext-core.aklinker1.io/messaging/) for typed cross-context messaging
- [fflate](https://github.com/101arrowz/fflate) for client-side ZIP creation
- [Biome](https://biomejs.dev) + [Lefthook](https://lefthook.dev) for linting and git hooks
- Self-hosted [Sora](https://fontsource.org/fonts/sora), [Inter](https://fontsource.org/fonts/inter), and [JetBrains Mono](https://fontsource.org/fonts/jetbrains-mono)

## Project structure

```text
src/
├── entrypoints/
│   ├── background.ts        # download handling (CSV)
│   ├── content.ts           # scraping engine that runs on instagram.com
│   └── popup/               # the Svelte popup UI
└── lib/
    ├── components/          # popup UI components
    ├── export.ts            # fetch images → zip → download
    ├── scraper.ts           # DOM scraping + de-duplication
    ├── auto-scroller.ts     # MutationObserver-driven scrolling
    ├── storage.ts           # shared chrome.storage item
    ├── messaging.ts         # typed message contract
    └── theme.ts             # light/dark theme handling
```

## Contributors

<p>
  <a href="https://github.com/andikadevs"><img src="https://github.com/andikadevs.png" width="64" height="64" alt="andikadevs" /></a>
  <a href="https://github.com/MAHMETT"><img src="https://github.com/MAHMETT.png" width="64" height="64" alt="MAHMETT" /></a>
</p>

- [@andikadevs](https://github.com/andikadevs) — built the original extension
- [@MAHMETT](https://github.com/MAHMETT) — WXT + Svelte rewrite and ongoing maintenance

Contributions, issues, and ideas are always welcome. Open an issue or send a PR.

## Disclaimer

Instapper is not affiliated with, endorsed by, or connected to Instagram or Meta. Use it responsibly, respect Instagram's terms, and only download content you have the right to use.

---

<p align="center"><sub>Grab thumbnails. Instantly.</sub></p>
