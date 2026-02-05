# Production Deployment (Recommended)

## Recommended stack
- **Frontend**: Vercel (static React)
- **Backend**: Render (Node/Express) with **persistent disk** for SQLite

This keeps the current SQLite database and requires minimal changes.

---

## 1) Deploy Backend (Render)

1. Create a new **Web Service** on Render and connect the **backend** folder.
2. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
   - **Auto-Deploy**: On
3. Add a **Persistent Disk**:
   - Mount path: `/var/data`
4. Add environment variables:
   - `DB_PATH` = `/var/data/requirements.db`
   - `CORS_ORIGIN` = `https://YOUR_VERCEL_DOMAIN`
5. Deploy and copy the service URL, e.g. `https://your-backend.onrender.com`.

Health check:
- `GET https://your-backend.onrender.com/api/health`

---

## 2) Deploy Frontend (Vercel)

1. Import the **frontend** folder into Vercel.
2. Set environment variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
3. Deploy and copy the Vercel domain, e.g. `https://your-frontend.vercel.app`.
4. Update Render `CORS_ORIGIN` with the Vercel domain if needed.

---

## Notes
- The backend uses SQLite. Render persistent disk keeps data across restarts.
- If you want a managed database (Postgres) later, I can migrate the code.
