import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VideoPlayer = ({ video, onComplete, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(video?.watch_duration || 30);
  const [isWatching, setIsWatching] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
        setMessage(`✅ +${video?.reward || 1000} FRW earned!`);
        if (onComplete) {
          onComplete(response.data.balance);
        }
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setMessage(response.data.error || 'Error completing video');
      }
    } catch (error) {
      console.error('Video completion error:', error);
      setMessage('Error completing video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
        
        {/* Video Icon */}
        <div className="text-8xl mb-6 animate-pulse">
          📹
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          {video?.title || "Travolium Video"}
        </h2>
        
        {/* Timer Circle */}
        <div className="relative w-40 h-40 mx-auto my-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - timeLeft / (video?.watch_duration || 30))}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold text-white">{timeLeft}s</div>
          </div>
        </div>
        
        {/* Message */}
        <p className="text-gray-300 mb-4">
          Watch to earn {video?.reward || 1000} FRW
        </p>
        
        {/* Progress Text */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(( (video?.watch_duration || 30) - timeLeft) / (video?.watch_duration || 30)) * 100}%` }}
          ></div>
        </div>
        
        {/* Message Status */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {message}
          </div>
        )}
        
        {/* Loading */}
        {loading && (
          <div className="flex justify-center mb-4">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {/* Cancel Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
        >
          Cancel
        </button>
        
        {/* Instruction */}
        <p className="text-gray-400 text-xs mt-4">
          Please wait {timeLeft} seconds...
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;