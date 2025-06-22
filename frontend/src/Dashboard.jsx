import { useState, useEffect } from 'react';
import { getCurrentUserId } from './userService';
import { useAuth } from './AuthContext';
import { Card, Button, Divider, Badge } from './components/UI';

function Dashboard() {
  const [history, setHistory] = useState({ posted: [], received: [] });
  const [stats, setStats] = useState({ totalPoundsSaved: 0, totalPoundsReceived: 0, totalTransactions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
    // Determine if user is a business (donor) or food bank (receiver)
  // First check the user type from auth context, fallback to checking donation history
  const isBusiness = user?.userType === 'business' || user?.type === 'business' || history.posted.length > history.received.length;
  
  useEffect(() => {
    const userId = getCurrentUserId();
    console.log('Current user ID:', userId);
    
    async function fetchUserHistory() {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching user history with token:', token.substring(0, 10) + '...');
        
        // Make actual API call
        console.log(userId, 'user ID for fetching history');
        console.log("Fetching user history from API...");
        const res = await fetch(`/api/users/${userId}/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          console.error(`API error: ${res.status}`);
          // Try to parse error message
          try {
            const errorData = await res.json();
            throw new Error(errorData.error || `Error: ${res.status}`);
          } catch (parseError) {
            throw new Error(`Server error: ${res.status}`);
          }
        }
        
        const data = await res.json();
        console.log('History data received:', data);
        
        // Ensure we have the correct data structure
        const historyData = data.history || { posted: [], received: [] };
        setHistory(historyData);
        
        // Always calculate stats from the actual data we received
        const posted = historyData.posted || [];
        const received = historyData.received || [];
        
        const totalPoundsSaved = posted.reduce((acc, d) => acc + (d.lbs || 0), 0);
        const totalPoundsReceived = received.reduce((acc, d) => acc + (d.lbs || 0), 0);
        
        const calculatedStats = {
          totalPoundsSaved,
          totalPoundsReceived,
          totalTransactions: posted.length + received.length
        };
        
        // Use either calculated stats or stats from API
        setStats(calculatedStats);
        setLoading(false);
        
        console.log(posted.length, 'posted donations found');
        console.log(received.length, 'received donations found');
      } catch (err) {
        console.error('Failed to fetch user history:', err);
        setError(`Failed to load history: ${err.message}`);
        setLoading(false);
        
        // Initialize with empty data instead of mock data
        setHistory({ posted: [], received: [] });
        setStats({
          totalPoundsSaved: 0,
          totalPoundsReceived: 0,
          totalTransactions: 0
        });
      }
    }
    
    fetchUserHistory();
  }, [token]);

  if (loading) {
    return <div className="text-center py-8">Loading your dashboard...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  // Calculate the food saved this month (simplified - would need date filtering)
  const totalImpact = isBusiness ? stats.totalPoundsSaved : stats.totalPoundsReceived;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Impact Dashboard</h2>
        {/* Main Impact Card - Highlighted and Larger */}
      <div className="bg-green-50 border-2 border-green-200 p-8 rounded-xl mb-6 text-center shadow-md">
        <div className="text-green-800 font-semibold mb-3">Food Saved From Landfill This Month</div>
        <div className="text-5xl font-bold text-green-700">{totalImpact.toFixed(1)} lbs</div>
        <div className="text-sm text-green-600 mt-3">Through {stats.totalTransactions} transactions</div>
      </div>
      
      {/* Secondary Stats - Based on user type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {isBusiness ? (
          <>
            <div className="bg-sage-light border border-sage-secondary p-4 rounded">
              <div className="text-sm text-sage-dark mb-1">All Time Food Donated</div>
              <div className="text-2xl font-bold text-sage-primary">{stats.totalPoundsSaved.toFixed(1)} lbs</div>
              <div className="text-xs text-sage-accent">{history.posted.length} donations</div>
            </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded">
              <div className="text-sm text-blue-700 mb-1">Environmental Impact</div>
              <div className="text-2xl font-bold text-blue-800">
                {Math.round(totalImpact * 0.9)} kg CO₂ saved
              </div>
              <div className="text-xs text-blue-600">≈ {Math.round(totalImpact/10)} trees planted</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded">
              <div className="text-sm text-blue-700 mb-1">Food Received</div>
              <div className="text-2xl font-bold text-blue-800">{stats.totalPoundsReceived.toFixed(1)} lbs</div>
              <div className="text-xs text-blue-600">{history.received.length} claims</div>
            </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded">
              <div className="text-sm text-amber-700 mb-1">Meals Provided</div>
              <div className="text-2xl font-bold text-amber-800">
                {Math.round(totalImpact * 0.75)}
              </div>
              <div className="text-xs text-amber-600">Based on 1.3 lbs per meal</div>
            </div>
          </>
        )}
      </div>
      
      {/* Show only relevant history based on user type */}
      {isBusiness ? (
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-3">Your Donations</h3>
          {history.posted.length === 0 ? (
            <p className="text-gray-500">You haven't made any donations yet.</p>
          ) : (
            <div className="space-y-2">
              {history.posted.map((donation, i) => (
                <div key={i} className="bg-green-50 border border-green-100 p-3 rounded">
                  <div className="font-medium">{donation.item}</div>
                  <div className="text-sm">
                    {donation.lbs} lbs • {new Date(donation.postedAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {donation.claimed ? 'Claimed' : 'Available'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3 className="font-bold text-lg mb-3">Food You've Received</h3>
          {history.received.length === 0 ? (
            <p className="text-gray-500">You haven't claimed any donations yet.</p>
          ) : (
            <div className="space-y-2">
              {history.received.map((donation, i) => (
                <div key={i} className="bg-blue-50 border border-blue-100 p-3 rounded">
                  <div className="font-medium">{donation.item}</div>
                  <div className="text-sm">
                    {donation.lbs} lbs • Claimed on {new Date(donation.claimedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;