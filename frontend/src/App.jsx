import { useState, useEffect } from 'react'
import './App.css'
import DonationForm from './DonationForm';
import ImpactCard from './ImpactCard';
import DonationFeed from './DonationFeed';
import Dashboard from './Dashboard';
import Auth from './Auth';
import { getCurrentUserId, switchUser } from './userService';
import { useAuth } from './AuthContext';

function App() {
  const [latestDonation, setLatestDonation] = useState(null);
  const [activeTab, setActiveTab] = useState('donate'); // 'donate', 'available', 'dashboard'
  const [userId, setUserId] = useState(getCurrentUserId());
  const { isAuthenticated, user, loading } = useAuth();

  // Redirect to the auth page if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setActiveTab('account');
    }
  }, [isAuthenticated, loading]);

  // Handle user switching for testing - for development only
  const handleSwitchUser = () => {
    const newUserId = switchUser();
    setUserId(newUserId);
    window.location.reload(); // Reload to reset all components with new user ID
  };
  
  // Set the correct active tab based on user type when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.userType) {
      console.log('User type:', user.userType);
      if (user.userType === 'business') {
        setActiveTab('donate');
      } else if (user.userType === 'foodbank') {
        setActiveTab('available');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [isAuthenticated, user]);

  // Set up a global handler that the DonationForm can call
  useEffect(() => {
    window.onDonationSuccess = (data) => {
      // Create a donation object that matches what ImpactCard expects
      console.log('Donation success data:', data);
      setLatestDonation({
        donorId: getCurrentUserId(),
        lbs: data.poundsSaved,
        impactMessage: data.aiMessage
      });
    };

    return () => {
      window.onDonationSuccess = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-sage-light flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4 text-sage-primary">Plate-Two-Plate</h1>
      
      {/* User Authentication & ID Display */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600">
          {isAuthenticated ? (
            <>User: <span className="font-semibold">{user?.name || 'Anonymous'}</span></>
          ) : (
            <>Please sign in to use all features</>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('account')}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            {isAuthenticated ? 'My Account' : 'Sign In'}
          </button>

        </div>
      </div>
      
      {/* Navigation Tabs - Only show when authenticated and based on user type */}
      {isAuthenticated ? (
        <div className="w-full max-w-4xl flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow flex overflow-hidden">
            {/* Show Donate Food tab only for businesses */}
            {(user?.userType === 'business') && (
              <button 
                onClick={() => setActiveTab('donate')}
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition ${
                  activeTab === 'donate' 
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Donate Food
              </button>
            )}
            
            {/* Show Available Donations tab only for food banks */}
            {user?.userType === 'foodbank' && (
              <button 
                onClick={() => setActiveTab('available')}
                className={`px-6 py-3 font-medium text-sm focus:outline-none transition ${
                  activeTab === 'available'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Available Donations
              </button>
            )}
            
            {/* Always show Impact Dashboard tab */}
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium text-sm focus:outline-none transition ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Impact Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl py-3 px-4 mb-6 bg-amber-50 border border-amber-200 rounded text-center">
          <p className="text-amber-800">Please sign in or create an account to access all features.</p>
        </div>
      )}
      
      {/* Active Tab Content */}
      <div className="w-full max-w-4xl">
        {activeTab === 'donate' && (
          <>
            {isAuthenticated ? (
              <>
                <div className="w-full bg-white rounded shadow p-4 mb-6">
                  <DonationForm />
                </div>
                {latestDonation && <ImpactCard latestDonation={latestDonation} />}
              </>
            ) : (
              <div className="bg-white rounded shadow p-6 text-center">
                <p className="mb-4 text-gray-600">Please sign in to donate food.</p>
                <button 
                  onClick={() => setActiveTab('account')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Sign In / Create Account
                </button>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'available' && (
          <div className="w-full bg-white rounded shadow p-4">
            {isAuthenticated ? (
              <DonationFeed />
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-gray-600">Please sign in to view available donations.</p>
                <button 
                  onClick={() => setActiveTab('account')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Sign In / Create Account
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div className="w-full bg-white rounded shadow p-4">
            {isAuthenticated ? (
              <Dashboard />
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-gray-600">Please sign in to view your impact dashboard.</p>
                <button 
                  onClick={() => setActiveTab('account')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Sign In / Create Account
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'account' && (
          <div className="w-full bg-white rounded shadow p-4">
            <Auth />
          </div>
        )}
      </div>
    </div>
  );
}

export default App
