import FacebookLogin from 'react-facebook-login';

const VideoPlayer = () => {
  const responseFacebook = (response) => {
    console.log(response);
  }

  return (
    <FacebookLogin
      appId="YOUR_APP_ID"
      autoLoad={true}
      fields="name,email,picture"
      callback={responseFacebook}
    />
  );
}