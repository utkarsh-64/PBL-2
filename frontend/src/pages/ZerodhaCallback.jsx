import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zerodhaService } from '../services/zerodhaService';

const ZerodhaCallback = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestToken = urlParams.get('request_token');
    const action = urlParams.get('action');
    const loginStatus = urlParams.get('status');

    // Check if this is a valid Zerodha callback
    if (action === 'login' && loginStatus === 'success' && requestToken) {
      try {
        setStatus('processing');
        
        // Handle the callback
        const result = await zerodhaService.handleCallback(requestToken);
        console.log('Callback result:', result);
        
        // Set success status
        setStatus('success');
        
        // Get the return URL from service (which retrieves from sessionStorage)
        const returnUrl = zerodhaService.getReturnUrl();
        
        // Show success message for 2 seconds, then redirect
        setTimeout(() => {
          if (returnUrl) {
            navigate(returnUrl, { replace: true });
          } else {
            // Default fallback
            navigate('/dashboard', { replace: true });
          }
        }, 2000);
        
      } catch (error) {
        console.error('Zerodha callback error:', error);
        setStatus('error');
        
        // Handle specific error cases
        if (error.message && error.message.includes('TOKEN_EXPIRED')) {
          setError('The connection request has expired. Please try connecting again from the dashboard.');
        } else if (error.message && error.message.includes('TOKEN_ALREADY_PROCESSED')) {
          // Token already processed - treat as success
          setStatus('success');
          setError(null);
          
          const returnUrl = zerodhaService.getReturnUrl();
          setTimeout(() => {
            if (returnUrl) {
              navigate(returnUrl, { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }, 2000);
          return;
        } else {
          setError(error.message || 'Failed to connect Zerodha account. Please try again.');
        }
        
        // Get return URL for error case too
        const returnUrl = zerodhaService.getReturnUrl();
        
        // Redirect after showing error for 4 seconds
        setTimeout(() => {
          if (returnUrl) {
            navigate(returnUrl, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 4000);
      }
    } else {
      // Not a valid callback, redirect immediately
      console.log('Not a valid Zerodha callback, redirecting to dashboard');
      const returnUrl = zerodhaService.getReturnUrl();
      if (returnUrl) {
        navigate(returnUrl, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-blue-100">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Connecting Your Account
            </h2>
            <p className="text-gray-600 mb-2">
              Please wait while we securely connect your Zerodha account...
            </p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-green-100">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Successfully Connected! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              Your Zerodha account has been linked successfully. You can now access your portfolio data.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-800 text-sm font-medium">
                ✅ Account verification complete
              </p>
            </div>
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-red-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'We encountered an issue connecting your Zerodha account.'}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">
                💡 You can try connecting again from your dashboard
              </p>
            </div>
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ZerodhaCallback;