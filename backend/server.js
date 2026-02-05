const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(
  cors({
    origin: allowedOrigins || true
  })
);
app.use(express.json());

// SQLite Database Setup
const dbPath = process.env.DB_PATH || path.join(__dirname, 'requirements.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize Database Tables
function initializeDatabase() {
  db.serialize(() => {
    // Epics table
    db.run(`
      CREATE TABLE IF NOT EXISTS epics (
        id TEXT PRIMARY KEY,
        projectName TEXT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Not Started',
        estimatedTime INTEGER DEFAULT 0,
        estimatedCost REAL DEFAULT 0,
        actualTime INTEGER DEFAULT 0,
        actualCost REAL DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add projectName column if it doesn't exist (for existing databases)
    db.all(`PRAGMA table_info(epics)`, (err, columns) => {
      if (err) {
        console.error('Error checking epics table:', err);
        return;
      }

      const hasProjectName = columns.some((col) => col.name === 'projectName');
      if (!hasProjectName) {
        db.run(`ALTER TABLE epics ADD COLUMN projectName TEXT`, (alterErr) => {
          if (alterErr) {
            console.error('Error adding projectName column:', alterErr);
          }
        });
      }
    });

    // Tasks table
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        epicId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Not Started',
        priority TEXT DEFAULT 'Medium',
        estimatedTime INTEGER DEFAULT 0,
        estimatedCost REAL DEFAULT 0,
        actualTime INTEGER DEFAULT 0,
        actualCost REAL DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(epicId) REFERENCES epics(id)
      )
    `);

    // Acceptance Criteria table
    db.run(`
      CREATE TABLE IF NOT EXISTS acceptanceCriteria (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        criteria TEXT NOT NULL,
        isCompleted INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(taskId) REFERENCES tasks(id)
      )
    `);

    // Comments table
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        text TEXT NOT NULL,
        author TEXT DEFAULT 'Anonymous',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(taskId) REFERENCES tasks(id)
      )
    `);
  });
}

// ============ EPIC ENDPOINTS ============

// Get all epics
app.get('/api/epics', (req, res) => {
  db.all(`SELECT * FROM epics ORDER BY createdAt DESC`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get single epic with all related data
app.get('/api/epics/:id', (req, res) => {
  const epicId = req.params.id;
  
  db.get(`SELECT * FROM epics WHERE id = ?`, [epicId], (err, epic) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!epic) {
      res.status(404).json({ error: 'Epic not found' });
      return;
    }

    // Get tasks for this epic
    db.all(`SELECT * FROM tasks WHERE epicId = ?`, [epicId], (err, tasks) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      epic.tasks = tasks || [];
      res.json(epic);
    });
  });
});

// Create epic
app.post('/api/epics', (req, res) => {
  const { projectName, title, description, estimatedTime, estimatedCost } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO epics (id, projectName, title, description, estimatedTime, estimatedCost) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, projectName || '', title, description, estimatedTime || 0, estimatedCost || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, projectName: projectName || '', title, description, estimatedTime, estimatedCost, status: 'Not Started' });
      }
    }
  );
});

// Update epic
app.put('/api/epics/:id', (req, res) => {
  const { projectName, title, description, status, estimatedTime, estimatedCost, actualTime, actualCost } = req.body;
  const epicId = req.params.id;
  
  db.run(
    `UPDATE epics SET projectName = ?, title = ?, description = ?, status = ?, estimatedTime = ?, estimatedCost = ?, actualTime = ?, actualCost = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [projectName || '', title, description, status, estimatedTime, estimatedCost, actualTime, actualCost, epicId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// Delete epic
app.delete('/api/epics/:id', (req, res) => {
  const epicId = req.params.id;
  
  db.run(`DELETE FROM epics WHERE id = ?`, [epicId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// ============ TASK ENDPOINTS ============

// Get tasks for an epic
app.get('/api/epics/:epicId/tasks', (req, res) => {
  const epicId = req.params.epicId;
  
  db.all(`SELECT * FROM tasks WHERE epicId = ? ORDER BY createdAt DESC`, [epicId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get single task
app.get('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  
  db.get(`SELECT * FROM tasks WHERE id = ?`, [taskId], (err, task) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Get acceptance criteria
    db.all(`SELECT * FROM acceptanceCriteria WHERE taskId = ?`, [taskId], (err, criteria) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Get comments
      db.all(`SELECT * FROM comments WHERE taskId = ? ORDER BY createdAt DESC`, [taskId], (err, comments) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        task.acceptanceCriteria = criteria || [];
        task.comments = comments || [];
        res.json(task);
      });
    });
  });
});

// Create task
app.post('/api/tasks', (req, res) => {
  const { epicId, title, description, priority, estimatedTime, estimatedCost } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO tasks (id, epicId, title, description, priority, estimatedTime, estimatedCost) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, epicId, title, description, priority || 'Medium', estimatedTime || 0, estimatedCost || 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, epicId, title, description, priority, estimatedTime, estimatedCost, status: 'Not Started' });
      }
    }
  );
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const { title, description, status, priority, estimatedTime, estimatedCost, actualTime, actualCost } = req.body;
  const taskId = req.params.id;
  
  db.run(
    `UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, estimatedTime = ?, estimatedCost = ?, actualTime = ?, actualCost = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [title, description, status, priority, estimatedTime, estimatedCost, actualTime, actualCost, taskId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  
  db.run(`DELETE FROM tasks WHERE id = ?`, [taskId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// ============ ACCEPTANCE CRITERIA ENDPOINTS ============

// Add acceptance criteria
app.post('/api/acceptance-criteria', (req, res) => {
  const { taskId, criteria } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO acceptanceCriteria (id, taskId, criteria) VALUES (?, ?, ?)`,
    [id, taskId, criteria],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, taskId, criteria, isCompleted: 0 });
      }
    }
  );
});

// Update acceptance criteria
app.put('/api/acceptance-criteria/:id', (req, res) => {
  const { criteria, isCompleted } = req.body;
  const id = req.params.id;
  
  db.run(
    `UPDATE acceptanceCriteria SET criteria = ?, isCompleted = ? WHERE id = ?`,
    [criteria, isCompleted ? 1 : 0, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    }
  );
});

// Delete acceptance criteria
app.delete('/api/acceptance-criteria/:id', (req, res) => {
  const id = req.params.id;
  
  db.run(`DELETE FROM acceptanceCriteria WHERE id = ?`, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// ============ COMMENTS ENDPOINTS ============

// Add comment
app.post('/api/comments', (req, res) => {
  const { taskId, text, author } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO comments (id, taskId, text, author) VALUES (?, ?, ?, ?)`,
    [id, taskId, text, author || 'Anonymous'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, taskId, text, author: author || 'Anonymous', createdAt: new Date().toISOString() });
      }
    }
  );
});

// Delete comment
app.delete('/api/comments/:id', (req, res) => {
  const id = req.params.id;
  
  db.run(`DELETE FROM comments WHERE id = ?`, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Requirements Tool API server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
