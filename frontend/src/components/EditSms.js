// Kuraho iyi line: import './EditSms.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditSms = () => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/tasks/edit', { content });
      setMessage('✅ Editing completed! +1000 FRW');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setMessage('❌ Error saving edit');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '40px',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2>SMS / Miro App Editor</h2>
        <p>Edit this content to earn 1,000 FRW</p>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write or edit your SMS content here..."
            rows="10"
            required
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              fontFamily: 'monospace',
              resize: 'vertical',
              marginBottom: '20px'
            }}
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{
              flex: 1,
              padding: '12px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              Save & Earn 1000 FRW
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} style={{
              flex: 1,
              padding: '12px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              Cancel
            </button>
          </div>
        </form>
        
        {message && <div style={{
          marginTop: '20px',
          padding: '10px',
          borderRadius: '5px',
          textAlign: 'center',
          background: '#d4edda',
          color: '#155724'
        }}>{message}</div>}
      </div>
    </div>
  );
};

export default EditSms;