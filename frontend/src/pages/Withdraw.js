import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Withdraw = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [method, setMethod] = useState('mtn');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchBalance = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { 'x-auth-token': token }
      });
      setBalance(response.data.user.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(user?.balance || 0);
    }
  }, [API_URL, user?.balance]);

  const fetchWithdrawalHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/withdrawals`, {
        headers: { 'x-auth-token': token }
      });
      setWithdrawalHistory(response.data.withdrawals || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchBalance();
    fetchWithdrawalHistory();
  }, [fetchBalance, fetchWithdrawalHistory]);

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
    
    const withdrawAmount = parseFloat(amount);
    const currentBalance = parseFloat(balance);
    
    if (!amount || withdrawAmount < 1000) {
      showMessage('Minimum withdrawal is 1,000 FRW', 'error');
      return;
    }
    
    if (withdrawAmount > currentBalance) {
      showMessage(`Insufficient balance. Your balance is ${currentBalance.toLocaleString()} FRW`, 'error');
      return;
    }
    
    if (!phoneNumber) {
      showMessage('Phone number is required', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/withdrawals`, {
        amount: withdrawAmount,
        phone: phoneNumber,
        method: method
      }, { headers: { 'x-auth-token': token } });
      
      if (response.data.success) {
        showMessage(`✅ Withdrawal request of ${withdrawAmount.toLocaleString()} FRW submitted successfully!`, 'success');
        setAmount('');
        fetchBalance();
        fetchWithdrawalHistory();
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || '❌ Withdrawal failed. Please try again.';
      showMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const canWithdraw = user?.deposit_status === true;

  if (!canWithdraw) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Not Available</h2>
          <p className="text-indigo-200 mb-4">You need to make a deposit first to unlock withdrawals</p>
          <button
            onClick={() => navigate('/deposit')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition"
          >
            Make a Deposit
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-3 text-indigo-300 hover:text-white transition text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg mb-4 mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
          <p className="text-indigo-200 text-sm mt-1">Withdraw your earnings</p>
        </div>

        <div className="bg-white/5 rounded-lg p-4 mb-6 text-center">
          <p className="text-indigo-200 text-sm">Available Balance</p>
          <p className="text-3xl font-bold text-white">{balance.toLocaleString()} FRW</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center text-sm ${
            messageType === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/50' : 'bg-red-500/20 text-red-200 border border-red-500/50'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-2">Amount (FRW)</label>
            <input
              type="number"
              placeholder="Enter amount (min 1,000)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
              max={balance}
              step="500"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
            <p className="text-indigo-300 text-xs mt-1">Min: 1,000 FRW | Max: {balance.toLocaleString()} FRW</p>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="0788XXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
            <p className="text-indigo-300 text-xs mt-1">Money will be sent to this number</p>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="mtn">MTN Mobile Money</option>
              <option value="airtel">Airtel Money</option>
              <option value="bank">Bank Transfer (1-3 days)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 btn-click"
          >
            {loading ? 'Processing...' : 'Withdraw Now'}
          </button>
        </form>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-4 text-indigo-300 hover:text-white transition text-sm"
        >
          ← Back to Dashboard
        </button>

        {withdrawalHistory.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/20">
            <h3 className="text-white text-sm font-semibold mb-3">Recent Withdrawals</h3>
            <div className="space-y-2">
              {withdrawalHistory.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-indigo-300">{new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="text-white font-semibold">{item.amount?.toLocaleString()} FRW</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                    item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;