import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [smsCode, setSmsCode] = useState('1228601');
  const [smsMessage, setSmsMessage] = useState('');
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard');
    }
    fetchData();
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter(u => 
          u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.phone.includes(searchTerm)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, config),
        axios.get(`${API_URL}/admin/stats`, config)
      ]);
      
      setUsers(usersRes.data.users);
      setFilteredUsers(usersRes.data.users);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const sendSMSCode = async (userPhone, userName) => {
    setSelectedUser({ phone: userPhone, name: userName });
    setShowSmsModal(true);
  };

  const sendSMS = async () => {
    if (!smsMessage) {
      setMessage('Please enter a message');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/sms/send-code`, {
        phone: selectedUser.phone,
        code: smsCode,
        message: smsMessage
      }, { headers: { 'x-auth-token': token } });
      
      setMessage(`✅ SMS sent successfully to ${selectedUser.name} (${selectedUser.phone})`);
      setTimeout(() => setMessage(''), 3000);
      setShowSmsModal(false);
      setSmsMessage('');
    } catch (error) {
      setMessage('❌ Failed to send SMS');
    }
    setLoading(false);
  };

  const assignDepositTask = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/assign-task`, {
        userId,
        taskType: 'deposit_task',
        reward: 0
      }, { headers: { 'x-auth-token': token } });
      
      setMessage(`✅ Deposit task assigned to user`);
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (error) {
      setMessage('❌ Error assigning deposit task');
    }
  };

  const updateBalance = async (userId, amount, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/update-balance`, {
        userId,
        amount: parseFloat(amount),
        action
      }, { headers: { 'x-auth-token': token } });
      
      setMessage(`✅ Balance ${action}ed by ${amount} FRW`);
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (error) {
      setMessage('❌ Error updating balance');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold">Travolium Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome, {user?.first_name}</p>
        </div>
        
        <nav className="mt-5">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-5 py-3 hover:bg-gray-700 transition ${activeTab === 'users' ? 'bg-gray-700 border-l-4 border-yellow-400' : ''}`}
          >
            👥 Users ({stats.totalUsers || 0})
          </button>
          
          <button
            onClick={() => setActiveTab('sms')}
            className={`w-full text-left px-5 py-3 hover:bg-gray-700 transition ${activeTab === 'sms' ? 'bg-gray-700 border-l-4 border-yellow-400' : ''}`}
          >
            📱 Send SMS
          </button>
          
          <button
            onClick={() => navigate('/admin/videos')}
            className="w-full text-left px-5 py-3 hover:bg-gray-700 transition"
          >
            📤 Upload Videos
          </button>
          
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full text-left px-5 py-3 hover:bg-gray-700 transition ${activeTab === 'stats' ? 'bg-gray-700 border-l-4 border-yellow-400' : ''}`}
          >
            📊 Statistics
          </button>
          
          <button
            onClick={handleLogout}
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
            <p className="text-sm">New Today</p>
            <p className="text-2xl font-bold">{stats.todayUsers || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <p className="text-sm">Total Tasks</p>
            <p className="text-2xl font-bold">{stats.totalTasks || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <p className="text-sm">Total Deposits</p>
            <p className="text-2xl font-bold">{stats.totalDeposits?.toLocaleString() || 0} FRW</p>
          </div>
        </div>

        {/* SMS Tab */}
        {activeTab === 'sms' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white text-lg font-bold mb-4">Send Access Code via SMS</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm block mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+25078XXXXXXX"
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">Access Code</label>
                <input
                  type="text"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-xl text-center"
                />
              </div>
              <button
                onClick={sendSMS}
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:opacity-90 transition"
              >
                {loading ? 'Sending...' : 'Send SMS Code'}
              </button>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Balance</th>
                    <th className="px-4 py-3 text-left">Bonus</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-gray-700 hover:bg-gray-700">
                      <td className="px-4 py-3">{u.id}</td>
                      <td className="px-4 py-3">{u.first_name} {u.last_name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.phone}</td>
                      <td className="px-4 py-3 text-green-400">{u.balance?.toLocaleString()} FRW</td>
                      <td className="px-4 py-3 text-yellow-400">{u.bonus_locked?.toLocaleString()} FRW</td>
                      <td className="px-4 py-3 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => sendSMSCode(u.phone, `${u.first_name} ${u.last_name}`)}
                            className="bg-blue-500 px-2 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            📱 SMS
                          </button>
                          <button
                            onClick={() => assignDepositTask(u.id)}
                            className="bg-yellow-500 px-2 py-1 rounded text-xs hover:bg-yellow-600"
                          >
                            Task
                          </button>
                          <button
                            onClick={() => updateBalance(u.id, 1000, 'add')}
                            className="bg-green-500 px-2 py-1 rounded text-xs hover:bg-green-600"
                          >
                            +1000
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">User Growth</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Total Registered</span>
                  <span className="text-green-400 font-bold">{stats.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Today's New Users</span>
                  <span className="text-blue-400 font-bold">{stats.todayUsers || 0}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">Financial Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Total Deposits</span>
                  <span className="text-green-400 font-bold">{stats.totalDeposits?.toLocaleString() || 0} FRW</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Total Tasks Completed</span>
                  <span className="text-blue-400 font-bold">{stats.totalTasks || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SMS Modal */}
      {showSmsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white text-lg font-bold mb-4">Send SMS to {selectedUser.name}</h3>
            <p className="text-gray-400 text-sm mb-4">Phone: {selectedUser.phone}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm block mb-2">Access Code</label>
                <input
                  type="text"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-xl text-center"
                />
              </div>
              
              <div>
                <label className="text-gray-300 text-sm block mb-2">Message</label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Your access code for Travolium is: 1228601"
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={sendSMS}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:opacity-90 transition"
              >
                {loading ? 'Sending...' : 'Send SMS'}
              </button>
              <button
                onClick={() => setShowSmsModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {message && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          message.includes('✅') ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-slide-in`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;