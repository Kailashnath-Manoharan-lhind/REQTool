import React, { useState } from 'react';
import axios from 'axios';
import { Plus, RefreshCw, Trash2, Eye } from 'lucide-react';
import './EpicList.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EpicList = ({ epics, loading, onViewEpic, onRefresh }) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newEpic, setNewEpic] = useState({ projectName: '', title: '', description: '', estimatedTime: 0, estimatedCost: 0 });

  const handleAddEpic = async (e) => {
    e.preventDefault();
    if (!newEpic.title.trim()) return;

    try {
      await axios.post(`${API_URL}/epics`, newEpic);
      setNewEpic({ projectName: '', title: '', description: '', estimatedTime: 0, estimatedCost: 0 });
      setShowNewForm(false);
      onRefresh();
    } catch (error) {
      console.error('Error creating epic:', error);
    }
  };

  const handleDeleteEpic = async (id) => {
    if (window.confirm('Are you sure you want to delete this epic and all its tasks?')) {
      try {
        await axios.delete(`${API_URL}/epics/${id}`);
        onRefresh();
      } catch (error) {
        console.error('Error deleting epic:', error);
      }
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

  return (
    <div className="epic-list-container">
      <div className="epic-list-header">
        <h2>Epics</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowNewForm(!showNewForm)}>
            <Plus size={18} /> New Epic
          </button>
          <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={18} /> {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {showNewForm && (
        <form className="epic-form" onSubmit={handleAddEpic}>
          <input
            type="text"
            placeholder="Project Name"
            value={newEpic.projectName}
            onChange={(e) => setNewEpic({ ...newEpic, projectName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Epic Title *"
            value={newEpic.title}
            onChange={(e) => setNewEpic({ ...newEpic, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={newEpic.description}
            onChange={(e) => setNewEpic({ ...newEpic, description: e.target.value })}
            rows="3"
          />
          <div className="form-row">
            <input
              type="number"
              placeholder="Estimated Time (hours)"
              value={newEpic.estimatedTime}
              onChange={(e) => setNewEpic({ ...newEpic, estimatedTime: parseInt(e.target.value) || 0 })}
            />
            <input
              type="number"
              placeholder="Estimated Cost ($)"
              value={newEpic.estimatedCost}
              onChange={(e) => setNewEpic({ ...newEpic, estimatedCost: parseFloat(e.target.value) || 0 })}
              step="0.01"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">Create Epic</button>
            <button type="button" className="btn btn-cancel" onClick={() => setShowNewForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="epics-grid">
        {epics.length === 0 ? (
          <div className="empty-state">
            <p>No epics yet. Create your first epic to get started!</p>
          </div>
        ) : (
          epics.map((epic) => (
            <div key={epic.id} className="epic-card">
              <div className="epic-card-header">
                <div>
                  <h3>{epic.title}</h3>
                  {epic.projectName && <p className="project-name">📁 {epic.projectName}</p>}
                  <p className="description">{epic.description || 'No description'}</p>
                </div>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(epic.status) }}>
                  {epic.status}
                </span>
              </div>

              <div className="epic-card-metrics">
                <div className="metric">
                  <span className="label">⏱️ Time</span>
                  <span className="value">{epic.estimatedTime} hrs</span>
                </div>
                <div className="metric">
                  <span className="label">💰 Cost</span>
                  <span className="value">${epic.estimatedCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="epic-card-actions">
                <button 
                  className="btn btn-small btn-primary"
                  onClick={() => onViewEpic(epic)}
                >
                  <Eye size={16} /> View Details
                </button>
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => handleDeleteEpic(epic.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EpicList;
