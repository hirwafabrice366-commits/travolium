import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminVideoApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/video-approval/admin/pending`, {
        headers: { 'x-auth-token': token }
      });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const approveRequest = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/video-approval/admin/approve/${id}`, {}, {
        headers: { 'x-auth-token': token }
      });
      setMessage('✅ Video approved! User received 1000 FRW');
      fetchPendingRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error approving video');
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/video-approval/admin/reject/${id}`, {}, {
        headers: { 'x-auth-token': token }
      });
      setMessage('❌ Video rejected');
      fetchPendingRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error rejecting video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🎬 Video Approval Dashboard</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      {requests.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-500">No pending video requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-lg shadow-md p-4 border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{req.first_name} {req.last_name}</p>
                  <p className="text-sm text-gray-600">{req.email}</p>
                  <p className="text-sm text-gray-600">📱 {req.phone}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Watched: {req.watch_duration} seconds | Reward: {req.reward} FRW
                  </p>
                  <p className="text-xs text-gray-400">
                    Requested: {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveRequest(req.id)}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    ✅ Approve (+1000 FRW)
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    disabled={loading}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVideoApproval;