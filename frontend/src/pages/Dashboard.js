import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [bonusLocked, setBonusLocked] = useState(user?.bonus_locked || 21000);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { 'x-auth-token': token }
      });
      setBalance(response.data.user.balance);
      setBonusLocked(response.data.user.bonus_locked);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const watchVideo = () => {
    setShowVideo(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canWithdraw = user?.deposit_status === true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Travolium
          </h1>
          <div className="space-x-3">
            <button
              onClick={() => navigate('/deposit')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Deposit
            </button>
            <button
              onClick={() => navigate('/withdraw')}
              disabled={!canWithdraw}
              className={`px-4 py-2 rounded-lg transition ${
                canWithdraw
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Withdraw {!canWithdraw && '(Deposit first)'}
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
            >
              📋 All Tasks
            </button>
            <button
              onClick={() => navigate('/edit-sms')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
            >
              SMS Editor
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10 mb-6">
          <h2 className="text-2xl font-bold text-white">
            Welcome, {user?.first_name} {user?.last_name}!
          </h2>
          <p className="text-gray-300 mt-1">{user?.email}</p>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-xl text-white">
            <h3 className="text-lg opacity-90">Available Balance</h3>
            <p className="text-4xl font-bold mt-2">{balance.toLocaleString()} FRW</p>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 shadow-xl text-white">
            <h3 className="text-lg opacity-90">Bonus (Locked)</h3>
            <p className="text-4xl font-bold mt-2">{bonusLocked.toLocaleString()} FRW</p>
            {!canWithdraw && (
              <p className="text-sm mt-2 opacity-90">⚠️ Make a deposit to unlock bonus</p>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Quick Tasks</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-xl border border-gray-600 hover:bg-gray-700 transition">
              <div>
                <h4 className="font-semibold text-white">Watch Video</h4>
                <p className="text-gray-300 text-sm">Watch 1 video = 1,000 FRW</p>
              </div>
              <button
                onClick={watchVideo}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
              >
                Watch Now
              </button>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-xl border border-gray-600 hover:bg-gray-700 transition">
              <div>
                <h4 className="font-semibold text-white">📋 All Tasks</h4>
                <p className="text-gray-300 text-sm">View and complete all tasks</p>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
              >
                View All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideo && (
        <VideoPlayer 
          onComplete={(newBalance) => {
            setBalance(newBalance);
            setShowVideo(false);
            setMessage('✅ +1,000 FRW earned!');
            setTimeout(() => setMessage(''), 3000);
            fetchUserData();
          }}
          onClose={() => setShowVideo(false)}
        />
      )}

      {/* Message Popup */}
      {message && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg toast-slide ${
          message.includes('✅') ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          {message}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-3">
            <div className="loading-spinner"></div>
            <span className="text-white">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;