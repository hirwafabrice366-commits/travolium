import React, { useEffect, useRef } from 'react';

const FacebookLogin = ({ appId, onSuccess, onFailure, children }) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [appId]);

  const handleLogin = () => {
    if (window.FB) {
      window.FB.login((response) => {
        if (response.authResponse) {
          if (onSuccess) onSuccess(response);
        } else {
          if (onFailure) onFailure(response);
        }
      }, { scope: 'public_profile,email' });
    } else {
      setTimeout(handleLogin, 100);
    }
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        backgroundColor: '#1877f2',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        justifyContent: 'center'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
      </svg>
      {children || 'Login with Facebook'}
    </button>
  );
};

export default FacebookLogin;