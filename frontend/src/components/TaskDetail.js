import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import './TaskDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TaskDetail = ({ task, onBack }) => {
  const [currentTask, setCurrentTask] = useState(task);
  const [editing, setEditing] = useState(false);
  const [newCriteria, setNewCriteria] = useState('');
  const [newComment, setNewComment] = useState({ text: '', author: '' });
  const [criteria, setCriteria] = useState(task.acceptanceCriteria || []);
  const [comments, setComments] = useState(task.comments || []);

  const handleUpdateTask = async (updatedTask) => {
    try {
      await axios.put(`${API_URL}/tasks/${currentTask.id}`, updatedTask);
      setCurrentTask(updatedTask);
      setEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAddCriteria = async (e) => {
    e.preventDefault();
    if (!newCriteria.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/acceptance-criteria`, {
        taskId: currentTask.id,
        criteria: newCriteria
      });
      setCriteria([...criteria, response.data]);
      setNewCriteria('');
    } catch (error) {
      console.error('Error adding criteria:', error);
    }
  };

  const handleToggleCriteria = async (criteriaId, isCompleted) => {
    try {
      const criterion = criteria.find(c => c.id === criteriaId);
      await axios.put(`${API_URL}/acceptance-criteria/${criteriaId}`, {
        criteria: criterion.criteria,
        isCompleted: !isCompleted
      });
      setCriteria(criteria.map(c => 
        c.id === criteriaId ? { ...c, isCompleted: !isCompleted } : c
      ));
    } catch (error) {
      console.error('Error updating criteria:', error);
    }
  };

  const handleDeleteCriteria = async (criteriaId) => {
    try {
      await axios.delete(`${API_URL}/acceptance-criteria/${criteriaId}`);
      setCriteria(criteria.filter(c => c.id !== criteriaId));
    } catch (error) {
      console.error('Error deleting criteria:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.text.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/comments`, {
        taskId: currentTask.id,
        ...newComment
      });
      setComments([response.data, ...comments]);
      setNewComment({ text: '', author: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API_URL}/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
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

  const completedCriteria = criteria.filter(c => c.isCompleted).length;

  return (
    <div className="task-detail-container">
      <button className="btn btn-back" onClick={onBack}>
        <ArrowLeft size={20} /> Back to Epic
      </button>

      <div className="task-detail-header">
        <div>
          {editing ? (
            <input
              type="text"
              value={currentTask.title}
              onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
              className="title-input"
            />
          ) : (
            <h1>{currentTask.title}</h1>
          )}
          <div className="task-detail-badges">
            <span className="priority-badge" style={{ backgroundColor: getPriorityColor(currentTask.priority) }}>
              {currentTask.priority} Priority
            </span>
            <span className="status-badge" style={{ backgroundColor: getStatusColor(currentTask.status) }}>
              {currentTask.status}
            </span>
          </div>
        </div>

        {editing ? (
          <div className="edit-actions">
            <button className="btn btn-success" onClick={() => handleUpdateTask(currentTask)}>
              Save
            </button>
            <button className="btn btn-cancel" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>
            Edit Task
          </button>
        )}
      </div>

      {editing ? (
        <div className="task-edit-form">
          <div>
            <label>Description</label>
            <textarea
              value={currentTask.description}
              onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
              rows="4"
            />
          </div>
          <div className="form-row">
            <div>
              <label>Status</label>
              <select
                value={currentTask.status}
                onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            <div>
              <label>Priority</label>
              <select
                value={currentTask.priority}
                onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label>Est. Time (hours)</label>
              <input
                type="number"
                value={currentTask.estimatedTime}
                onChange={(e) => setCurrentTask({ ...currentTask, estimatedTime: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label>Est. Cost ($)</label>
              <input
                type="number"
                value={currentTask.estimatedCost}
                onChange={(e) => setCurrentTask({ ...currentTask, estimatedCost: parseFloat(e.target.value) || 0 })}
                step="0.01"
              />
            </div>
            <div>
              <label>Actual Time (hours)</label>
              <input
                type="number"
                value={currentTask.actualTime}
                onChange={(e) => setCurrentTask({ ...currentTask, actualTime: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label>Actual Cost ($)</label>
              <input
                type="number"
                value={currentTask.actualCost}
                onChange={(e) => setCurrentTask({ ...currentTask, actualCost: parseFloat(e.target.value) || 0 })}
                step="0.01"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="task-detail-info">
          <p className="description">{currentTask.description || 'No description provided'}</p>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Estimated Time</span>
              <span className="metric-value">{currentTask.estimatedTime} hrs</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Estimated Cost</span>
              <span className="metric-value">${currentTask.estimatedCost.toFixed(2)}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Actual Time</span>
              <span className="metric-value">{currentTask.actualTime} hrs</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Actual Cost</span>
              <span className="metric-value">${currentTask.actualCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2>Acceptance Criteria ({completedCriteria}/{criteria.length})</h2>
        </div>

        <form className="criteria-form" onSubmit={handleAddCriteria}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Add acceptance criteria"
              value={newCriteria}
              onChange={(e) => setNewCriteria(e.target.value)}
            />
            <button type="submit" className="btn btn-success">
              <Plus size={18} /> Add
            </button>
          </div>
        </form>

        <div className="criteria-list">
          {criteria.length === 0 ? (
            <div className="empty-state">
              <p>No acceptance criteria yet. Add one to track task completion!</p>
            </div>
          ) : (
            criteria.map((criterion) => (
              <div key={criterion.id} className={`criteria-item ${criterion.isCompleted ? 'completed' : ''}`}>
                <button
                  className="criteria-checkbox"
                  onClick={() => handleToggleCriteria(criterion.id, criterion.isCompleted)}
                >
                  {criterion.isCompleted ? (
                    <CheckCircle2 size={24} color="#10b981" />
                  ) : (
                    <Circle size={24} color="#d1d5db" />
                  )}
                </button>
                <span className="criteria-text">{criterion.criteria}</span>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDeleteCriteria(criterion.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Comments ({comments.length})</h2>
        </div>

        <form className="comment-form" onSubmit={handleAddComment}>
          <div>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={newComment.author}
              onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
            />
          </div>
          <div>
            <textarea
              placeholder="Add a comment..."
              value={newComment.text}
              onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
              rows="3"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> Add Comment
          </button>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="empty-state">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <strong className="comment-author">{comment.author}</strong>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
