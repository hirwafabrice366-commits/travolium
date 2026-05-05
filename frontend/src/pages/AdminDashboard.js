import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [smsMessages, setSmsMessages] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);
  const [taskAmount, setTaskAmount] = useState('');
  const [replyText, setReplyText] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Check if user is admin
    if (user && !user.is_admin) {
      navigate('/dashboard');
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      const [usersRes, smsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, config),
        axios.get(`${API_URL}/admin/sms`, config),
        axios.get(`${API_URL}/admin/stats`, config)
      ]);
      
      setUsers(usersRes.data.users);
      setSmsMessages(smsRes.data.messages);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const assignTask = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/assign-task`, {
        userId,
        taskType: 'custom_task',
        reward: parseFloat(taskAmount)
      }, { headers: { 'x-auth-token': token } });
      
      setMessage('Task assigned successfully!');
      setTimeout(() => setMessage(''), 3000);
      setSelectedUser(null);
      setTaskAmount('');
    } catch (error) {
      setMessage('Error assigning task');
    }
  };

  const replyToSMS = async (smsId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/sms/${smsId}/reply`, {
        reply: replyText
      }, { headers: { 'x-auth-token': token } });
      
      setMessage('Reply sent!');
      setReplyText('');
      fetchData();
    } catch (error) {
      setMessage('Error sending reply');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold">Travolium Admin</h1>
          <p className="text-sm text-gray-400">Welcome, {user?.first_name}</p>
        </div>
        
        <nav className="mt-5">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-5 py-3 hover:bg-gray-700 transition ${activeTab === 'users' ? 'bg-gray-700' : ''}`}
          >
            📊 Users ({stats.totalUsers || 0})
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`w-full text-left px-5 py-3 hover:bg-gray-700 transition ${activeTab === 'sms' ? 'bg-gray-700' : ''}`}
          >
            💬 SMS Messages ({stats.totalSMS || 0})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full text-left px-5 py-3 hover:bg-gray-700 transition ${activeTab === 'tasks' ? 'bg-gray-700' : ''}`}
          >
            📝 Tasks ({stats.totalTasks || 0})
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-5 py-3 mt-10 text-red-400 hover:bg-gray-700 transition"
          >
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <p className="text-sm">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <p className="text-sm">Total Tasks</p>
            <p className="text-2xl font-bold">{stats.totalTasks || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <p className="text-sm">SMS Messages</p>
            <p className="text-2xl font-bold">{stats.totalSMS || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <p className="text-sm">Total Deposits</p>
            <p className="text-2xl font-bold">{stats.totalDeposits?.toLocaleString() || 0} FRW</p>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-white">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Balance</th>
                  <th className="px-4 py-3 text-left">Bonus</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-700 hover:bg-gray-700">
                    <td className="px-4 py-3">{u.first_name} {u.last_name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.phone}</td>
                    <td className="px-4 py-3">{u.balance?.toLocaleString()} FRW</td>
                    <td className="px-4 py-3">{u.bonus_locked?.toLocaleString()} FRW</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="bg-yellow-500 px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Assign Task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SMS Tab */}
        {activeTab === 'sms' && (
          <div className="space-y-4">
            {smsMessages.map((msg) => (
              <div key={msg.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-semibold">{msg.first_name} {msg.last_name}</p>
                    <p className="text-gray-400 text-sm">{msg.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</span>
                </div>
                <p className="text-white mt-2">{msg.content}</p>
                {msg.admin_reply && (
                  <div className="mt-2 p-2 bg-gray-700 rounded">
                    <p className="text-green-400 text-sm">Admin Reply: {msg.admin_reply}</p>
                  </div>
                )}
                {!msg.admin_reply && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 rounded text-white"
                    />
                    <button
                      onClick={() => replyToSMS(msg.id)}
                      className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-white text-lg mb-4">Assign Task to {selectedUser.first_name}</h3>
            <input
              type="number"
              placeholder="Task Reward (FRW)"
              value={taskAmount}
              onChange={(e) => setTaskAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded text-white mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => assignTask(selectedUser.id)}
                className="flex-1 bg-green-500 py-2 rounded hover:bg-green-600"
              >
                Assign
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 bg-gray-600 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;