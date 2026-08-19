# AniVault - Search/API Fix

## What changed
- Frontend no longer calls Jikan directly.
- Frontend calls the deployed AniVault backend for top, trending, search, and details.
- Backend uses AniList as the single anime data source.
- AniList responses are normalized to the same Jikan-style shape already used by the React UI.
- Search now returns `data: []`, so the existing Home.jsx search rendering works correctly.
- Search works for anime already visible on Home and for anime outside the Home list.
- Backend has cache + retry handling.
- Backend listens on `0.0.0.0` and uses Render's `PORT`.
- Added `/health` route.

## Local frontend
From the project root:

```powershell
npm install
npm run dev
```

## Local backend
Open another terminal:

```powershell
cd backend
npm install
npm start
```

Backend local URL:
`http://localhost:10000`

If you want local frontend to use the local backend, create `.env.local` in the project root:

```env
VITE_BACKEND_URL=http://localhost:10000
```

For Vercel production, either keep the default Render URL in `src/services/animeApi.js` or set:

```env
VITE_BACKEND_URL=https://anivault-backend-b6z3.onrender.com
```

## Deploy
1. Push the project to GitHub.
2. Render backend should run `npm start` from the `backend` directory.
3. Vercel frontend should build with `npm run build` from the project root.
