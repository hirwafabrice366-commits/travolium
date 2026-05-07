import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Tasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Watch Video', reward: 1000, type: 'video', completed: false, link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 2, name: 'Share on Facebook', reward: 500, type: 'social', completed: false, link: 'https://facebook.com' },
    { id: 3, name: 'Follow on Instagram', reward: 500, type: 'social', completed: false, link: 'https://instagram.com' },
    { id: 4, name: 'SMS Editing', reward: 1000, type: 'edit', completed: false },
    { id: 5, name: 'Refer a Friend', reward: 2000, type: 'referral', completed: false },
    { id: 6, name: 'Daily Check-in', reward: 500, type: 'daily', completed: false }
  ]);
  const [loading, setLoading] = useState({});
  const [message, setMessage] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const savedTasks = localStorage.getItem(`tasks_${user?.id}`);
    if (savedTasks) {
      const completedTasks = JSON.parse(savedTasks);
      setTasks(prev => prev.map(task => ({
        ...task,
        completed: completedTasks.includes(task.id)
      })));
    }
  }, [user]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentTask && showVideoModal) {
      completeTask(currentTask);
      setShowVideoModal(false);
      setCurrentTask(null);
      setMessage(`🎉 Task completed! +${currentTask.reward} FRW earned!`);
      setTimeout(() => setMessage(''), 3000);
    }
  }, [timeLeft]);

  const startTask = async (task) => {
    if (task.completed) {
      setMessage(`⚠️ You already completed this task!`);
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setCurrentTask(task);
    setLoading(prev => ({ ...prev, [task.id]: true }));

    if (task.type === 'video') {
      setShowVideoModal(true);
      setTimeLeft(30);
    } else if (task.type === 'social') {
      window.open(task.link, '_blank');
      setTimeout(() => {
        completeTask(task);
      }, 10000);
      setMessage(`⏳ Please wait 10 seconds after sharing...`);
    } else if (task.type === 'edit') {
      navigate('/edit-sms');
    } else if (task.type === 'referral') {
      const referralCode = user?.id || 'TRAV123';
      navigator.clipboard.writeText(referralCode);
      setMessage(`📋 Referral code copied: ${referralCode}. Share with friends!`);
      setTimeout(() => setMessage(''), 3000);
    } else if (task.type === 'daily') {
      completeTask(task);
    }
    
    setLoading(prev => ({ ...prev, [task.id]: false }));
  };

  const completeTask = async (task) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/tasks/complete`, {
        taskId: task.id,
        taskType: task.type,
        reward: task.reward
      }, { headers: { 'x-auth-token': token } });
      
      const updatedTasks = tasks.map(t => 
        t.id === task.id ? { ...t, completed: true } : t
      );
      setTasks(updatedTasks);
      
      const completedIds = updatedTasks.filter(t => t.completed).map(t => t.id);
      localStorage.setItem(`tasks_${user?.id}`, JSON.stringify(completedIds));
      
      setMessage(`✅ +${task.reward} FRW added to your balance!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Task completion error:', error);
      setMessage('❌ Error completing task. Please try again.');
    }
  };

  const getTaskColor = (type) => {
    switch(type) {
      case 'video': return 'from-red-500 to-red-600';
      case 'social': return 'from-blue-500 to-blue-600';
      case 'edit': return 'from-purple-500 to-purple-600';
      case 'referral': return 'from-green-500 to-green-600';
      case 'daily': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTaskIcon = (type) => {
    switch(type) {
      case 'video': return '📹';
      case 'social': return '📱';
      case 'edit': return '✏️';
      case 'referral': return '👥';
      case 'daily': return '📅';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Tasks
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome back, {user?.first_name}!</span>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 ${
                task.completed ? 'opacity-75' : ''
              }`}
            >
              <div className={`bg-gradient-to-r ${getTaskColor(task.type)} p-4 text-white`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTaskIcon(task.type)}</span>
                    <h3 className="font-bold text-lg">{task.name}</h3>
                  </div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                    +{task.reward} FRW
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-4">
                  {task.type === 'video' && 'Watch a short video to earn rewards!'}
                  {task.type === 'social' && 'Follow us on social media to earn rewards!'}
                  {task.type === 'edit' && 'Edit SMS content for Miro App'}
                  {task.type === 'referral' && 'Invite friends to join Travolium'}
                  {task.type === 'daily' && 'Check in daily to earn bonus'}
                </p>
                
                {task.completed ? (
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center">
                    ✅ Completed
                  </div>
                ) : (
                  <button
                    onClick={() => startTask(task)}
                    disabled={loading[task.id]}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50"
                  >
                    {loading[task.id] ? 'Processing...' : 'Start Task'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showVideoModal && currentTask && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-white">📹</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Watch Video</h3>
              <p className="text-gray-600 mt-1">You'll earn {currentTask.reward} FRW after watching</p>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{timeLeft} seconds remaining</p>
              <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(30 - timeLeft) / 30 * 100}%` }}
                ></div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowVideoModal(false);
                setCurrentTask(null);
                setTimeLeft(0);
              }}
              className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg toast-slide ${
          message.includes('✅') ? 'bg-green-500' : message.includes('⚠️') ? 'bg-yellow-500' : 'bg-red-500'
        } text-white`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Tasks;