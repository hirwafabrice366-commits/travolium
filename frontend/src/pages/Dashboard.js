import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [bonusLocked, setBonusLocked] = useState(user?.bonus_locked || 21000);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setBalance(response.data.user.balance);
      setBonusLocked(response.data.user.bonus_locked);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const watchVideo = async () => {
    try {
      const response = await axios.post(`${API_URL}/tasks/video`);
      setBalance(response.data.balance);
      setBonusLocked(response.data.bonus_locked);
      showMessage('✅ Video watched! +1,000 FRW earned!', 'success');
    } catch (error) {
      showMessage('❌ Error watching video. Please try again.', 'error');
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canWithdraw = user?.deposit_status === true;
  const totalEarnings = balance + (canWithdraw ? bonusLocked : 0);
  const tasksCompleted = 12; // This would come from backend

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-indigo-900 to-purple-800 text-white transition-all duration-300 z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/20">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {isSidebarOpen && <span className="text-xl font-bold">Travolium</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`text-white hover:text-yellow-400 transition ${!isSidebarOpen && 'absolute right-2'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8">
          {[
            { id: 'overview', name: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'tasks', name: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { id: 'earnings', name: 'Earnings', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'profile', name: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 transition-all hover:bg-white/10 ${activeTab === item.id ? 'bg-white/20 border-r-4 border-yellow-400' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {isSidebarOpen && <span className="text-sm">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-8 left-0 right-0 px-5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition text-red-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h1>
              <p className="text-gray-500 text-sm">Welcome back, {user?.first_name}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </div>
                {isSidebarOpen && (
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-100 text-sm">Total Balance</p>
                      <p className="text-3xl font-bold mt-2">{totalEarnings.toLocaleString()} FRW</p>
                    </div>
                    <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-green-100 text-sm">Available Balance</p>
                      <p className="text-3xl font-bold mt-2">{balance.toLocaleString()} FRW</p>
                    </div>
                    <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-orange-100 text-sm">Locked Bonus</p>
                      <p className="text-3xl font-bold mt-2">{bonusLocked.toLocaleString()} FRW</p>
                      {!canWithdraw && <p className="text-xs mt-1">Deposit to unlock</p>}
                    </div>
                    <svg className="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-purple-100 text-sm">Tasks Completed</p>
                      <p className="text-3xl font-bold mt-2">{tasksCompleted}</p>
                    </div>
                    <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate('/deposit')}
                      className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition"
                    >
                      <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-sm font-semibold text-gray-700">Deposit</p>
                    </button>
                    <button
                      onClick={() => navigate('/withdraw')}
                      disabled={!canWithdraw}
                      className={`p-4 rounded-lg text-center transition ${canWithdraw ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-100 cursor-not-allowed'}`}
                    >
                      <svg className={`w-8 h-8 mx-auto mb-2 ${canWithdraw ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className={`text-sm font-semibold ${canWithdraw ? 'text-gray-700' : 'text-gray-400'}`}>Withdraw</p>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">You completed a video task</p>
                        <p className="text-xs text-gray-400">2 minutes ago</p>
                      </div>
                      <span className="text-green-600 font-semibold">+1,000 FRW</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Welcome bonus credited</p>
                        <p className="text-xs text-gray-400">1 day ago</p>
                      </div>
                      <span className="text-blue-600 font-semibold">+21,000 FRW</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Available Tasks</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Watch Video</h4>
                        <p className="text-sm text-gray-500">Watch promotional video and earn rewards</p>
                      </div>
                    </div>
                    <button
                      onClick={watchVideo}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                    >
                      Watch Now
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">SMS Editing</h4>
                        <p className="text-sm text-gray-500">Edit SMS content for Miro App</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/edit-sms')}
                      className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold"
                    >
                      Start
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">All Tasks</h2>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((task) => (
                  <div key={task} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-800">Task #{task}</h4>
                      <p className="text-sm text-gray-500">Complete this task to earn rewards</p>
                    </div>
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                      Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Earnings History</h2>
              <div className="space-y-3">
                {[
                  { task: 'Video Task', amount: '+1,000', date: 'Today', time: '10:30 AM' },
                  { task: 'Video Task', amount: '+1,000', date: 'Yesterday', time: '3:45 PM' },
                  { task: 'SMS Editing', amount: '+1,000', date: 'Yesterday', time: '11:20 AM' },
                  { task: 'Welcome Bonus', amount: '+21,000', date: 'Jan 15, 2026', time: '12:00 PM' },
                ].map((earning, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border-b border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800">{earning.task}</p>
                      <p className="text-xs text-gray-500">{earning.date} at {earning.time}</p>
                    </div>
                    <span className="text-green-600 font-bold">{earning.amount} FRW</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">First Name</label>
                    <p className="text-gray-800">{user?.first_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Last Name</label>
                    <p className="text-gray-800">{user?.last_name}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                    <p className="text-gray-800">{user?.email}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
                    <p className="text-gray-800">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slide-in ${
          messageType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Dashboard;