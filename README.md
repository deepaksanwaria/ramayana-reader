# श्री वाल्मीकि रामायण — Reader V9

V9 is ready for Azure Static Web Apps.

It uses the actual JSON schema:
`kaanda`, `sarg`, `shloka`, `text`

Audio removes source identifiers such as `॥१-१-३॥` using the current Sarga and Shloka metadata, while keeping the displayed text unchanged.

## Local
```bash
python -m http.server 8000
```

## Azure
Deploy the contents of this folder as a static website. No Python server is required in production.

## V10
- Added the supplied Ram hero image under `assets/ram-hero.webp`.
- Added a responsive hero/cover section to the home screen.
