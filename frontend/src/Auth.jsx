import { useState } from 'react';
import { useAuth } from './AuthContext';
import SignIn from './SignIn';
import SignUp from './SignUp';

function Auth() {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const { isAuthenticated, user, signout } = useAuth();
  
  // Handle successful authentication
  const handleAuthSuccess = () => {
    console.log('Authentication successful');
    console.log('User:', user);
  };
  
  // Display user info if already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Your Account</h2>
        
        <div className="bg-green-50 p-4 rounded shadow-sm mb-6">          <div className="font-medium text-green-800">Signed in as:</div>
          <div className="mt-1">{user.name}</div>
          <div className="text-sm text-gray-600">{user.email}</div>
          <div className="text-xs mt-1 text-gray-500">
            Account Type: {user.userType === 'foodbank' ? 'Food Bank' : 'Business'}
          </div>
        </div>
        
        <button
          onClick={signout}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Tab selection */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'signin' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('signin')}
        >
          Sign In
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'signup' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('signup')}
        >
          Create Account
        </button>
      </div>
      
      {/* Active form */}
      {activeTab === 'signin' ? (
        <SignIn onSuccess={handleAuthSuccess} />
      ) : (
        <SignUp onSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default Auth;