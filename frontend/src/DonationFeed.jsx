import { useEffect, useState } from 'react';
import { kgToLbs } from './utils';
import { getCurrentUserId, isOwnDonation } from './userService';

function DonationFeed() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchDonations = async () => {
    setLoading(true);
    setError('');
    try {
      // Get auth token from localStorage and ensure it's properly formatted
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Ensure the token is properly formatted with Bearer prefix
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const res = await fetch('/api/donations', {
        headers: {
          'Authorization': authHeader
        }
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      // Update the state with the fetched donations
      setDonations(data);
      console.log('Loaded donations:', data);
     
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to load donations: ${err.message}`);
      // Initialize with empty array instead of mock data
      setDonations([]);
    
    } finally {
      setLoading(false);
    }
  };
  
  // Register the refresh function globally so donation form can trigger it
  useEffect(() => {
    window.refreshDonations = fetchDonations;
    return () => {
      // Clean up when component unmounts
      window.refreshDonations = null;
    };
  }, []);
    
  useEffect(() => {
    fetchDonations();
  }, []);

  const handleClaimDonation = async (donationId, donorId) => {
    if (!donationId) return;
    
    try {
      // Get the current user ID from our service
      const receiverId = getCurrentUserId();
      
      // Check if user is trying to claim their own donation
      if (receiverId === donorId) {
        alert('You cannot claim your own donation.');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be signed in to claim a donation');
        return;
      }
      
      const res = await fetch('/api/donations/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ donationId, receiverId })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Status: ${res.status}`);
      }
      
      // Remove the claimed donation from the list
      setDonations(donations.filter(d => d.id !== donationId));
    } catch (err) {
      console.error('Claim error:', err);
      alert(`Failed to claim donation: ${err.message}`);
    }
  };

  if (loading) return <div className="p-4">Loading donations...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!donations.length) return <div className="p-4">No donations available.</div>;  return (
    <div className="space-y-3">
      <h2 className="font-bold text-xl mb-4 text-sage-dark">Available Donations</h2>
      
      {/* Filter Options UI */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-sage-dark mb-3">Filter Donations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Distance Filter */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Distance</label>
            <select 
              className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-sage-primary"
            >
              <option value="all">Any Distance</option>
              <option value="5miles">Within 5 km</option>
              <option value="10miles">Within 10 km</option>
              <option value="25miles">Within 25 km</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Coming soon: Location-based filtering</p>
          </div>
          
          {/* Food Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Food Category</label>
            <select 
              className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-sage-primary"
            >
              <option value="all">All Categories</option>
              <option value="produce">Produce</option>
              <option value="dairy">Dairy</option>
              <option value="prepared">Prepared Foods</option>
              <option value="baked">Baked Goods</option>
              <option value="canned">Packaged/Canned</option>
            </select>
          </div>
          
          {/* Expiry/Pickup Timeline */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Pickup Timeline</label>
            <select 
              className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-sage-primary"
            >
              <option value="all">Any Time</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this-week">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {donations.map((d, i) => {
        const isOwn = isOwnDonation(d);
        return (
          <div key={i} 
               className={`${isOwn ? 'bg-sage-light border-l-4 border-sage-primary' : 'bg-white border-l-4 border-sage-secondary'} 
                         rounded-xl shadow-md p-4 transition-all hover:shadow-lg
                         flex flex-col md:flex-row md:items-center md:justify-between`}>
            <div>
              <div className="font-semibold text-sage-dark flex items-center">
                {d.item}
                {isOwn && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Your donation
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">Qty: {d.quantity} | {d.lbs || kgToLbs(d.weight)} lbs</div>
              <div className="text-xs text-gray-500">Pickup: {new Date(d.pickupTime).toLocaleString()}</div>
              {d.address && <div className="text-xs text-gray-500">Location: {d.address}</div>}
            </div>
            {!isOwn ? (
              <button 
                onClick={() => handleClaimDonation(d.id, d.donorId)}
                className="mt-3 md:mt-0 bg-sage-primary text-white px-4 py-2 text-sm rounded-xl hover:bg-green-600 transition-colors duration-200 font-medium shadow-sm">
                Claim
              </button>
            ) : (
              <div className="mt-2 md:mt-0 text-sm text-sage-primary font-medium">Your donation</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DonationFeed;
