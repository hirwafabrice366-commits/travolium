import React, { useState, useEffect } from 'react';
import FacebookLogin from './FacebookLogin';

const VideoPlayer = ({ video, onComplete }) => {
  const [isWatching, setIsWatching] = useState(false);
  const [progress, setProgress] = useState(0);

  const completeWatch = () => {
    if (onComplete) {
      onComplete();
    }
  };

  useEffect(() => {
    if (progress >= 100) {
      completeWatch();
    }
  }, [progress]);

  const responseFacebook = (response) => {
    console.log('Facebook login success:', response);
    setIsWatching(true);
  };

  if (!isWatching) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Watch this video to earn points</h2>
        <p>Login with Facebook to start watching</p>
        <FacebookLogin
          appId="YOUR_FACEBOOK_APP_ID"
          onSuccess={responseFacebook}
          onFailure={(error) => console.log('Login failed:', error)}
        >
          Login to Watch Video
        </FacebookLogin>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>Video Player</h3>
      <video
        controls
        onTimeUpdate={(e) => {
          const percent = (e.currentTarget.currentTime / e.currentTarget.duration) * 100;
          setProgress(percent);
        }}
        style={{ width: '100%', maxWidth: '800px' }}
      >
        <source src={video?.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div style={{ marginTop: '10px' }}>
        <progress value={progress} max="100" style={{ width: '100%' }} />
        <p>Progress: {Math.round(progress)}%</p>
      </div>
    </div>
  );
};

export default VideoPlayer;