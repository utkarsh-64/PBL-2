import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { angelOneService } from '../services/angelOneService';

const AngelOneCallback = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth_token');
    const feedToken = urlParams.get('feed_token');
    const refreshToken = urlParams.get('refresh_token');

    if (authToken && feedToken) {
      try {
        setStatus('processing');
        
        // Send tokens to backend to save
        await angelOneService.handleCallback(authToken, feedToken, refreshToken);
        
        setStatus('success');
        
        // Redirect to profile page after 2 seconds
        setTimeout(() => {
          navigate('/home/profile', { replace: true });
        }, 2000);
        
      } catch (err) {
        console.error('Angel One callback error:', err);
        setStatus('error');
        setError(err.message || 'Failed to securely link Angel One account.');
        
        setTimeout(() => {
          navigate('/home/profile', { replace: true });
        }, 4000);
      }
    } else {
      // Invalid callback
      navigate('/home/profile', { replace: true });
    }
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-orange-100 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Connecting Account</h2>
          <p className="text-gray-600">Securely linking your Angel One portfolio...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Successfully Connected! 🎉</h2>
          <p className="text-gray-600 mb-4">Your Angel One account is linked.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
           <h2 className="text-2xl font-bold text-gray-900 mb-3">Connection Failed</h2>
           <p className="text-gray-600 mb-4">{error}</p>
           <p className="text-sm text-gray-500">Redirecting back...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AngelOneCallback;
