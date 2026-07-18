# Fireflies Clone — Meeting Notes & Transcription Platform

A functional clone of the Fireflies.ai meeting-assistant app, built for the Scaler SDE Fullstack assignment.

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** SQLite via SQLAlchemy ORM

Real audio transcription is out of scope (per the assignment). Transcripts/summaries are seeded or can be pasted/uploaded as plain text and are parsed into structured, timestamped segments server-side.

---

## 🔗 Live links

| | |
|---|---|
| **Live app** | [https://fireflies-clone-app.vercel.app](https://fireflies-clone-app.vercel.app/) |
| **Backend API** | [https://fireflies-clone-app.onrender.com](https://fireflies-clone-app.onrender.com) |
| **API docs (Swagger)** | [https://fireflies-clone-app.onrender.com/docs](https://fireflies-clone-app.onrender.com/docs) |
| **GitHub repo** | [https://github.com/chulparyuvraj/fireflies-clone-app](https://github.com/chulparyuvraj/fireflies-clone-app) |

> **Note:** the backend runs on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after idling can take 30–50 seconds to wake up — if the dashboard looks stuck loading the first time, that's why. It resolves itself after that first request.
>
> Also see the data-persistence note in Section 8 — Render's free tier has an ephemeral filesystem, so CRUD changes may reset to the 4 seeded meetings if the service restarts.

---

## 1. Quick start (local development)

The live deployed links are above — this section is only needed if you want to run it locally (e.g. for the evaluation interview to show live code changes).

You need **Python 3.10+** and **Node.js 18+** installed. Two terminals, one for each service.

### Backend (FastAPI)

```bash
cd backend
python -m venv venv

# activate it
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows

pip install -r requirements.txt

# seed the database (creates backend/fireflies.db with 4 sample meetings)
python -m app.seed

# run the API
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`.

### Frontend (Next.js)

```bash
cd frontend
npm install

# points the frontend at the backend — already set in .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Open `http://localhost:3000`.

> Re-running `python -m app.seed` at any point wipes and re-seeds the 4 sample meetings — safe to do if your local data gets messy while testing CRUD.

### Production build (optional, mirrors what's deployed)

```bash
# backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# frontend
cd frontend
npm run build
npm run start
```

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js 16 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4 |
| Backend framework | FastAPI + Uvicorn |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite (file-based, `backend/fireflies.db`) |
| Validation | Pydantic v2 |

No external UI kit is used — all components are hand-built to match Fireflies' visual language (dark indigo sidebar, purple accent `#5b4fe9`, light workspace background).

---

## 3. Architecture overview

```
frontend/                       Next.js app (App Router)
  app/
    page.tsx                    Meetings library / dashboard
    meeting/[id]/page.tsx       Meeting detail (player + transcript + summary + action items)
    layout.tsx                  Root layout (sidebar + toast provider)
  components/
    Sidebar.tsx                 Left nav (Fireflies-style)
    MediaPlayer.tsx             Seek bar + waveform placeholder, drives playback clock
    TranscriptPanel.tsx         Searchable, speaker-labeled, timestamped transcript
    SummaryPanel.tsx            AI summary + outline/chapters (jump-to-timestamp)
    ActionItemsPanel.tsx        Action item CRUD + complete toggle
    NewMeetingModal.tsx         Create meeting (form / paste transcript / upload file)
    EditMeetingModal.tsx        Edit meeting metadata
    ConfirmDialog.tsx           Reusable delete confirmation
    ToastProvider.tsx           Global toast notifications
  lib/
    api.ts                      Typed fetch client for the FastAPI backend
    types.ts                    Shared TypeScript interfaces (mirrors Pydantic schemas)
    format.ts                   Date / duration / timestamp / initials helpers

backend/
  app/
    main.py                     FastAPI app + all route definitions
    models.py                   SQLAlchemy ORM models
    schemas.py                  Pydantic request/response schemas
    crud.py                     DB query/mutation logic (search, filters, sort, CRUD)
    transcript_parser.py        Parses "Speaker [hh:mm:ss]: text" lines into segments
    seed.py                     Seeds 4 realistic sample meetings with full transcripts
    database.py                 SQLAlchemy engine/session setup
  fireflies.db                  SQLite database file (generated by seed.py)
  requirements.txt
```

### How the transcript ↔ player sync works
`MeetingDetailPage` holds a single `currentTime` state value.
- The **player**'s seek bar and a simulated playback clock (`setInterval`) update `currentTime`.
- The **transcript panel** derives the "active" segment by finding the last segment whose `start_time <= currentTime`, and highlights it.
- Clicking any transcript line, or any topic in the outline, calls the same `onSeek(time)` callback, which sets `currentTime` — so the player's seek bar jumps too.

This keeps the sync logic in one place instead of duplicating it across the player and transcript components.

### Search
- **Per-meeting transcript search** (`TranscriptPanel`) filters segments client-side and highlights matches — instant, no network round-trip.
- **Global search** (`GET /api/search?q=...`) is implemented server-side (bonus feature) and returns matching transcript lines across *all* meetings with the meeting title, speaker, and timestamp, ready to wire into a global search UI.
- **Meetings library search/filter/sort** (`GET /api/meetings?q=&participant=&sort=`) is server-side, so it scales to large meeting libraries instead of shipping the whole dataset to the client.

---

## 4. Database schema

```
participants                    meetings                          meeting_participants (join table)
─────────────                   ────────                          ──────────────────────
id (PK)                         id (PK)                            meeting_id (FK)
name                             title                              participant_id (FK)
email                            date
avatar_color                     duration_seconds
                                  audio_url
                                  created_at / updated_at

transcript_segments              summaries                         topics
────────────────────             ─────────                         ──────
id (PK)                          id (PK)                            id (PK)
meeting_id (FK → meetings)       meeting_id (FK, unique)             meeting_id (FK → meetings)
speaker_name                     overview (text)                    title
start_time / end_time                                                timestamp (seconds)
text                                                                  order_index
order_index

action_items
────────────
id (PK)
meeting_id (FK → meetings)
text
assignee
completed (bool)
created_at
```

**Relationships**
- `meetings` ↔ `participants` — many-to-many via `meeting_participants`.
- `meetings` → `transcript_segments`, `topics`, `action_items` — one-to-many, cascade delete.
- `meetings` → `summary` — one-to-one, cascade delete.

Deleting a meeting cascades and removes all of its transcript segments, summary, topics, and action items — keeping the dataset consistent without orphaned rows.

---

## 5. API overview

All endpoints are prefixed `/api`. Full interactive reference at `/docs` (Swagger UI) once the backend is running.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/meetings` | List meetings. Query params: `q`, `participant`, `date_from`, `date_to`, `sort` (`recent`/`oldest`/`title`) |
| POST | `/api/meetings` | Create a meeting — from a form only, a pasted transcript, or an uploaded transcript file (parsed server-side) |
| GET | `/api/meetings/{id}` | Full meeting detail: participants, transcript, summary, topics, action items |
| PUT | `/api/meetings/{id}` | Update title / date / participants |
| DELETE | `/api/meetings/{id}` | Delete a meeting (cascades) |
| POST | `/api/meetings/{id}/action-items` | Add an action item |
| PUT | `/api/action-items/{id}` | Update / complete an action item |
| DELETE | `/api/action-items/{id}` | Remove an action item |
| GET | `/api/search?q=` | Global search across all transcripts |
| GET | `/api/health` | Health check |

---

## 6. Features implemented

**Core (all required features)**
- ✅ Meetings library with search, filter by participant, sort by recency/title/oldest
- ✅ Meeting detail view: seek-bar player (placeholder media), speaker-labeled + timestamped transcript
- ✅ Clicking a transcript line seeks the player, and vice versa
- ✅ In-transcript search with highlighted matches
- ✅ AI summary section + outline/chapters (jump-to-timestamp)
- ✅ Action items: add / complete / delete, assignee field
- ✅ Full CRUD on meetings (create via form, pasted transcript, or uploaded `.txt`/`.vtt`; edit metadata; delete)
- ✅ Toast notifications, modals, empty/loading states
- ✅ Seeded database with 4 full sample meetings

**Bonus**
- ✅ Global search endpoint across all meeting transcripts (`/api/search`)
- ⏳ Export, comments/highlights, tags, LLM Q&A chat, dark mode — left as "Coming soon" placeholders in the UI, per the assignment's allowance for mocked bonus sections

**Explicitly mocked / placeholder (per assignment spec)**
- Real-time meeting bot, live speech-to-text, calendar/Zoom/CRM integrations, team collaboration, and real authentication (a single default user is assumed) all show a "Coming soon" placeholder rather than being implemented.

---

## 7. Assumptions

- No authentication — a single default logged-in user is assumed, matching the assignment's allowance to skip real auth.
- Playback is simulated: there's no real audio/video file, so `MediaPlayer` runs a client-side clock (`setInterval`) that advances `currentTime`, which drives the waveform-style seek bar and transcript highlighting. Swapping in a real `<audio>`/`<video>` element only requires replacing the clock with the element's `timeupdate` event — the rest of the sync logic (`onSeek`, `activeId`) is already decoupled from *how* time advances.
- Transcript upload/paste expects the line format `Speaker Name [hh:mm:ss]: text`; unmatched lines are skipped. This was chosen over JSON/VTT parsing for speed, but the parser (`transcript_parser.py`) is isolated so a VTT/JSON parser could be swapped in without touching the rest of the app.
- Summaries and topics are stored as seeded/pasted plain text rather than calling a live LLM, per the assignment's note that this can be mocked.
- CORS is fully open (`allow_origins=["*"]`) for local development/evaluation convenience — would be locked down to the deployed frontend origin in production.

---

## 8. Deploying it (Render + Vercel)

✅ **Already deployed** — see the live links at the top of this README. The steps below document how it was done, for reference or if redeploying elsewhere.

The repo already includes `backend/Procfile` and `backend/render.yaml` for Render, and the frontend needs zero code changes — just one environment variable on Vercel's side.

### Step 1 — Push to GitHub
```bash
cd fireflies-clone
git init
git add .
echo "venv/\nnode_modules/\n.next/\n__pycache__/\n*.pyc" > .gitignore
git commit -m "Fireflies clone — SDE assignment"
git branch -M main
git remote add origin https://github.com/chulparyuvraj/fireflies-clone-app.git
git push -u origin main
```

### Step 2 — Backend on Render
1. Go to [render.com](https://render.com) → **New → Web Service** → connect your GitHub repo.
2. Set **Root Directory** to `backend`.
3. Build command: `pip install -r requirements.txt && python -m app.seed`. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Add environment variable `PYTHON_VERSION` = `3.11.9` (Render defaults to a newer Python that lacks pre-built wheels for `pydantic-core`, causing a Rust/maturin build failure — pinning to 3.11.9 avoids that).
5. Deploy. Live at `https://fireflies-clone-app.onrender.com`.
6. Sanity check: `https://fireflies-clone-app.onrender.com/api/health` → `{"status":"ok"}`.

### Step 3 — Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the same GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Add an environment variable: `NEXT_PUBLIC_API_URL` = `https://fireflies-clone-app.onrender.com` (no trailing slash).
4. Deploy. Vercel auto-detects Next.js — no build command changes needed. Live at `https://fireflies-clone-app.vercel.app`.

### Step 4 — Verify end-to-end
Open the deployed Vercel URL, confirm the seeded meetings load, open one, and check the transcript/player sync and action items work against the live Render backend.

If you'd rather use Railway instead of Render, or Netlify instead of Vercel, the same two steps apply — just swap the platform; no code changes are needed since `NEXT_PUBLIC_API_URL` and CORS (`allow_origins=["*"]`) are already environment-driven.

> **Note on data persistence:** Render's free-tier web services use an ephemeral filesystem — the SQLite file resets to the seeded 4 meetings whenever the service restarts or redeploys (which can happen after idling). CRUD changes made by an evaluator will persist during a session but may reset later. For a fully persistent demo, either add a Render persistent disk to `render.yaml`, or swap SQLite for Render's free managed Postgres and point `SQLALCHEMY_DATABASE_URL` in `database.py` at it. Worth mentioning proactively in the evaluation interview so it doesn't look like a bug.

