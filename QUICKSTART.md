# Quick Start Guide

## 1. Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 2. Start the Application

### Terminal 1 - Start Backend (Port 5000)
```bash
cd backend
npm start
```

You should see: `Requirements Tool API server running on http://localhost:5000`

### Terminal 2 - Start Frontend (Port 3000)
```bash
cd frontend
npm start
```

Your browser will automatically open `http://localhost:3000`

## 3. Start Using the Tool

1. **Create an Epic**
   - Click "New Epic" button
   - Fill in title and optional details
   - Set estimated time and cost
   - Click "Create Epic"

2. **Add Tasks to Epic**
   - Click "View Details" on an epic
   - Click "New Task"
   - Set task title, priority, and estimates
   - Click "Create Task"

3. **Manage Task Details**
   - Click "Details" button on a task
   - Update status, priority, actual time/cost
   - Add acceptance criteria
   - Add comments

4. **Track Acceptance Criteria**
   - Open task details
   - Add criteria by typing and clicking "Add"
   - Check off completed criteria
   - Progress shown as "x/y completed"

## Database

SQLite database is automatically created at `backend/requirements.db` on first run.

To reset the database, delete `requirements.db` and restart the backend server.

## Troubleshooting

**Port 5000 already in use:**
```bash
# Kill process on port 5000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

**Port 3000 already in use:**
Set custom port:
```bash
set PORT=3001 && npm start
```

**API connection errors:**
Ensure backend is running on `http://localhost:5000` before starting frontend.

## Keyboard Shortcuts

- No special shortcuts yet - all features accessible via UI buttons

## Tips

- Estimated vs Actual tracking helps identify scope creep
- Use priorities to manage workload
- Acceptance criteria help ensure quality
- Comments maintain team communication
