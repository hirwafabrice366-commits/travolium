import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import EditSms from './components/EditSms';
import Tasks from './pages/Tasks';
import AdminVideoUpload from './pages/AdminVideoUpload';
import UserVideos from './pages/UserVideos';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/videos" element={<AdminVideoUpload />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/edit-sms" element={<EditSms />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/user-videos" element={<UserVideos />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;