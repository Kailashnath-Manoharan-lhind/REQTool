# Requirements Tool

A modern, full-stack application for managing requirements, epics, and tasks with comprehensive tracking of estimates, costs, acceptance criteria, and comments.

## Features

✨ **Comprehensive Management**
- Create and manage Epics
- Create Tasks within Epics
- Track estimated and actual time/costs
- Set task priority levels (High, Medium, Low)
- Track task status (Not Started, In Progress, Completed)

📋 **Acceptance Criteria**
- Add multiple acceptance criteria per task
- Mark criteria as complete/incomplete
- Visual progress tracking

💬 **Collaboration**
- Add comments to tasks
- Include author information
- View comment history

📊 **Metrics & Tracking**
- Estimate time and cost per epic/task
- Track actual time and cost spent
- Dashboard overview of all epics

🎨 **Modern UI**
- Clean, intuitive interface
- Responsive design for all devices
- Gradient backgrounds and smooth animations
- Real-time updates

## Tech Stack

**Backend:**
- Node.js with Express.js
- SQLite3 for data persistence
- CORS enabled for frontend communication

**Frontend:**
- React 18
- Modern CSS with flexbox and grid
- Lucide React icons
- Axios for API calls

## Project Structure

```
RequirementsTool/
├── backend/
│   ├── package.json
│   ├── server.js          # Express API server
│   └── requirements.db    # SQLite database (auto-created)
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── EpicList.js
    │   │   ├── EpicList.css
    │   │   ├── EpicDetail.js
    │   │   ├── EpicDetail.css
    │   │   ├── TaskDetail.js
    │   │   └── TaskDetail.css
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend API will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## API Endpoints

### Epics
- `GET /api/epics` - Get all epics
- `GET /api/epics/:id` - Get epic with tasks
- `POST /api/epics` - Create new epic
- `PUT /api/epics/:id` - Update epic
- `DELETE /api/epics/:id` - Delete epic

### Tasks
- `GET /api/epics/:epicId/tasks` - Get tasks for an epic
- `GET /api/tasks/:id` - Get task with criteria and comments
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Acceptance Criteria
- `POST /api/acceptance-criteria` - Add criteria
- `PUT /api/acceptance-criteria/:id` - Update criteria
- `DELETE /api/acceptance-criteria/:id` - Delete criteria

### Comments
- `POST /api/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

## Usage Guide

### Creating an Epic
1. Click "New Epic" button on the home screen
2. Fill in the title, description, estimated time, and estimated cost
3. Click "Create Epic"

### Managing Tasks
1. Click "View Details" on an epic
2. Click "New Task" to add a task
3. Fill in task details including priority and estimates
4. Tasks can be updated by clicking on them

### Adding Acceptance Criteria
1. Open a task details page
2. In the "Acceptance Criteria" section, enter criteria text
3. Click "Add" to add it
4. Click the checkbox to mark as complete
5. Track progress with the completion counter

### Adding Comments
1. Open a task details page
2. Scroll to the "Comments" section
3. Enter optional author name and comment text
4. Click "Add Comment"

## Database Schema

### epics table
- id (PRIMARY KEY)
- title
- description
- status
- estimatedTime
- estimatedCost
- actualTime
- actualCost
- createdAt
- updatedAt

### tasks table
- id (PRIMARY KEY)
- epicId (FOREIGN KEY)
- title
- description
- status
- priority
- estimatedTime
- estimatedCost
- actualTime
- actualCost
- createdAt
- updatedAt

### acceptanceCriteria table
- id (PRIMARY KEY)
- taskId (FOREIGN KEY)
- criteria
- isCompleted
- createdAt

### comments table
- id (PRIMARY KEY)
- taskId (FOREIGN KEY)
- text
- author
- createdAt

## Development Tips

- The database is automatically created on first run
- All IDs are generated using UUID v4
- Timestamps are automatically managed
- The app uses in-memory state; refresh the page to see updates from other sessions

## Future Enhancements

- User authentication and authorization
- Real-time collaboration with WebSockets
- Gantt chart view for timeline visualization
- Export reports to PDF
- Email notifications
- Advanced filtering and search
- Team member assignments
- Attachments and file uploads
- Version history and audit logs

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
