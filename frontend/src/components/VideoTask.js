import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VideoTask = ({ onComplete }) => {
  const [isWatching, setIsWatching] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [requestId, setRequestId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const startVideo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/video-approval/request`, {
        videoId: 'travolium_promo'
      }, { headers: { 'x-auth-token': token } });
      
      if (response.data.success) {
        setRequestId(response.data.requestId);
        setIsWatching(true);
        setTimeLeft(30);
        setMessage('Video started! Please wait 30 seconds...');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error starting video');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    let durationTimer;
    
    if (isWatching && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        
        // Update duration every second
        if (requestId) {
          const updateDuration = async () => {
            try {
              const token = localStorage.getItem('token');
              await axios.post(`${API_URL}/video-approval/update-duration`, {
                requestId,
                duration: 30 - (timeLeft - 1)
              }, { headers: { 'x-auth-token': token } });
            } catch (err) {
              console.error('Duration update error:', err);
            }
          };
          updateDuration();
        }
      }, 1000);
    } else if (timeLeft === 0 && isWatching) {
      // Video completed
      completeVideo();
    }
    
    return () => clearTimeout(timer);
  }, [isWatching, timeLeft, requestId]);

  const completeVideo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/video-approval/complete`, {
        requestId
      }, { headers: { 'x-auth-token': token } });
      
      if (response.data.success) {
        setMessage('✅ Video completed! Admin will review and add 1000 FRW');
        setIsWatching(false);
        if (onComplete) onComplete();
      }
    } catch (error) {
      setMessage('Error completing video');
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      {!isWatching ? (
        <div className="text-center">
          <button
            onClick={startVideo}
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Starting...' : '🎬 Start Video (30 sec)'}
          </button>
          {message && (
            <p className="mt-3 text-sm text-gray-600">{message}</p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-gray-100 rounded-lg p-4 mb-3">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {timeLeft} seconds
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-red-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
              ></div>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Please wait while video is playing...
            </p>
            <div className="mt-3 animate-spin inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTask;