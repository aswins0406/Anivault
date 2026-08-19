# AniVault – correct local run

Open this `Animeverse` folder in VS Code. Do NOT open the nested `frontend` folder as the only project.

## Terminal 1 – backend
```bash
cd backend
npm install
npm start
```
Expected: `AniVault Backend running on 0.0.0.0:10000`

Test: http://localhost:10000/

## Terminal 2 – frontend
From the `Animeverse` root:
```bash
npm install
npm run dev
```
Open http://localhost:5173/

The frontend now ALWAYS uses `http://localhost:10000` when running on localhost, even if an old `.env` contains port 5000.
