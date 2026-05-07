import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notification = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchNotifications();
    // Poll every 10 seconds for new notifications
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(response.data.notifications);
      const unread = response.data.notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'deposit': return '💰';
      case 'bonus': return '🎉';
      case 'task': return '✅';
      case 'alert': return '⚠️';
      default: return '📢';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative focus:outline-none"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition ${
                    !notif.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;