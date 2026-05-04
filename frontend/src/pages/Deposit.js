import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Deposit.css';

const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mtn');
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/deposits', {
        amount: parseFloat(amount),
        method
      });
      setMessage('✅ Deposit request sent! Admin will approve soon.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setMessage('❌ Error processing deposit');
    }
  };

  return (
    <div className="deposit-container">
      <div className="deposit-card">
        <h2>Make a Deposit</h2>
        <p>Deposit to unlock your 21,000 FRW bonus!</p>
        
        <div className="bonus-info">
          <h3>💰 21,000 FRW Bonus Available!</h3>
          <p>After your first deposit, the bonus becomes withdrawable</p>
        </div>

        {message && <div className="message">{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Amount (FRW)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1000"
            required
          />
          
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="mtn">MTN Mobile Money</option>
            <option value="airtel">Airtel Money</option>
            <option value="bank">Bank Transfer</option>
          </select>
          
          <button type="submit">Submit Deposit</button>
        </form>
        
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Deposit;