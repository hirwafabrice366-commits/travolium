import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WatchVideo = () => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isWatching, setIsWatching] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    let timer;
    if (isWatching && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isWatching) {
      completeWatch();
    }
    return () => clearTimeout(timer);
  }, [isWatching, timeLeft]);

  const completeWatch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/tasks/video`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      if (response.data.success) {
        setMessage('✅ +1,000 FRW earned! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error completing video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-4">Watch Video to Earn 1,000 FRW</h2>
        
        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
            {isWatching ? (
              <div className="text-center">
                <div className="text-8xl mb-4 animate-bounce">📹</div>
                <p className="text-white text-xl font-semibold">Travolium Promotion</p>
                <p className="text-gray-300 mt-2">Please wait {timeLeft} seconds...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-8xl mb-4">🎉</div>
                <p className="text-white text-xl">Video Completed!</p>
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="h-2 bg-gray-700">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000"
                  style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Timer */}
        <div className="mt-6 text-center">
          <div className="text-4xl font-bold text-purple-600">
            {timeLeft} seconds
          </div>
          <p className="text-gray-500 mt-2">
            Watch the entire video to earn 1,000 FRW
          </p>
        </div>
        
        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
        
        {/* Loading */}
        {loading && (
          <div className="mt-4 flex justify-center">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchVideo;