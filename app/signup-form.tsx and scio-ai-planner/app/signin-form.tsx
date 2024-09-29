import axios from 'axios';

const handleGoogleSignup = async () => {
  try {
    const response = await axios.get('http://localhost:8000/login');
    if (response.data && response.data.url) {
      window.location.href = response.data.url;
    } else {
      console.error('No authorization URL received');
    }
  } catch (error) {
    console.error('Error during Google signup:', error);
    // Show error message to the user
  }
};