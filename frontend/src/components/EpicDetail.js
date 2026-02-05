import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Eye } from 'lucide-react';
import './EpicDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EpicDetail = ({ epicId, onBack, onViewTask }) => {
  const [epic, setEpic] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', estimatedTime: 0, estimatedCost: 0 });
  const [editingEpic, setEditingEpic] = useState(null);

  useEffect(() => {
    fetchEpicDetails();
  }, [epicId]);

  const fetchEpicDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/epics/${epicId}`);
      setEpic(response.data);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching epic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await axios.post(`${API_URL}/tasks`, {
        epicId,
        ...newTask
      });
      setNewTask({ title: '', description: '', priority: 'Medium', estimatedTime: 0, estimatedCost: 0 });
      setShowNewTask(false);
      fetchEpicDetails();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/tasks/${taskId}`);
        fetchEpicDetails();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleUpdateEpic = async () => {
    try {
      await axios.put(`${API_URL}/epics/${epicId}`, editingEpic);
      setEpic(editingEpic);
      setEditingEpic(null);
      fetchEpicDetails();
    } catch (error) {
      console.error('Error updating epic:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#ef4444';
      case 'Medium':
        return '#f59e0b';
      case 'Low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#10b981';
      case 'In Progress':
        return '#f59e0b';
      case 'Not Started':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <div className="loading">Loading epic details...</div>;
  }

  if (!epic) {
    return <div className="error">Epic not found</div>;
  }

  return (
    <div className="epic-detail-container">
      <button className="btn btn-back" onClick={onBack}>
        <ArrowLeft size={20} /> Back to Epics
      </button>

      <div className="epic-detail-header">
        <div className="epic-detail-title">
          {editingEpic ? (
            <input
              type="text"
              value={editingEpic.title}
              onChange={(e) => setEditingEpic({ ...editingEpic, title: e.target.value })}
              className="title-input"
            />
          ) : (
            <h1>{epic.title}</h1>
          )}
          {editingEpic ? (
            <input
              type="text"
              value={editingEpic.projectName || ''}
              onChange={(e) => setEditingEpic({ ...editingEpic, projectName: e.target.value })}
              className="project-input"
              placeholder="Project Name"
            />
          ) : (
            epic.projectName && <p className="project-name">📁 {epic.projectName}</p>
          )}
          <span className="status-badge" style={{ backgroundColor: getStatusColor(epic.status) }}>
            {epic.status}
          </span>
        </div>

        {editingEpic ? (
          <div className="edit-actions">
            <button className="btn btn-success" onClick={handleUpdateEpic}>Save</button>
            <button className="btn btn-cancel" onClick={() => setEditingEpic(null)}>Cancel</button>
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={() => setEditingEpic({ ...epic })}>
            Edit Epic
          </button>
        )}
      </div>

      {editingEpic ? (
        <div className="epic-edit-form">
          <textarea
            value={editingEpic.description}
            onChange={(e) => setEditingEpic({ ...editingEpic, description: e.target.value })}
            placeholder="Description"
            rows="4"
          />
          <div className="form-row">
            <div>
              <label>Status</label>
              <select
                value={editingEpic.status}
                onChange={(e) => setEditingEpic({ ...editingEpic, status: e.target.value })}
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            <div>
              <label>Estimated Time (hours)</label>
              <input
                type="number"
                value={editingEpic.estimatedTime}
                onChange={(e) => setEditingEpic({ ...editingEpic, estimatedTime: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label>Estimated Cost ($)</label>
              <input
                type="number"
                value={editingEpic.estimatedCost}
                onChange={(e) => setEditingEpic({ ...editingEpic, estimatedCost: parseFloat(e.target.value) || 0 })}
                step="0.01"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="epic-detail-info">
          <p className="description">{epic.description || 'No description provided'}</p>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Estimated Time</span>
              <span className="metric-value">{epic.estimatedTime} hours</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Estimated Cost</span>
              <span className="metric-value">${epic.estimatedCost.toFixed(2)}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Actual Time</span>
              <span className="metric-value">{epic.actualTime} hours</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Actual Cost</span>
              <span className="metric-value">${epic.actualCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="tasks-section">
        <div className="section-header">
          <h2>Tasks ({tasks.length})</h2>
          <button className="btn btn-primary" onClick={() => setShowNewTask(!showNewTask)}>
            <Plus size={18} /> New Task
          </button>
        </div>

        {showNewTask && (
          <form className="task-form" onSubmit={handleAddTask}>
            <input
              type="text"
              placeholder="Task Title *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows="3"
            />
            <div className="form-row">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <input
                type="number"
                placeholder="Est. Time (hours)"
                value={newTask.estimatedTime}
                onChange={(e) => setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) || 0 })}
              />
              <input
                type="number"
                placeholder="Est. Cost ($)"
                value={newTask.estimatedCost}
                onChange={(e) => setNewTask({ ...newTask, estimatedCost: parseFloat(e.target.value) || 0 })}
                step="0.01"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">Create Task</button>
              <button type="button" className="btn btn-cancel" onClick={() => setShowNewTask(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="tasks-list">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet. Create your first task for this epic!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-header">
                  <div>
                    <h3>{task.title}</h3>
                    <p className="task-description">{task.description || 'No description'}</p>
                  </div>
                  <div className="task-badges">
                    <span className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                      {task.priority}
                    </span>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(task.status) }}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <div className="task-metrics">
                  <span>⏱️ {task.estimatedTime}h</span>
                  <span>💰 ${task.estimatedCost.toFixed(2)}</span>
                </div>
                <div className="task-actions">
                  <button 
                    className="btn btn-small btn-primary"
                    onClick={() => onViewTask(task.id, epic.id)}
                  >
                    <Eye size={16} /> Details
                  </button>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EpicDetail;
