import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';

const UserVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/videos/user/videos`, {
        headers: { 'x-auth-token': token }
      });
      console.log('Videos from API:', response.data.videos);
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const startWatching = (video) => {
    console.log('Selected video:', video);
    setSelectedVideo(video);
  };

  const onVideoComplete = (newBalance) => {
    setMessage(`✅ +${selectedVideo?.reward || 1000} FRW earned! New balance: ${newBalance?.toLocaleString()} FRW`);
    setTimeout(() => setMessage(''), 3000);
    fetchVideos();
  };

  // Extract YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📹 Watch Videos & Earn</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
        
        {message && (
          <div className="mb-4 p-3 rounded-lg text-center bg-green-100 text-green-700">
            {message}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📹</div>
            <p className="text-gray-500">No videos available. Check back later!</p>
            <p className="text-gray-400 text-sm mt-2">Admin needs to upload videos first</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
              const thumbnail = getYouTubeThumbnail(video.video_url);
              const hasVideo = video.video_url && video.video_url.includes('youtube');
              
              return (
                <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1">
                  {/* Video Thumbnail */}
                  <div 
                    className="relative bg-gray-800 h-48 flex items-center justify-center cursor-pointer group"
                    onClick={() => startWatching(video)}
                  >
                    {thumbnail && hasVideo ? (
                      <img 
                        src={thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">📹</div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="text-5xl">▶️</div>
                    </div>
                    {video.watch_status === 'completed' && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        ✅ Watched
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{video.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{video.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-green-600 font-bold">+{video.reward.toLocaleString()} FRW</span>
                      <span className="text-gray-500 text-sm">{video.watch_duration} seconds</span>
                    </div>
                    <button
                      onClick={() => startWatching(video)}
                      disabled={video.watch_status === 'completed'}
                      className={`mt-4 w-full py-2 rounded-lg font-semibold transition ${
                        video.watch_status === 'completed'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90'
                      }`}
                    >
                      {video.watch_status === 'completed' ? '✅ Already Watched' : '🎬 Watch Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer 
          video={selectedVideo}
          onComplete={onVideoComplete}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default UserVideos;