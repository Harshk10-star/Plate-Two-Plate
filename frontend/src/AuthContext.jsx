import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        // Handle corrupt storage
        console.error('Error parsing stored user data', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);
  const signin = async (email, password) => {
    try {
      // Make API request to signin endpoint
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      console.log('Sign in request:', { email, password }, response.ok);      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed');
      }
      // If token is prefixed with Bearer, strip it before storing
      let jwtToken = data.token;
      if (jwtToken && jwtToken.startsWith('Bearer ')) {
        jwtToken = jwtToken.replace('Bearer ', '');
      }
      // Store in state
      setUser(data.user);
      setToken(jwtToken);
      setIsAuthenticated(true);
        // Store in local storage
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Sync userId to sessionStorage for consistency
      sessionStorage.setItem('userId', data.user.id);
      
      return data.user;
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  };
  const signup = async (name, email, password, userType = 'business') => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, userType }),
      });
      console.log('Sign up request:', { name, email, password, userType }, response.ok);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }
      
      return await signin(email, password); // Auto sign-in after signup
    } catch (err) {
      console.error('Sign up error:', err);
      throw err;
    }
  };

  const signout = () => {
    // Clear auth state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Remove from storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        signin,
        signup,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);