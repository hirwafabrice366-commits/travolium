import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Deposit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [method, setMethod] = useState('mtn');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const generateTransactionId = () => {
    return 'TRAV' + Date.now() + Math.floor(Math.random() * 10000);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    
    if (!amount || depositAmount < 1000) {
      showMessage('Minimum deposit is 1,000 FRW', 'error');
      return;
    }
    
    if (!phoneNumber) {
      showMessage('Phone number is required', 'error');
      return;
    }
    
    setLoading(true);
    
    const newTransactionId = generateTransactionId();
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      const response = await axios.post(`${API_URL}/deposits`, {
        amount: depositAmount,
        method: method,
        phone: phoneNumber,
        transactionId: newTransactionId
      }, config);
      
      if (response.data.success) {
        setTransactionId(response.data.transactionId || newTransactionId);
        setShowSuccess(true);
        
        // Unlock bonus
        try {
          await axios.post(`${API_URL}/deposits/unlock-bonus`, {}, config);
        } catch (bonusErr) {
          console.log('Bonus unlock note:', bonusErr.message);
        }
        
        showMessage(`✅ Deposit of ${depositAmount.toLocaleString()} FRW submitted!`, 'success');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        showMessage(response.data.message || 'Deposit failed', 'error');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      showMessage(error.response?.data?.message || '❌ Deposit failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Travolium
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-73px)]">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/10">
          
          {!showSuccess ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg mb-4 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Make a Deposit</h2>
                <p className="text-gray-300 text-sm mt-1">Deposit to unlock your 21,000 FRW bonus!</p>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
                <p className="text-yellow-200 text-center text-sm">
                  💰 After deposit, your 21,000 FRW bonus will be UNLOCKED!
                </p>
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-lg text-center text-sm ${
                  messageType === 'success' 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/50'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Amount (FRW)</label>
                  <input
                    type="number"
                    placeholder="Enter amount (min 1,000)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1000"
                    step="500"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">Minimum deposit: 1,000 FRW</p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="0788XXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">You'll receive confirmation on this number</p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="loading-spinner-small"></div>
                      Processing...
                    </div>
                  ) : (
                    'Deposit Now'
                  )}
                </button>
              </form>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full mt-4 text-gray-400 hover:text-white transition text-sm"
              >
                ← Back to Dashboard
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Deposit Successful!</h2>
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
                <p className="text-green-300 text-sm">Transaction ID: {transactionId}</p>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-200 text-sm font-bold">🎉 21,000 FRW Bonus UNLOCKED!</p>
                <p className="text-gray-300 text-xs mt-1">You can now withdraw your earnings</p>
              </div>
              <p className="text-gray-400 text-sm mt-4">Redirecting to dashboard...</p>
              <div className="mt-4 animate-spin inline-block w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;