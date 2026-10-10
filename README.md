# Anisha & Harjeet — Wedding Invitation

A static, mobile-first wedding invitation. Plain HTML, CSS and JavaScript:
no backend or npm dependencies (Google Fonts is the only external request).

```
index.html            page structure and all wording
css/style.css         colours (top of file), layout, animations
js/main.js            envelope opening, countdown, timeline rose, calendar, music
js/garden.js          lake refraction, bird approach, wakes, automatic visibility pauses
assets/art/           realistic garden photograph, bird sprite, botanical cutouts
assets/art/couple-cutout.png  supplied couple portrait (finale)
assets/gurudwara.svg  Gurudwara illustration (Anand Karaj section)
assets/music-wedding.mp3  audio extracted from the supplied Wedding.mov
assets/cal/*.ics      Apple / Outlook calendar files
assets/og-image.png   WhatsApp / social link preview
assets/favicon.png   64px icon derived from the A & H wax seal
assets/apple-touch-icon.png  180px icon derived from the same wax seal
```

## Run locally

```bash
npm start
```

Then open http://127.0.0.1:5173. No `npm install` is needed. Use a current Node.js LTS
release. If port 5173 is busy, use `PORT=5174 npm start`.

To preview the exact published files: `npm run build`, then `npm run preview`.

## Deploy

GitHub Pages hosts this frontend for free from a **public repository**. No hosting
account, server, paid service, deployment token, or custom domain is required.

1. Put the **contents of this `website` folder at the root of your GitHub repository**,
   including the hidden `.github` folder. The current local parent repository contains
   other projects; upload only this invitation to its own repository.
2. In **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**.
3. Push to the repository's default branch (or run the included workflow from Actions).
   The workflow builds `dist/` and publishes it automatically. Future pushes deploy too.

Your address will be `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
All assets and calendar links use relative paths and work at this repository sub-path.
The workflow also sets the absolute social preview image URL automatically.
The build publishes only frontend assets, excluding local previews and configuration;
the deploy job uses GitHub's short-lived identity rather than a stored secret.

See [GitHub's Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

When you change CSS or JS, bump the `?v=` number on the two links in `index.html`
so guests' phones don't keep a cached copy.

## Opening card and music

The ivory envelope uses photographic cotton-paper texture, sculpted botanical
embossing, and independent flap layers. A transparent burgundy wax seal carries
raised gold **A & H** calligraphy. Both assets were created with built-in ImageGen;
their prompts are in `assets/art/PROMPTS.md`.

The music is extracted from the user-supplied **Wedding.mov** into an audio-only
MP3 file without re-encoding the original audio. It is served locally, starts
after the guest opens the envelope, fades
in, loops, and can be paused with the music button. The video is not shipped.

## Editing details

- **Wording, names, venues, map links:** `index.html`.
- **Countdown and calendar times:** the `EVENTS` object at the top of `js/main.js`
  (all times in IST, `+05:30`). If you change a time, also update `assets/cal/*.ics`
  (those times are in UTC: IST minus 5:30).
- **Colours:** the `:root` variables at the top of `css/style.css`.

## Living garden artwork

The landing scene is built from a realistic garden photograph and an independent
transparent bird sprite. The birds approach each other over 14 seconds, then drift
gently with reflected images and expanding wakes. Canvas refracts the lake in fine
horizontal bands; its resolution is capped at 720 pixels wide and updates at up to
30 fps. No video, animation library, backend, or external image requests are needed.

Rendering pauses while the garden is offscreen or the browser tab is hidden. The operating system's
reduced-motion preference is respected, including changes made while the page is open.

| File | Used for |
|---|---|
| `assets/art/hero.jpg` | Carved ivory arch, garden, lake, sunrise; optimized JPEG |
| `assets/art/swan.png` | Two independently moving birds and their reflections; transparent PNG |
| `assets/art/flowers-corner.png` | Matching realistic flowers on invitation and event cards; transparent PNG |
| `assets/gurudwara.svg` | Existing Gurudwara illustration |
| `assets/art/couple-cutout.png` | Cleaned transparent couple cutout with narrow CSS edge blending |

Garden and floral artwork was generated with the built-in ImageGen tool. The closing
portrait was supplied by the user. Its background was extracted with built-in ImageGen;
the transparent PNG blends into the paper with a narrow side fade and a soft lower fade. The final generation prompts
are saved in [assets/art/PROMPTS.md](assets/art/PROMPTS.md). SVG scene fallbacks remain
available if the main image cannot load. All original invitation wording is preserved.
