import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import EpicList from './components/EpicList';
import EpicDetail from './components/EpicDetail';
import TaskDetail from './components/TaskDetail';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [view, setView] = useState('list'); // 'list', 'epic-detail', 'task-detail'
  const [selectedEpic, setSelectedEpic] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEpics();
  }, []);

  const fetchEpics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/epics`);
      setEpics(response.data);
    } catch (error) {
      console.error('Error fetching epics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEpic = async (epic) => {
    setSelectedEpic(epic);
    setView('epic-detail');
  };

  const handleViewTask = async (taskId, epicId) => {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}`);
      setSelectedTask(response.data);
      setSelectedEpic({ id: epicId });
      setView('task-detail');
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedEpic(null);
    setSelectedTask(null);
    fetchEpics();
  };

  const handleBackToEpic = () => {
    setView('epic-detail');
    setSelectedTask(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>📋 Requirements Tool</h1>
          <p>Manage epics, tasks, and requirements with ease</p>
        </div>
      </header>

      <main className="app-main">
        {view === 'list' && (
          <EpicList 
            epics={epics} 
            loading={loading}
            onViewEpic={handleViewEpic}
            onRefresh={fetchEpics}
          />
        )}
        {view === 'epic-detail' && (
          <EpicDetail
            epicId={selectedEpic?.id}
            onBack={handleBackToList}
            onViewTask={handleViewTask}
          />
        )}
        {view === 'task-detail' && (
          <TaskDetail
            task={selectedTask}
            onBack={handleBackToEpic}
          />
        )}
      </main>
    </div>
  );
}

export default App;
