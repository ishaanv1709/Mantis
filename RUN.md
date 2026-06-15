# Mantis — How to run

A full-stack diagnostic platform: **Next.js** frontend + **FastAPI** AI backend
(Moss sub-10ms retrieval + Groq Llama 3.3 70B + Whisper). Light, Mobbin-style UI.

## Prerequisites
- Node.js 20+
- Python 3.11
- (Already configured) Moss + Groq keys live in `backend/.env`

## 1) Start the AI backend (terminal 1)
```powershell
cd "D:\MOSS Hackathon\Mantis\backend"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
```
First boot seeds 4 demo product indexes into Moss (takes ~20s).
Check it: open http://localhost:8000 → should show `moss_enabled: true, groq_enabled: true`.

> Fresh machine? Create the venv once:
> ```powershell
> cd "D:\MOSS Hackathon\Mantis\backend"
> python -m venv .venv
> .\.venv\Scripts\python.exe -m pip install -r requirements.txt
> ```

## 2) Start the frontend (terminal 2)
```powershell
cd "D:\MOSS Hackathon\Mantis\frontend"
npm run dev
```
Open **http://localhost:3000**.

> Fresh machine? One-time setup:
> ```powershell
> cd "D:\MOSS Hackathon\Mantis\frontend"
> npm install
> npm run db:push
> npm run db:seed
> ```

## What works out of the box
- **Home** — Mobbin-style landing (morphing nav, hero, scroll mock, marquees, testimonials, FAQ).
- **Marketplace** + **Product pages** — browse/search, manuals, spare parts, recalls, ratings.
- **Assistant** (`/chat`) — the RAG technician: streaming answers, **voice** (Whisper), **photo** diagnosis, citations, DIY confidence score, safety warnings, spare-part & symptom autocomplete, 👍/👎 feedback.
- **Threads** — Reddit-style company communities with sub-threads, nested multi-user replies, image + voice posts, Official (company) badges, upvotes.
- **Dashboard** — User (inventory, maintenance, warranty/recall alerts, ratings) + Company (health score, star distribution, top problems, next-release recommendations).
- **PWA** — installable ("Add to Home Screen") in a production build.

## Optional
- **Clerk auth**: paste real keys into `frontend/.env` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`). Blank = guest mode (fully explorable).
- **Brand logos**: add a free Brandfetch client id to `NEXT_PUBLIC_BRANDFETCH_CLIENT_ID` in `frontend/.env` (logos fall back to lettered tiles otherwise).

## Security
`backend/.env` contains live Groq + Moss keys you pasted during the build — **rotate them** before sharing this repo.
