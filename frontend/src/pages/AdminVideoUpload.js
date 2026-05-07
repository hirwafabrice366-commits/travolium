import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminVideoUpload = () => {
  const [videos, setVideos] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    videoType: 'youtube',
    reward: 1000,
    watchDuration: 30
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/videos/admin/videos`, {
        headers: { 'x-auth-token': token }
      });
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (!formData.title || !formData.videoUrl) {
      setMessage('❌ Title and Video URL are required');
      setMessageType('error');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/videos/admin/upload`, formData, {
        headers: { 'x-auth-token': token }
      });
      
      if (response.data.success) {
        setMessage('✅ Video uploaded successfully!');
        setMessageType('success');
        setFormData({ 
          title: '', 
          description: '', 
          videoUrl: '', 
          videoType: 'youtube', 
          reward: 1000, 
          watchDuration: 30 
        });
        fetchVideos();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Upload failed');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Error uploading video. Make sure backend is running.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const toggleVideoStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/videos/admin/videos/${id}/toggle`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchVideos();
      setMessage(`✅ Video ${currentStatus ? 'disabled' : 'enabled'}`);
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('❌ Error updating video status');
      setMessageType('error');
    }
  };

  const deleteVideo = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/videos/admin/videos/${id}`, {
          headers: { 'x-auth-token': token }
        });
        fetchVideos();
        setMessage('✅ Video deleted');
        setMessageType('success');
        setTimeout(() => setMessage(''), 2000);
      } catch (error) {
        setMessage('❌ Error deleting video');
        setMessageType('error');
      }
    }
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📤 Admin Video Upload</h1>
            <p className="text-gray-500 mt-1">Upload YouTube videos for users to watch and earn</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            ← Back to Admin
          </button>
        </div>
        
        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}
        
        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center cursor-pointer"
            onClick={() => setShowForm(!showForm)}
          >
            <h2 className="text-white font-semibold text-lg">
              {showForm ? '▼' : '▶'} {showForm ? 'Hide Upload Form' : 'Show Upload Form'}
            </h2>
            <span className="text-white text-sm">
              {showForm ? 'Collapse' : 'Expand'}
            </span>
          </div>
          
          {showForm && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter video title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Video description (optional)"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reward (FRW)</label>
                  <input
                    type="number"
                    name="reward"
                    value={formData.reward}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Watch Duration (seconds)</label>
                  <input
                    type="number"
                    name="watchDuration"
                    value={formData.watchDuration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video Type</label>
                  <select
                    name="videoType"
                    value={formData.videoType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <span>📤</span> Upload Video
                  </>
                )}
              </button>
            </form>
          )}
        </div>
        
        {/* Videos List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <h2 className="text-white font-semibold text-lg">
              Uploaded Videos ({videos.length})
            </h2>
          </div>
          
          {videos.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📹</div>
              <p className="text-lg">No videos uploaded yet</p>
              <p className="text-sm mt-2">Use the form above to add your first video</p>
            </div>
          ) : (
            <div className="divide-y">
              {videos.map((video) => {
                const thumbnail = getYouTubeThumbnail(video.video_url);
                return (
                  <div key={video.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {thumbnail ? (
                          <img src={thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📹</div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{video.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            video.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {video.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {video.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{video.description}</p>
                        )}
                        <div className="flex gap-3 mt-1 text-xs text-gray-400">
                          <span>💰 {video.reward} FRW</span>
                          <span>⏱️ {video.watch_duration}s</span>
                          <span>📹 {video.video_type}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleVideoStatus(video.id, video.is_active)}
                          className={`px-3 py-1 rounded text-sm ${
                            video.is_active 
                              ? 'bg-yellow-500 hover:bg-yellow-600' 
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white transition`}
                        >
                          {video.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVideoUpload;