import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleGoogleSignin = async () => {
  try {
    const response = await axios.get('https://scio-planning.vercel.app/login');
    if (response.data && response.data.url) {
      window.location.href = response.data.url;
    } else {
      console.error('No authorization URL received');
    }
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    // Show error message to the user
  }
};
