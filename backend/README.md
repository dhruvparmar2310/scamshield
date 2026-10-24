# CyberMentis — Backend (FastAPI)

CyberMentis's Python backend analyzes suspicious messages and URL strings for **warning signs**, returning an explainable report. The checks are educational, not a guarantee that a message or website is safe.

## Technology

- Python 3.9+ (the project has been developed using Python 3.9.6)
- FastAPI
- Uvicorn (ASGI development server)
- Python standard library (`re`, `ipaddress`, `urllib.parse`, etc.) for detection

## Expected project layout

```text
CyberMentis/
├── backend/
│   ├── README.md                 # This file
│   ├── requirements.txt          # Python dependencies
│   ├── .venv/                    # Local virtual environment; do not commit
│   └── app/
│       ├── __init__.py           # If present
│       ├── main.py               # FastAPI app entry point (verify filename)
│       ├── detector.py           # Message and shared URL detection rules
│       └── url_checker.py        # Standalone URL checker
└── frontend/
```

> **Check your actual entry point.** The startup command below assumes `backend/app/main.py` contains `app = FastAPI()`. If your FastAPI instance is in another module, replace `app.main:app` accordingly. Additional route/schema files may exist in your project.

## 1. Open the backend folder

From the CyberMentis project root:

```bash
cd backend
```

## 2. Create and activate a virtual environment

On macOS / Linux:

```bash
python3 --version
python3 -m venv .venv
source .venv/bin/activate
```

On Windows PowerShell:

```powershell
py -3 -m venv .venv
.venv\Scripts\Activate.ps1
```

Once activated, `python` and `pip` refer to the project's isolated environment. Run `deactivate` to exit it.

## 3. Install dependencies

If your project already has a `requirements.txt`, use it:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If `requirements.txt` is missing, the minimum development dependencies for the described backend are:

```bash
python -m pip install "fastapi==0.115.12" "uvicorn==0.34.2"
```

Then create and maintain `requirements.txt` with your actual dependencies. The versions above reflect a previously working setup, not a guarantee that all future project features need only those two packages. Avoid committing `.venv/`.

## 4. Start the development server

From **inside `backend/`**, with the virtual environment active:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Expected local URLs:

- API: http://127.0.0.1:8000
- Interactive Swagger documentation: http://127.0.0.1:8000/docs
- OpenAPI schema: http://127.0.0.1:8000/openapi.json

`--reload` restarts the server when Python source files change. **Use it only during development.** Press `Ctrl+C` to stop the server.

## 5. Test the APIs

The current frontend calls these endpoints:

| Method | Path             | JSON request body                                             |
| ------ | ---------------- | ------------------------------------------------------------- |
| POST   | `/api/analyze`   | `{"message":"Your account will be blocked. Share your OTP."}` |
| POST   | `/api/url-check` | `{"url":"http://192.168.1.1"}`                                |

Use Swagger at `/docs` or test in a second terminal:

```bash
curl -X POST 'http://127.0.0.1:8000/api/analyze' \
  -H 'Content-Type: application/json' \
  -d '{"message":"Your account will be blocked. Share your OTP."}'

curl -X POST 'http://127.0.0.1:8000/api/url-check' \
  -H 'Content-Type: application/json' \
  -d '{"url":"http://192.168.1.1"}'
```

Typical response fields include `verdict`, `risk_score`, `findings`, and `disclaimer`. The URL checker also returns URL metadata; the message checker returns extracted URLs. The precise response shape depends on the installed version of your route and detector files.

## How the backend works

1. A frontend form sends JSON to a FastAPI endpoint.
2. The endpoint validates the request and invokes the appropriate checker.
3. `detector.py` looks for suspicious wording and examines URL structure.
4. `url_checker.py` normalizes standalone URL input and reuses the shared URL detector.
5. The backend returns a preliminary verdict, heuristic score, findings, and safety guidance.

### IP address checks

The enhanced detector can classify **literal IP-address hosts** as public, private, loopback, link-local, or special-use. These categories describe address usage, **not whether the host is malicious**. A hostname can resolve to an internal IP even when its URL contains no literal IP; detecting that requires separate, carefully secured DNS checks.

### Privacy and security

- The described URL analysis inspects URL text; it **does not visit the target website**, resolve DNS, or query a live threat database.
- Do not submit passwords, OTPs, banking information, or other secrets.
- Do not claim zero data retention without reviewing server, proxy, hosting, and access logs.
- If live URL fetching is added later, implement SSRF protection, redirect controls, DNS/IP validation, timeouts, and resource limits first.
- Scores are **heuristics, not calibrated probabilities**. No warning does not mean a URL or message is safe.

## Troubleshooting

**`ModuleNotFoundError: No module named 'fastapi'`** — Activate `.venv` and install the dependencies.

**`Error loading ASGI app. Could not import module "app.main"`** — Ensure you are in `backend/` and verify the actual module containing `app = FastAPI()`.

**Port 8000 is already in use** — Stop the previous server or choose another port, then update `NEXT_PUBLIC_CyberMentis_API_URL` in the frontend.

**Browser reports CORS errors** — Configure FastAPI `CORSMiddleware` to allow your actual frontend origin (usually `http://localhost:3000` during development). Do not use unrestricted origins with credentials.

**Changes do not appear** — Confirm the active server process uses the correct Python environment and project directory.

## Running backend and frontend together

Use **two terminals**. Start FastAPI from `backend/` on port 8000, then start Next.js from `frontend/` on port 3000. See `frontend/README.md` for the frontend setup.
