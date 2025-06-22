import { useState } from 'react';
import { useAuth } from './AuthContext';

function SignIn({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('All fields are required');
      return;
    }
    
    setLoading(true);
    
    try {
      await signin(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  // For demo purposes
  const handleDemoSignIn = async () => {
    setEmail('user@example.com');
    setPassword('password123');
    
    try {
      setLoading(true);
      await signin('user@example.com', 'password123');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Demo sign in failed. Please try manual sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Sign In</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className={`w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <div className="text-center">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="text-sm text-blue-600 hover:underline"
          >
            Use Demo Account
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignIn;