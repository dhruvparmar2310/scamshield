# CyberMentis — Frontend (Next.js)

CyberMentis is a cybersecurity awareness interface for checking suspicious messages and URLs. The frontend is built with **Next.js Pages Router**, **JavaScript**, and **SCSS**. It sends analysis requests to the FastAPI backend.

## Technology

- Node.js and npm (the project has been developed with Node.js 22.23.1)
- Next.js 14 Pages Router
- React and JavaScript (no TypeScript required)
- SCSS with a shared `main.scss` imported from `pages/_app.js`
- Native `fetch()` for API requests

## Expected project layout

```text
CyberMentis/
├── backend/
└── frontend/
    ├── README.md                  # This file
    ├── package.json
    ├── package-lock.json          # If using npm
    ├── .env.local                 # Local environment variables; do not commit
    ├── pages/
    │   ├── _app.js                # Imports the single global SCSS entry point
    │   ├── index.js               # Main CyberMentis interface
    │   └── privacy-policy.js      # If added
    ├── components/
    │   └── URLSafetyChecker.jsx   # URL checker UI (if using this file layout)
    ├── services/
    │   └── CyberMentisApi.js       # Shared backend API calls
    └── styles/
        ├── main.scss              # Imports global/page SCSS
        └── _variables.scss        # Theme tokens (adjust to actual filename)
```

> This tree is illustrative. Keep your existing folders, filenames, and components; do not move files just to match the README.

## 1. Open the frontend folder

From the CyberMentis project root:

```bash
cd frontend
node --version
npm --version
```

## 2. Install dependencies

If `package-lock.json` is committed, use the reproducible install command:

```bash
npm ci
```

Otherwise:

```bash
npm install
```

Install `sass` only if it is not already present in your dependencies:

```bash
npm install sass
```

Next.js compiles `.scss` files when `sass` is installed. You do not need a separate Sass watcher.

## 3. Configure the backend URL

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_CyberMentis_API_URL=http://127.0.0.1:8000
```

The existing `services/CyberMentisApi.js` reads this variable and otherwise falls back to `http://127.0.0.1:8000`.

**Important:** Variables beginning with `NEXT_PUBLIC_` are included in browser-side code. Never place API secrets, private tokens, or passwords in them. Restart the Next.js server after changing `.env.local`.

## 4. Start the development server

From **inside `frontend/`**:

```bash
npm run dev
```

Open http://localhost:3000.

For message and URL analysis to work, the FastAPI backend must also be running at the configured URL. The UI may render without the backend, but analysis requests will fail.

Stop the Next.js server with `Ctrl+C`.

## 5. Available npm commands

These are the usual Next.js scripts. Verify that your `package.json` defines them:

```bash
npm run dev       # Start local development server
npm run build     # Create production build
npm run start     # Run the production build
npm run lint      # Run linting, only if this script exists
```

Typical `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

Do not overwrite existing scripts or dependencies unnecessarily.

## How frontend requests work

`services/CyberMentisApi.js` exposes:

```javascript
analyzeMessage(message) // POST /api/analyze with { message }
checkUrl(url) // POST /api/url-check with { url }
```

Both requests are sent as JSON using `fetch()`. Errors are displayed to the user by the calling UI components.

### Main tools

**Message Checker:** Paste an SMS, chat message, or email text to review suspicious wording and any URLs found in it.

**URL Safety Checker:** Enter a URL to inspect structural warning signs, such as missing HTTPS, IP-address hosts, unusual subdomains, and potentially misleading URL syntax.

Neither tool guarantees safety or checks a live malware database. Avoid entering passwords, OTPs, or private account details.

## SCSS conventions

Use the project's existing theme variables, including:

```scss
$color-bg: #090b12;
$color-surface: #10131d;
$color-text: #f4f5fb;
$color-muted: #969caf;
$color-accent: #a78bfa;
$color-accent-strong: #8b5cf6;
```

Maintain the existing convention of importing a **single** global SCSS entry point in `pages/_app.js`:

```javascript
import '../styles/main.scss'
```

Use `rem` units for spacing and dimensions, consistent with the current design system. Avoid importing global SCSS independently into each page.

## Production build

```bash
npm run build
npm run start
```

Before deployment, set `NEXT_PUBLIC_CyberMentis_API_URL` to the public **HTTPS** backend URL, rebuild the frontend, and configure backend CORS for the deployed frontend origin. A browser on a visitor's device cannot use your development machine's `127.0.0.1:8000` endpoint.

## Troubleshooting

**`Unable to connect to CyberMentis`** — Start FastAPI, confirm its port, and check `NEXT_PUBLIC_CyberMentis_API_URL`.

**CORS error in browser console** — Allow the frontend origin in the backend's FastAPI CORS configuration.

**`Sass` or `.scss` compilation error** — Run `npm install sass` and verify your SCSS import paths and variable definitions.

**`npm run dev` fails** — Check Node.js version, install dependencies, and inspect `package.json` scripts.

**Port 3000 already in use** — Stop the previous Next.js process or use `npm run dev -- -p 3001` (if your script runs `next dev`). Update backend CORS to include the new origin.

**API requests fail only after deployment** — Verify the public backend URL, HTTPS, CORS, hosting availability, and environment variables at build time.

## Local development quick start

Open two terminal windows:

**Terminal A — Backend**

```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal B — Frontend**

```bash
cd frontend
npm install
npm run dev
```

Then visit http://localhost:3000 and test both checkers. If you haven't created the backend virtual environment yet, follow `backend/README.md` first.
