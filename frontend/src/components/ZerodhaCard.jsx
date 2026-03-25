import { useState, useEffect } from 'react';
import { zerodhaService } from '../services/zerodhaService';

const ZerodhaCard = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    profile: null,
    loading: true,
    error: null
  });
  const [kiteUserId, setKiteUserId] = useState('');

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, loading: true }));
      const status = await zerodhaService.checkConnectionStatus();
      setConnectionStatus({
        connected: status.connected,
        profile: status.profile,
        loading: false,
        error: status.error || null
      });
    } catch (error) {
      setConnectionStatus({
        connected: false,
        profile: null,
        loading: false,
        error: error.message
      });
    }
  };

  const handleConnect = async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, loading: true }));
      const loginUrl = await zerodhaService.getLoginUrl(null, kiteUserId);
      window.location.href = loginUrl;
    } catch (error) {
      setConnectionStatus(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect your Zerodha account?')) {
      try {
        setConnectionStatus(prev => ({ ...prev, loading: true }));
        await zerodhaService.disconnect();
        setConnectionStatus({
          connected: false,
          profile: null,
          loading: false,
          error: null
        });
      } catch (error) {
        setConnectionStatus(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
      }
    }
  };





  if (connectionStatus.loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className={`w-3 h-3 rounded-full mr-2 ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <h3 className="text-lg font-semibold text-gray-900">
          {connectionStatus.connected ? 'Zerodha Connected' : 'Connect Zerodha'}
        </h3>
      </div>

      {connectionStatus.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm">{connectionStatus.error}</p>
        </div>
      )}

      {connectionStatus.connected && connectionStatus.profile ? (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">
              <strong>Name:</strong> {connectionStatus.profile.user_name}
            </p>
            <p className="text-green-800 text-sm">
              <strong>Account:</strong> {connectionStatus.profile.user_id}
            </p>
            <p className="text-green-800 text-sm">
              <strong>Broker:</strong> {connectionStatus.profile.broker}
            </p>
          </div>
                     <div className="flex space-x-2">
             <button 
               onClick={checkConnectionStatus}
               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
             >
               Refresh Status
             </button>
             <button 
               onClick={handleDisconnect}
               className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
             >
               Disconnect
             </button>

           </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-600 text-sm mb-4">
            Connect your Zerodha account to access your trading data and portfolio information.
          </p>
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:items-center">
            <input 
              type="text" 
              placeholder="Enter Kite Username (e.g. AB1234)" 
              value={kiteUserId}
              onChange={(e) => setKiteUserId(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={connectionStatus.loading}
            />
            <button 
              onClick={handleConnect}
              disabled={connectionStatus.loading || !kiteUserId}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap text-sm font-medium"
            >
              {connectionStatus.loading ? 'Connecting...' : 'Connect Account'}
            </button>
          </div>
          {!kiteUserId && (
            <p className="text-xs text-amber-600 mt-2">
              Please enter your Kite Username (Client ID) to proceed.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ZerodhaCard;
